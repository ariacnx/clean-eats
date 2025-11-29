/**
 * Generate an image prompt for Gemini based on dish information
 * @param {string} dishName - Name of the dish
 * @returns {string} Formatted prompt for Gemini image generation
 */
export const getDishImagePrompt = (dishName) => {
  const safeName = (dishName || 'the').trim();
  return `A minimalist line drawing, rendered in dark brown ink on textured, cream-colored paper, showing ${safeName} dish. The sketch features flowing, hand-drawn lines depicting several slices of the dish. The style is elegant and sparse, suitable for a fine dining menu illustration. The image should be square (1:1 aspect ratio) with the dish centered. No text, no labels, no words should appear in the image - only the visual illustration of the dish.`;
};

