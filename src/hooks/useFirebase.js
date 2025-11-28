import { useState, useEffect } from 'react';
import { initializeFirebase, getFirebaseAuth, getFirebaseDb, signInAnonymously, onAuthStateChanged } from '../services/firebase';

/**
 * Custom hook to manage Firebase initialization and authentication
 * @returns {object} { isAuthReady, userId, db, auth }
 */
export const useFirebase = () => {
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);

  useEffect(() => {
    // Initialize Firebase
    const { app, auth: authInstance, db: dbInstance } = initializeFirebase();
    setAuth(authInstance);
    setDb(dbInstance);

    // Set timeout to prevent indefinite loading
    const timeoutId = setTimeout(() => {
      if (!isAuthReady) {
        console.warn('Firebase initialization taking too long, proceeding without it.');
        setIsAuthReady(true);
      }
    }, 5000);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(authInstance, async (user) => {
      clearTimeout(timeoutId);
      
      if (user) {
        setUserId(user.uid);
        setIsAuthReady(true);
      } else {
        // Try anonymous sign-in
        try {
          const userCredential = await signInAnonymously(authInstance);
          setUserId(userCredential.user.uid);
          setIsAuthReady(true);
        } catch (error) {
          console.error('Anonymous sign-in failed:', error);
          setIsAuthReady(true); // Continue even if auth fails
        }
      }
    });

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, []);

  return { isAuthReady, userId, db, auth };
};

