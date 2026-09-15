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
  getFirestore,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { AppState } from '../types';

// Safely initialize Firebase App singleton without throwing top-level errors
let app: FirebaseApp | null = null;
export let auth: Auth | null = null;
export let googleProvider: GoogleAuthProvider | null = null;
export let db: Firestore | null = null;

try {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account',
  });
  db =
    firebaseConfig.firestoreDatabaseId &&
    firebaseConfig.firestoreDatabaseId !== '(default)'
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
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
 */
export async function signInWithGoogle(): Promise<FirebaseUser> {
  if (!auth || !googleProvider) {
    throw new Error('Firebase Authentication is currently offline. Please check your network or open in a new tab.');
  }

  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    // Safely record/update user profile in Firestore
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
    if (err.code === 'auth/unauthorized-domain') {
      throw new Error('This domain is awaiting Firebase OAuth authorization. Please open the app in a new tab to test.');
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
  await setDoc(
    workspaceRef,
    {
      ...state,
      updatedAt: new Date().toISOString(),
    },
    { merge: true }
  );
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
