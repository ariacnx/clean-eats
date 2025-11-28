// Menu service - handles all menu-related Firebase operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDoc,
  onSnapshot 
} from 'firebase/firestore';
import { appId } from '../config/firebase';

/**
 * Subscribe to user's saved menus
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {Function} callback - Callback function to receive menus
 * @returns {Function} Unsubscribe function
 */
export const subscribeToMenus = (db, userId, callback) => {
  if (!db || !userId) {
    console.warn('Firestore or userId not available');
    return () => {};
  }

  const menusRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
  
  return onSnapshot(menusRef, (snapshot) => {
    const menus = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(menus);
  }, (error) => {
    console.error("Error listening to saved menus:", error);
  });
};

/**
 * Save user's current menu
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {Array<string>} menuIds - Array of recipe IDs
 */
export const saveCurrentMenu = async (db, userId, menuIds) => {
  if (!db || !userId) return;
  
  const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data`, 'userData');
  await updateDoc(userDocRef, {
    currentMenu: menuIds,
    lastUpdated: Date.now()
  }, { merge: true });
};

/**
 * Create a new saved menu
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} name - Menu name
 * @param {Array<string>} recipeIds - Array of recipe IDs
 * @returns {Promise<string>} Menu document ID
 */
export const createMenu = async (db, userId, name, recipeIds) => {
  if (!db || !userId) throw new Error('Firestore or userId not available');
  
  const menusRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
  const docRef = await addDoc(menusRef, {
    name,
    recipeIds,
    createdAt: Date.now()
  });
  return docRef.id;
};

/**
 * Update menu name
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} menuId - Menu document ID
 * @param {string} newName - New menu name
 */
export const updateMenuName = async (db, userId, menuId, newName) => {
  if (!db || !userId) throw new Error('Firestore or userId not available');
  
  const menuRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
  await updateDoc(menuRef, { name: newName.trim() });
};

/**
 * Add recipe to a menu
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} menuId - Menu document ID
 * @param {string} recipeId - Recipe ID to add
 */
export const addRecipeToMenu = async (db, userId, menuId, recipeId) => {
  if (!db || !userId) throw new Error('Firestore or userId not available');
  
  const menuRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
  const menuDoc = await getDoc(menuRef);
  
  if (menuDoc.exists()) {
    const menuData = menuDoc.data();
    if (!menuData.recipeIds.includes(recipeId)) {
      await updateDoc(menuRef, {
        recipeIds: [...menuData.recipeIds, recipeId]
      });
    }
  }
};

/**
 * Delete a menu
 * @param {Object} db - Firestore database instance
 * @param {string} userId - User ID
 * @param {string} menuId - Menu document ID
 */
export const deleteMenu = async (db, userId, menuId) => {
  if (!db || !userId) throw new Error('Firestore or userId not available');
  
  const menuRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
  await deleteDoc(menuRef);
};

