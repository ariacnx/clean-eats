/**
 * Menu ID Generation Utility
 * Generates short, unique IDs for menus (like "abc123")
 */

const CHARS = 'abcdefghijklmnopqrstuvwxyz0123456789';
const ID_LENGTH = 6;

/**
 * Generate a random menu ID
 * @returns {string} A 6-character alphanumeric ID (e.g., "abc123")
 */
export const generateMenuId = () => {
  let id = '';
  for (let i = 0; i < ID_LENGTH; i++) {
    id += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return id;
};

/**
 * Validate a menu ID format
 * @param {string} id - Menu ID to validate
 * @returns {boolean} True if valid format
 */
export const isValidMenuId = (id) => {
  return typeof id === 'string' && 
         id.length === ID_LENGTH && 
         /^[a-z0-9]+$/.test(id);
};


