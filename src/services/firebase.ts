import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  User as FirebaseUser,
  Auth,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
  setDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState, Business } from '../types';
import { isAuthorizedAdmin, getAccessDeniedMessage } from './authGuard';
import { getCleanInitialData } from './demoData';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
}

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

  return firebaseConfig as FirebaseConfigParams;
}

const activeConfig = getActiveFirebaseConfig();

// Initialize Firebase App singleton
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

  db = customDbId ? getFirestore(app, customDbId) : getFirestore(app);

  // Test connection on boot per Firebase skill guidelines
  const testConnDoc = doc(db, 'test', 'connection');
  getDocFromServer(testConnDoc).catch((err) => {
    if (err instanceof Error && err.message.includes('the client is offline')) {
      console.warn('Firebase client is offline, working with cached/local storage.');
    }
  });
} catch (e) {
  console.warn('Firebase initialization note:', e);
}

export type AuthUser = FirebaseUser;

export interface AuthState {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
}

/**
 * Sign in with Google popup (Gmail account)
 * Validates strictly against the authorized administrator whitelist
 */
export async function signInWithGoogle(customAllowedEmail?: string): Promise<FirebaseUser> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is currently offline. Please check your network connection.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Strict Admin Authorization Check
    const isAuthorized = isAuthorizedAdmin(user.email, customAllowedEmail);
    if (!isAuthorized) {
      try {
        await signOut(auth);
      } catch (signOutErr) {
        console.warn('Silent sign-out cleanup error:', signOutErr);
      }
      throw new Error(getAccessDeniedMessage());
    }

    // Safely record/update authorized admin user profile in Firestore
    if (db) {
      const userRef = doc(db, 'users', user.uid);
      try {
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
        handleFirestoreError(profileErr, OperationType.WRITE, `users/${user.uid}`);
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

    if (err.message && err.message.includes('Access Denied')) {
      throw new Error(err.message);
    }

    if (err.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in window was closed. Please try again.');
    }
    if (err.code === 'auth/popup-blocked') {
      throw new Error(
        isInIframe
          ? 'Sign-in pop-up was blocked inside the preview frame. Please open the app in a new browser window/tab to sign in.'
          : 'Sign-in pop-up was blocked by your browser. Please allow popups for this site.'
      );
    }
    if (err.code === 'auth/cancelled-popup-request') {
      throw new Error('Previous sign-in request was cancelled.');
    }
    if (err.code === 'auth/network-request-failed') {
      throw new Error('Network connection issue. Please check your internet connection.');
    }
    if (err.code === 'auth/unauthorized-domain') {
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : 'this domain';
      throw new Error(`Domain "${currentHost}" is not authorized in your Firebase Project. Please add "${currentHost}" in Firebase Console -> Authentication -> Settings -> Authorized Domains.`);
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
 * Common shared workspace document path for seamless cross-device synchronization (Vercel <-> Google AI Studio <-> Mobile)
 */
const SHARED_WORKSPACE_PATH = 'workspaces/admin_main';

export interface CloudStatePayload {
  business: AppState['business'];
  shifts: AppState['shifts'];
  plans: AppState['plans'];
  seats: AppState['seats'];
  students: AppState['students'];
  memberships: AppState['memberships'];
  payments: AppState['payments'];
  expenses: AppState['expenses'];
  updatedAt: number;
  updatedAtIso: string;
}

/**
 * Save study hall AppState to Firestore for cross-device real-time sync
 */
export async function saveUserStateToFirestore(
  userId: string,
  state: AppState,
  clientTimestamp?: number
): Promise<void> {
  if (!db) return;

  const nowMs = clientTimestamp || Date.now();
  const payload: CloudStatePayload = {
    business: state.business,
    shifts: state.shifts || [],
    plans: state.plans || [],
    seats: state.seats || [],
    students: state.students || [],
    memberships: state.memberships || [],
    payments: state.payments || [],
    expenses: state.expenses || [],
    updatedAt: nowMs,
    updatedAtIso: new Date(nowMs).toISOString(),
  };

  // Deep sanitize to prevent any undefined values
  const sanitized = JSON.parse(JSON.stringify(payload));

  const writePromises: Promise<unknown>[] = [];

  // Write to shared admin workspace (primary cross-device hub)
  const sharedWorkspaceRef = doc(db, 'workspaces', 'admin_main');
  writePromises.push(
    setDoc(sharedWorkspaceRef, sanitized, { merge: true }).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, SHARED_WORKSPACE_PATH);
    })
  );

  // Also write to user-specific workspace
  if (userId) {
    const userWorkspaceRef = doc(db, 'users', userId, 'workspace', 'data');
    writePromises.push(
      setDoc(userWorkspaceRef, sanitized, { merge: true }).catch((err) => {
        handleFirestoreError(err, OperationType.WRITE, `users/${userId}/workspace/data`);
      })
    );
  }

  await Promise.allSettled(writePromises);
}

