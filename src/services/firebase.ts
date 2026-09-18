import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState } from '../types';
import { isAuthorizedAdmin, getAccessDeniedMessage } from './authGuard';

export interface FirebaseConfigParams {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  firestoreDatabaseId?: string;
}

const CUSTOM_CONFIG_KEY = 'studyspace_custom_firebase_config';

export function getStoredCustomFirebaseConfig(): FirebaseConfigParams | null {
  try {
    const raw = localStorage.getItem(CUSTOM_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.apiKey === 'string' && parsed.apiKey.trim() && parsed.projectId) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse custom firebase config from localStorage:', e);
  }
  return null;
}

export function saveCustomFirebaseConfig(config: FirebaseConfigParams): void {
  localStorage.setItem(CUSTOM_CONFIG_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem(CUSTOM_CONFIG_KEY);
  window.location.reload();
}

export function getActiveFirebaseConfig(): FirebaseConfigParams {
  const custom = getStoredCustomFirebaseConfig();
  if (custom) return custom;

  // Check for explicit VITE_FIREBASE_API_KEY override if provided (e.g. in custom build envs)
  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const procEnv = typeof process !== 'undefined' && process.env ? process.env : {};

  const explicitFirebaseApiKey =
    metaEnv.VITE_FIREBASE_API_KEY ||
    procEnv.VITE_FIREBASE_API_KEY;

  if (explicitFirebaseApiKey) {
    const envProjectId =
      metaEnv.VITE_FIREBASE_PROJECT_ID ||
      procEnv.VITE_FIREBASE_PROJECT_ID ||
      firebaseConfig.projectId;

    return {
      apiKey: explicitFirebaseApiKey,
      authDomain: metaEnv.VITE_FIREBASE_AUTH_DOMAIN || procEnv.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      storageBucket: metaEnv.VITE_FIREBASE_STORAGE_BUCKET || procEnv.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.firebasestorage.app`,
      appId: metaEnv.VITE_FIREBASE_APP_ID || procEnv.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
      messagingSenderId: metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || procEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
      firestoreDatabaseId: firebaseConfig.firestoreDatabaseId || '(default)',
    };
  }

  // Always fallback to the official provisioned Firebase config from firebase-applet-config.json
  return firebaseConfig as FirebaseConfigParams;
}

const activeConfig = getActiveFirebaseConfig();

// Safely initialize Firebase App singleton without throwing top-level errors
let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let googleProvider: GoogleAuthProvider | null = null;
export let db: Firestore | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(activeConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  
  const customDbId = activeConfig.firestoreDatabaseId && activeConfig.firestoreDatabaseId !== '(default)' 
    ? activeConfig.firestoreDatabaseId 
    : undefined;

  try {
    if (customDbId) {
      db = initializeFirestore(app, { ignoreUndefinedProperties: true }, customDbId);
    } else {
      db = initializeFirestore(app, { ignoreUndefinedProperties: true });
    }
  } catch (initErr) {
    // If already initialized with defaults, fallback to getFirestore
    db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
} catch (e) {
  console.warn('Firebase initialization skipped or fell back to local offline mode:', e);
}

export type AuthUser = FirebaseUser;

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Sign in with Google popup (Gmail account)
 * Validates against the authorized administrator email whitelist
 */
export async function signInWithGoogle(customAllowedEmail?: string): Promise<FirebaseUser> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is currently offline. Please check your network or open in a new tab.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Strict Admin Authorization Check
    const isAuthorized = isAuthorizedAdmin(user.email, customAllowedEmail);
    if (!isAuthorized) {
      // Immediately sign out from Firebase session to prevent unauthorized access and state locking
      try {
        await signOut(auth);
      } catch (signOutErr) {
        console.warn('Silent sign-out cleanup error:', signOutErr);
      }
      throw new Error(getAccessDeniedMessage());
    }

    // Safely record/update authorized admin user profile in Firestore
    if (db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await setDoc(
          userRef,
          {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'admin',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      } catch (profileErr) {
        console.warn('Note: Could not immediately update user profile in Firestore:', profileErr);
      }
    }

    return user;
  } catch (error: unknown) {
    const err = error as { code?: string; message?: string };
    let isInIframe = false;
    try {
      isInIframe = typeof window !== 'undefined' && window.self !== window.top;
    } catch {
      isInIframe = true;
    }

    // If it is already an Access Denied error, re-throw as is
    if (err.message && err.message.includes('Access Denied')) {
      throw new Error(err.message);
    }

    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in window was closed. Please try again when ready.');
    }
    if (err.code === 'auth/popup-blocked') {
      throw new Error(
        isInIframe
          ? 'Sign-in pop-up was blocked inside the preview frame. Please open the app in a new browser tab to sign in.'
          : 'Sign-in pop-up was blocked by your browser. Please allow popups for this site.'
      );
    }
    if (err.code === 'auth/cancelled-popup-request') {
      throw new Error('Previous sign-in request cancelled.');
    }
    if (err.code === 'auth/network-request-failed') {
      throw new Error('Network connection issue. Please check your internet connection.');
    }
    if (err.code === 'auth/api-key-expired' || (err.message && err.message.toLowerCase().includes('api key expired'))) {
      throw new Error('Google Firebase project API key needs renewal. In the meantime, your study hall data is safely saved on this device, and you can download offline backups from Settings.');
    }
    if (err.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      throw new Error(`Domain "${currentHost}" is not authorized in your Firebase Project. Please add "${currentHost}" under Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
    }
    throw new Error(err.message || 'Failed to sign in with Google. Please try again.');
  }
}

/**
 * Sign out the current user
 */
export async function logOutUser(): Promise<void> {
  if (auth) {
    await signOut(auth);
  }
}

/**
 * Save current study hall AppState to Firestore for authenticated user
 */
export async function saveUserStateToFirestore(
  userId: string,
  state: AppState
): Promise<void> {
  if (!userId || !db) return;
  const workspaceRef = doc(db, 'users', userId, 'workspace', 'data');
  // Deep-sanitize payload to remove any undefined values before writing to Firestore
  const sanitized = JSON.parse(
    JSON.stringify({
      business: state.business,
      shifts: state.shifts || [],
      plans: state.plans || [],
      seats: state.seats || [],
      students: state.students || [],
      memberships: state.memberships || [],
      payments: state.payments || [],
      expenses: state.expenses || [],
      updatedAt: new Date().toISOString(),
    })
  );

  await setDoc(workspaceRef, sanitized, { merge: true });
}

/**
 * Fetch study hall AppState from Firestore for authenticated user
 */
export async function fetchUserStateFromFirestore(
  userId: string
): Promise<AppState | null> {
  if (!userId || !db) return null;
  const workspaceRef = doc(db, 'users', userId, 'workspace', 'data');
  const snapshot = await getDoc(workspaceRef);

  if (snapshot.exists()) {
    const data = snapshot.data();
    if (data && Array.isArray(data.seats)) {
      return {
        business: data.business,
        shifts: data.shifts || [],
        plans: data.plans || [],
        seats: data.seats || [],
        students: data.students || [],
        memberships: data.memberships || [],
        payments: data.payments || [],
        expenses: data.expenses || [],
      } as AppState;
    }
  }

  return null;
}

/**
 * Real-time listener for remote user state updates in Firestore
 */
export function subscribeToUserState(
  userId: string,
  onUpdate: (state: AppState) => void,
  onError?: (error: Error) => void
): () => void {
  if (!userId || !db) return () => {};

  const workspaceRef = doc(db, 'users', userId, 'workspace', 'data');
  const unsubscribe = onSnapshot(
    workspaceRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data && Array.isArray(data.seats)) {
          const loaded: AppState = {
            business: data.business,
            shifts: data.shifts || [],
            plans: data.plans || [],
            seats: data.seats || [],
            students: data.students || [],
            memberships: data.memberships || [],
            payments: data.payments || [],
            expenses: data.expenses || [],
          };
          onUpdate(loaded);
        }
      }
    },
    (err) => {
      console.warn('Firestore subscription error:', err);
      if (onError) onError(err);
    }
  );

  return unsubscribe;
}
