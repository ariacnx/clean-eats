// Default recipes data
export const DEFAULT_RECIPES = [
  // CHICKEN
  { id: 1, name: "Lemon Herb Grilled Chicken", cuisine: "Mediterranean", protein: "Chicken", cals: 320, time: "25m", img: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Thai Green Curry Chicken", cuisine: "Chinese", protein: "Chicken", cals: 450, time: "40m", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Chicken Fajita Bowl", cuisine: "Mexican", protein: "Chicken", cals: 380, time: "20m", img: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&q=80&w=800" },
  
  // BEEF
  { id: 4, name: "Mediterranean Beef Kebabs", cuisine: "Mediterranean", protein: "Beef", cals: 390, time: "25m", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800" },
  
  // FISH
  { id: 5, name: "Miso Glazed Salmon", cuisine: "Japanese", protein: "Fish", cals: 420, time: "25m", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" },
  
  // VEGETARIAN
  { id: 6, name: "Greek Chickpea Salad", cuisine: "Mediterranean", protein: "Vegetarian", cals: 290, time: "10m", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
  { id: 7, name: "Tofu Vegetable Curry", cuisine: "Japanese", protein: "Vegetarian", cals: 360, time: "30m", img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
];

// Inspiration recipes - 4 default dishes to copy to new spaces
export const INSPIRATION_RECIPES = [
  DEFAULT_RECIPES[0],  // Lemon Herb Grilled Chicken (Chicken, Mediterranean)
  DEFAULT_RECIPES[6],  // Miso Glazed Salmon (Fish, Asian)
  DEFAULT_RECIPES[4], // Greek Chickpea Salad (Vegetarian, Mediterranean)
  DEFAULT_RECIPES[3],  // Steak & Asparagus Stir-Fry (Beef, Asian)
];

