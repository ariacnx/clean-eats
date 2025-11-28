// Recipe service - handles all recipe-related Firebase operations
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { appId } from '../config/firebase';

/**
 * Subscribe to shared recipes collection
 * @param {Object} db - Firestore database instance
 * @param {Function} callback - Callback function to receive recipes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToRecipes = (db, callback) => {
  if (!db) {
    console.warn('Firestore not initialized');
    return () => {};
  }

  const recipesRef = collection(db, `/artifacts/${appId}/sharedRecipes`);
  
  return onSnapshot(recipesRef, (snapshot) => {
    const recipes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(recipes);
  }, (error) => {
    console.error("Error listening to recipes:", error);
  });
};

/**
 * Add a new recipe to Firebase
 * @param {Object} db - Firestore database instance
 * @param {Object} recipe - Recipe data
 * @returns {Promise<string>} Document ID
 */
export const addRecipe = async (db, recipe) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const recipesRef = collection(db, `/artifacts/${appId}/sharedRecipes`);
  const docRef = await addDoc(recipesRef, recipe);
  return docRef.id;
};

/**
 * Update an existing recipe
 * @param {Object} db - Firestore database instance
 * @param {string} recipeId - Recipe document ID
 * @param {Object} updates - Fields to update
 */
export const updateRecipe = async (db, recipeId, updates) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const recipeRef = doc(db, `/artifacts/${appId}/sharedRecipes`, recipeId);
  await updateDoc(recipeRef, updates);
};

/**
 * Delete a recipe
 * @param {Object} db - Firestore database instance
 * @param {string} recipeId - Recipe document ID
 */
export const deleteRecipe = async (db, recipeId) => {
  if (!db) throw new Error('Firestore not initialized');
  
  const recipeRef = doc(db, `/artifacts/${appId}/sharedRecipes`, recipeId);
  await deleteDoc(recipeRef);
};

/**
 * Check if a recipe ID is a Firebase document ID
 * @param {string|number} id - Recipe ID
 * @returns {boolean}
 */
export const isFirebaseRecipeId = (id) => {
  return id && typeof id === 'string' && id.length >= 20 && !id.startsWith('local_');
};