/**
 * Direct Server Fetch for study hall AppState from Firestore
 */
export async function fetchUserStateFromFirestore(
  userId: string
): Promise<{ state: AppState; updatedAt: number } | null> {
  if (!db) return null;

  // 1. First try shared admin main workspace
  try {
    const sharedRef = doc(db, 'workspaces', 'admin_main');
    const snap = await getDocFromServer(sharedRef);
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.seats)) {
        return {
          state: {
            business: { ...getCleanInitialData().business, ...((data.business as Partial<Business>) || {}) },
            shifts: data.shifts || [],
            plans: data.plans || [],
            seats: data.seats || [],
            students: data.students || [],
            memberships: data.memberships || [],
            payments: data.payments || [],
            expenses: data.expenses || [],
          },
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
        };
      }
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, SHARED_WORKSPACE_PATH);
  }

  // 2. Fallback to user-scoped workspace
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId, 'workspace', 'data');
      const snap = await getDocFromServer(userRef);
      if (snap.exists()) {
        const data = snap.data();
        if (data && Array.isArray(data.seats)) {
          return {
            state: {
              business: { ...getCleanInitialData().business, ...((data.business as Partial<Business>) || {}) },
              shifts: data.shifts || [],
              plans: data.plans || [],
              seats: data.seats || [],
              students: data.students || [],
              memberships: data.memberships || [],
              payments: data.payments || [],
              expenses: data.expenses || [],
            },
            updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : 0,
          };
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, `users/${userId}/workspace/data`);
    }
  }

  return null;
}

/**
 * Real-time continuous listener for remote workspace updates across all devices
 */
export function subscribeToUserState(
  userId: string,
  onUpdate: (state: AppState, updatedAt: number) => void,
  onError?: (error: Error) => void
): () => void {
  if (!db) return () => {};

  const unsubscribers: (() => void)[] = [];

  // Helper to parse snapshot data
  const handleSnapshot = (snap: { exists: () => boolean; data: () => Record<string, unknown> | undefined }) => {
    if (snap.exists()) {
      const data = snap.data();
      if (data && Array.isArray(data.seats)) {
        const loadedState: AppState = {
          business: { ...getCleanInitialData().business, ...((data.business as Partial<Business>) || {}) },
          shifts: (data.shifts as AppState['shifts']) || [],
          plans: (data.plans as AppState['plans']) || [],
          seats: data.seats as AppState['seats'],
          students: (data.students as AppState['students']) || [],
          memberships: (data.memberships as AppState['memberships']) || [],
          payments: (data.payments as AppState['payments']) || [],
          expenses: (data.expenses as AppState['expenses']) || [],
        };
        const updatedAt = typeof data.updatedAt === 'number' ? data.updatedAt : Date.now();
        onUpdate(loadedState, updatedAt);
      }
    }
  };

  // 1. Subscribe to shared admin workspace
  try {
    const sharedRef = doc(db, 'workspaces', 'admin_main');
    const unsubShared = onSnapshot(
      sharedRef,
      (snapshot) => {
        handleSnapshot(snapshot as never);
      },
      (err) => {
        handleFirestoreError(err, OperationType.GET, SHARED_WORKSPACE_PATH);
        if (onError) onError(err);
      }
    );
    unsubscribers.push(unsubShared);
  } catch (err) {
    console.warn('Could not attach shared workspace listener:', err);
  }

  // 2. Also subscribe to user workspace if userId provided
  if (userId) {
    try {
      const userRef = doc(db, 'users', userId, 'workspace', 'data');
      const unsubUser = onSnapshot(
        userRef,
        (snapshot) => {
          handleSnapshot(snapshot as never);
        },
        (err) => {
          handleFirestoreError(err, OperationType.GET, `users/${userId}/workspace/data`);
        }
      );
      unsubscribers.push(unsubUser);
    } catch (err) {
      console.warn('Could not attach user workspace listener:', err);
    }
  }

  return () => {
    unsubscribers.forEach((unsub) => unsub());
  };
}
