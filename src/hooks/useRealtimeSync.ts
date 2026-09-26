import { useState, useEffect, useRef, useCallback } from 'react';
import { AppState } from '../types';
import {
  saveUserStateToFirestore,
  fetchUserStateFromFirestore,
  subscribeToUserState,
  AuthUser,
} from '../services/firebase';
import {
  saveAppState,
  loadAppState,
  getLastLocalUpdateTimestamp,
  setLastLocalUpdateTimestamp,
} from '../services/storage';

export interface UseRealtimeSyncOptions {
  authUser: AuthUser | null;
  isOwnerAuthorized: boolean;
  onToast?: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export function useRealtimeSync({
  authUser,
  isOwnerAuthorized,
  onToast,
}: UseRealtimeSyncOptions) {
  const [state, setStateInternal] = useState<AppState>(() => loadAppState());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced' | 'error'>('idle');

  // Track the timestamp of the latest local mutation vs remote snapshot
  const localTimestampRef = useRef<number>(getLastLocalUpdateTimestamp() || Date.now());
  const isIncomingRemoteUpdate = useRef<boolean>(false);
  const isInitialMount = useRef<boolean>(true);
  const stateRef = useRef<AppState>(state);
  stateRef.current = state;

  // Custom setState wrapper that tags local mutations
  const updateState = useCallback(
    (action: AppState | ((prev: AppState) => AppState)) => {
      const now = Date.now();
      localTimestampRef.current = now;
      setLastLocalUpdateTimestamp(now);

      setStateInternal((prev) => {
        const next = typeof action === 'function' ? action(prev) : action;
        stateRef.current = next;
        saveAppState(next, now);
        return next;
      });
    },
    []
  );

  // Push local changes to cloud with a debounce
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    // If this state change was caused by an incoming remote snapshot, don't echo it back!
    if (isIncomingRemoteUpdate.current) {
      isIncomingRemoteUpdate.current = false;
      return;
    }

    if (!authUser || !isOwnerAuthorized) return;

    const currentTimestamp = localTimestampRef.current;
    setIsSyncing(true);
    setSyncStatus('syncing');

    const debounceTimer = setTimeout(async () => {
      try {
        await saveUserStateToFirestore(authUser.uid, stateRef.current, currentTimestamp);
        setLastSyncedAt(new Date());
        setSyncStatus('synced');
      } catch (err) {
        console.warn('Realtime push failed:', err);
        setSyncStatus('error');
      } finally {
        setIsSyncing(false);
      }
    }, 400);

    return () => clearTimeout(debounceTimer);
  }, [state, authUser, isOwnerAuthorized]);

  // Real-time remote updates subscription
  useEffect(() => {
    if (!authUser || !isOwnerAuthorized) {
      setSyncStatus('idle');
      return;
    }

    // Initial server fetch to synchronize any off-screen changes immediately on login
    const pullInitial = async () => {
      try {
        setIsSyncing(true);
        const remote = await fetchUserStateFromFirestore(authUser.uid);
        if (remote && remote.state && Array.isArray(remote.state.seats) && remote.state.seats.length > 0) {
          const remoteTime = remote.updatedAt || 0;
          const localTime = localTimestampRef.current || 0;

          // If remote has newer data or if local is empty/initial
          const localStudentCount = stateRef.current.students?.length || 0;
          const remoteStudentCount = remote.state.students?.length || 0;

          if (remoteTime >= localTime || (localStudentCount === 0 && remoteStudentCount > 0)) {
            isIncomingRemoteUpdate.current = true;
            localTimestampRef.current = remoteTime || Date.now();
            setLastLocalUpdateTimestamp(localTimestampRef.current);
            setStateInternal(remote.state);
            saveAppState(remote.state, localTimestampRef.current);
            setLastSyncedAt(new Date());
            setSyncStatus('synced');
          }
        }
      } catch (err) {
        console.warn('Initial server pull error:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    pullInitial();

    // Subscribe to live Firestore snapshots
    const unsubscribe = subscribeToUserState(
      authUser.uid,
      (remoteState, remoteUpdatedAt) => {
        if (!remoteState || !Array.isArray(remoteState.seats) || remoteState.seats.length === 0) {
          return;
        }

        const localTime = localTimestampRef.current || 0;
        const isRemoteNewer = remoteUpdatedAt > localTime;
        const localStudentsCount = stateRef.current.students?.length || 0;
        const remoteStudentsCount = remoteState.students?.length || 0;

        // Apply if remote is newer or has records that local lacks
        if (isRemoteNewer || (localStudentsCount === 0 && remoteStudentsCount > 0)) {
          isIncomingRemoteUpdate.current = true;
          localTimestampRef.current = remoteUpdatedAt;
          setLastLocalUpdateTimestamp(remoteUpdatedAt);
          setStateInternal(remoteState);
          saveAppState(remoteState, remoteUpdatedAt);
          setLastSyncedAt(new Date());
          setSyncStatus('synced');
        }
      },
      (err) => {
        console.warn('Realtime subscription notification:', err);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [authUser?.uid, isOwnerAuthorized]);

  // Off-screen & tab visibility / focus real-time sync handler
  useEffect(() => {
    if (!authUser || !isOwnerAuthorized) return;

    const handleRevalidation = async () => {
      try {
        setIsSyncing(true);
        const remote = await fetchUserStateFromFirestore(authUser.uid);
        if (remote && remote.state && Array.isArray(remote.state.seats)) {
          const remoteTime = remote.updatedAt || 0;
          const localTime = localTimestampRef.current || 0;

          if (remoteTime > localTime) {
            isIncomingRemoteUpdate.current = true;
            localTimestampRef.current = remoteTime;
            setLastLocalUpdateTimestamp(remoteTime);
            setStateInternal(remote.state);
            saveAppState(remote.state, remoteTime);
            setLastSyncedAt(new Date());
            setSyncStatus('synced');
            if (onToast) {
              onToast('Real-time sync updated with latest changes from your other device', 'info');
            }
          }
        }
      } catch (err) {
        console.warn('Off-screen revalidation error:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleRevalidation();
      }
    };

    const handleWindowFocus = () => {
      handleRevalidation();
    };

    const handleOnline = () => {
      handleRevalidation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('online', handleOnline);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
      window.removeEventListener('online', handleOnline);
    };
  }, [authUser, isOwnerAuthorized, onToast]);

  // Manual Force Pull / Push
  const forceSync = useCallback(async () => {
    if (!authUser || !isOwnerAuthorized) {
      if (onToast) onToast('Please sign in to sync with cloud', 'info');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('syncing');
    try {
      const remote = await fetchUserStateFromFirestore(authUser.uid);
      if (remote && remote.state && Array.isArray(remote.state.seats)) {
        const remoteTime = remote.updatedAt || 0;
        const localTime = localTimestampRef.current || 0;

        if (remoteTime >= localTime) {
          isIncomingRemoteUpdate.current = true;
          localTimestampRef.current = remoteTime;
          setLastLocalUpdateTimestamp(remoteTime);
          setStateInternal(remote.state);
          saveAppState(remote.state, remoteTime);
        } else {
          // Push local state to remote
          await saveUserStateToFirestore(authUser.uid, stateRef.current, localTime);
        }
      } else {
        // First cloud sync: push current state
        await saveUserStateToFirestore(authUser.uid, stateRef.current, localTimestampRef.current);
      }
      setLastSyncedAt(new Date());
      setSyncStatus('synced');
      if (onToast) onToast('Real-time cloud sync completed across all devices!', 'success');
    } catch (err) {
      console.warn('Manual forceSync error:', err);
      setSyncStatus('error');
      if (onToast) onToast('Failed to sync. Please check your connection.', 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [authUser, isOwnerAuthorized, onToast]);

  return {
    state,
    setState: updateState,
    isSyncing,
    lastSyncedAt,
    syncStatus,
    forceSync,
  };
}
