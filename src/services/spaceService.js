// Space service - handles space management (no auth required)
import { 
  doc, 
  setDoc, 
  getDoc,
  onSnapshot 
} from 'firebase/firestore';
import { appId } from '../config/firebase';
import { generateMenuId } from '../utils/menuId';

const SPACE_STORAGE_KEY = 'cleaneats_currentSpaceId';

/**
 * Get the current space ID from localStorage
 * @returns {string|null} Current space ID or null
 */
export const getCurrentSpaceId = () => {
  try {
    return localStorage.getItem(SPACE_STORAGE_KEY);
  } catch (e) {
    console.error("Error getting current space ID:", e);
    return null;
  }
};

/**
 * Set the current space ID in localStorage
 * @param {string} spaceId - Space ID to set
 */
export const setCurrentSpaceId = (spaceId) => {
  try {
    if (spaceId) {
      localStorage.setItem(SPACE_STORAGE_KEY, spaceId);
    } else {
      localStorage.removeItem(SPACE_STORAGE_KEY);
    }
  } catch (e) {
    console.error("Error setting current space ID:", e);
  }
};

/**
 * Create a new space
 * @param {Object} db - Firestore database instance
 * @param {string} name - Optional space name (display name)
 * @returns {Promise<string>} The generated space ID (code)
 */
export const createSpace = async (db, name = 'My Space') => {
  if (!db) throw new Error('Firestore not initialized');
  
  // Generate a short random space code
  let spaceId = generateMenuId();
  
  // Check if space already exists (very unlikely, but safe)
  const spaceRef = doc(db, `/artifacts/${appId}/spaces`, spaceId);
  const spaceDoc = await getDoc(spaceRef);
  
  if (spaceDoc.exists()) {
    // Regenerate once if collision
    spaceId = generateMenuId();
  }
  
  // Create the space document with a separate display name
  await setDoc(spaceRef, {
    name: name,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
  
  // Set as current space
  setCurrentSpaceId(spaceId);
  
  return spaceId;
};

/**
 * Join an existing space
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID to join
 * @returns {Promise<boolean>} True if space exists and joined successfully
 */
export const joinSpace = async (db, spaceId) => {
  if (!db || !spaceId) return false;
  
  try {
    const spaceRef = doc(db, `/artifacts/${appId}/spaces`, spaceId);
    const spaceDoc = await getDoc(spaceRef);
    
    if (spaceDoc.exists()) {
      setCurrentSpaceId(spaceId);
      return true;
    }
    return false;
  } catch (e) {
    console.error("Error joining space:", e);
    return false;
  }
};

/**
 * Get space data
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID
 * @returns {Promise<Object|null>} Space data or null if not found
 */
export const getSpace = async (db, spaceId) => {
  if (!db || !spaceId) return null;
  
  try {
    const spaceRef = doc(db, `/artifacts/${appId}/spaces`, spaceId);
    const spaceDoc = await getDoc(spaceRef);
    
    if (spaceDoc.exists()) {
      return {
        id: spaceDoc.id,
        ...spaceDoc.data()
      };
    }
    return null;
  } catch (e) {
    console.error("Error getting space:", e);
    return null;
  }
};

/**
 * Subscribe to space data changes
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID
 * @param {Function} callback - Callback function to receive space data
 * @returns {Function} Unsubscribe function
 */
export const subscribeToSpace = (db, spaceId, callback) => {
  if (!db || !spaceId) {
    console.warn('Firestore or spaceId not available');
    return () => {};
  }

  const spaceRef = doc(db, `/artifacts/${appId}/spaces`, spaceId);
  
  return onSnapshot(spaceRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({
        id: snapshot.id,
        ...snapshot.data()
      });
    } else {
      callback(null); // Space doesn't exist
    }
  }, (error) => {
    console.error("Error listening to space:", error);
    callback(null);
  });
};

