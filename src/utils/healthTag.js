// Helper function to determine health tag based on calories or use provided tag
export const getHealthTag = (cals, providedTag) => {
  // If tag is provided, use it
  if (providedTag) {
    const tagMap = {
      'Healthy': { label: 'Healthy', color: 'bg-amber-50 text-slate-500' },
      'Moderate Healthy': { label: 'Moderate Healthy', color: 'bg-yellow-100 text-yellow-700' },
      'Guilty Pleasure': { label: 'Guilty Pleasure', color: 'bg-pink-100 text-pink-700' }
    };
    return tagMap[providedTag] || tagMap['Healthy'];
  }
  // Otherwise calculate from calories
  if (cals <= 320) return { label: 'Healthy', color: 'bg-amber-50 text-slate-500' };
  if (cals <= 400) return { label: 'Moderate Healthy', color: 'bg-yellow-100 text-yellow-700' };
  return { label: 'Guilty Pleasure', color: 'bg-pink-100 text-pink-700' };
};
