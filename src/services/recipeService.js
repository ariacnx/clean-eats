// Recipe service - handles all recipe-related Firebase operations (per-space)
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
 * Subscribe to recipes for a specific space
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID
 * @param {Function} callback - Callback function to receive recipes
 * @returns {Function} Unsubscribe function
 */
export const subscribeToRecipes = (db, spaceId, callback) => {
  if (!db || !spaceId) {
    console.warn('Firestore or spaceId not initialized');
    return () => {};
  }

  const recipesRef = collection(db, `/artifacts/${appId}/spaces/${spaceId}/recipes`);
  
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
 * Add a new recipe to a space
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID
 * @param {Object} recipe - Recipe data
 * @returns {Promise<string>} Document ID
 */
export const addRecipe = async (db, spaceId, recipe) => {
  if (!db || !spaceId) throw new Error('Firestore or spaceId not initialized');
  
  const recipesRef = collection(db, `/artifacts/${appId}/spaces/${spaceId}/recipes`);
  const docRef = await addDoc(recipesRef, recipe);
  return docRef.id;
};

/**
 * Update an existing recipe in a space
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID
 * @param {string} recipeId - Recipe document ID
 * @param {Object} updates - Fields to update
 */
export const updateRecipe = async (db, spaceId, recipeId, updates) => {
  if (!db || !spaceId) throw new Error('Firestore or spaceId not initialized');
  
  const recipeRef = doc(db, `/artifacts/${appId}/spaces/${spaceId}/recipes`, recipeId);
  await updateDoc(recipeRef, updates);
};

/**
 * Delete a recipe from a space
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID
 * @param {string} recipeId - Recipe document ID
 */
export const deleteRecipe = async (db, spaceId, recipeId) => {
  if (!db || !spaceId) throw new Error('Firestore or spaceId not initialized');
  
  const recipeRef = doc(db, `/artifacts/${appId}/spaces/${spaceId}/recipes`, recipeId);
  await deleteDoc(recipeRef);
};

/**
 * Copy default recipes to a new space
 * @param {Object} db - Firestore database instance
 * @param {string} spaceId - Space ID
 * @param {Array} defaultRecipes - Array of default recipe objects
 * @returns {Promise<void>}
 */
export const copyDefaultRecipesToSpace = async (db, spaceId, defaultRecipes) => {
  if (!db || !spaceId) throw new Error('Firestore or spaceId not initialized');
  if (!defaultRecipes || defaultRecipes.length === 0) return;

  const recipesRef = collection(db, `/artifacts/${appId}/spaces/${spaceId}/recipes`);
  
  // Copy each default recipe to the space
  const promises = defaultRecipes.map(async (recipe) => {
    // Remove the numeric id from default recipes, Firestore will generate its own
    const { id, ...recipeData } = recipe;
    await addDoc(recipesRef, {
      ...recipeData,
      isDefault: true, // Mark as default recipe
      createdAt: Date.now()
    });
  });

  await Promise.all(promises);
};

/**
 * Check if a recipe ID is a Firebase document ID
 * @param {string|number} id - Recipe ID
 * @returns {boolean}
 */
export const isFirebaseRecipeId = (id) => {
  return id && typeof id === 'string' && id.length >= 20 && !id.startsWith('local_');
};

