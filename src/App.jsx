import React, { useState, useEffect } from 'react';
import { 
  Utensils, 
  Dna, 
  RefreshCw, 
  Heart, 
  Trash2, 
  ArrowLeft,
  ShoppingBag,
  Flame,
  Clock,
  BookOpen,
  Calendar,
  Save,
  Loader2,
  List,
  Plus,
  X
} from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInAnonymously, 
  signInWithCustomToken, 
  onAuthStateChanged 
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc,
  addDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  collection, 
  query, 
  where 
} from 'firebase/firestore';

// --- DATA: Clean Eating Recipes (Default) ---
const DEFAULT_RECIPES = [
  // CHICKEN
  { id: 1, name: "Lemon Herb Grilled Chicken", cuisine: "Mediterranean", protein: "Chicken", cals: 320, time: "25m", img: "https://images.unsplash.com/photo-1632778149955-e80f8ceca2e8?auto=format&fit=crop&q=80&w=800" },
  { id: 2, name: "Thai Green Curry Chicken", cuisine: "Asian", protein: "Chicken", cals: 450, time: "40m", img: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&q=80&w=800" },
  { id: 3, name: "Chicken Fajita Bowl", cuisine: "Mexican", protein: "Chicken", cals: 380, time: "20m", img: "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&q=80&w=800" },
  { id: 4, name: "Balsamic Glazed Chicken", cuisine: "Italian", protein: "Chicken", cals: 340, time: "35m", img: "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&q=80&w=800" },
  
  // BEEF
  { id: 5, name: "Steak & Asparagus Stir-Fry", cuisine: "Asian", protein: "Beef", cals: 410, time: "20m", img: "https://images.unsplash.com/photo-1543340713-17b2ae519450?auto=format&fit=crop&q=80&w=800" },
  { id: 6, name: "Carne Asada Lettuce Wraps", cuisine: "Mexican", protein: "Beef", cals: 350, time: "30m", img: "https://images.unsplash.com/photo-1541544744-375cfed75489?auto=format&fit=crop&q=80&w=800" },
  { id: 7, name: "Mediterranean Beef Kebabs", cuisine: "Mediterranean", protein: "Beef", cals: 390, time: "25m", img: "https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?auto=format&fit=crop&q=80&w=800" },
  
  // FISH
  { id: 8, name: "Miso Glazed Salmon", cuisine: "Asian", protein: "Fish", cals: 420, time: "25m", img: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800" },
  { id: 9, name: "Baked Cod with Salsa Verde", cuisine: "Mediterranean", protein: "Fish", cals: 280, time: "20m", img: "https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=800" },
  { id: 10, name: "Fish Taco Salad", cuisine: "Mexican", protein: "Fish", cals: 340, time: "15m", img: "https://images.unsplash.com/photo-1512838243191-e62534c66ec3?auto=format&fit=crop&q=80&w=800" },
  
  // VEGETARIAN
  { id: 11, name: "Quinoa Stuffed Peppers", cuisine: "Mexican", protein: "Vegetarian", cals: 310, time: "45m", img: "https://images.unsplash.com/photo-1628205167699-23847e231185?auto=format&fit=crop&q=80&w=800" },
  { id: 12, name: "Greek Chickpea Salad", cuisine: "Mediterranean", protein: "Vegetarian", cals: 290, time: "10m", img: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=800" },
  { id: 13, name: "Tofu Vegetable Curry", cuisine: "Asian", protein: "Vegetarian", cals: 360, time: "30m", img: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80&w=800" },
];

const CUISINES = ["All", "Mediterranean", "Asian", "Mexican", "Italian"];
const PROTEINS = ["All", "Chicken", "Beef", "Fish", "Vegetarian"];

// Placeholder for Firebase/Auth instances
let db = null;
let auth = null;

// --- COMPONENTS ---

// 1. Slot Machine Reel Component
const SlotReel = ({ value, label, isSpinning, icon: Icon }) => (
  <div className="flex flex-col items-center gap-2 w-1/3">
    <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{label}</span>
    <div className={`relative w-full h-24 bg-white rounded-xl border-2 border-emerald-100 flex items-center justify-center overflow-hidden shadow-sm transition-all duration-300 ${isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <div className={`absolute inset-0 bg-emerald-50/50 flex flex-col items-center justify-center transition-transform duration-100 ${isSpinning ? 'animate-pulse translate-y-1' : 'translate-y-0'}`}>
        <Icon size={28} className="text-emerald-500 mb-1" />
        <span className="font-bold text-gray-800 text-sm text-center px-1 truncate w-full">{isSpinning ? "..." : value}</span>
      </div>
    </div>
  </div>
);

// 2. The Main App Component
export default function CleanPlateCasino() {
  // Load recipes from localStorage or use defaults
  const loadRecipes = () => {
    try {
      const saved = localStorage.getItem('cleaneats_recipes');
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.length > 0 ? parsed : DEFAULT_RECIPES;
      }
    } catch (e) {
      console.error("Error loading recipes:", e);
    }
    return DEFAULT_RECIPES;
  };

  // Load user data from localStorage
  const loadUserData = () => {
    try {
      const savedFavorites = localStorage.getItem('cleaneats_favorites');
      const savedDailyMenu = localStorage.getItem('cleaneats_dailyMenu');
      return {
        favorites: savedFavorites ? JSON.parse(savedFavorites) : [],
        dailyMenu: savedDailyMenu ? JSON.parse(savedDailyMenu) : []
      };
    } catch (e) {
      console.error("Error loading user data:", e);
      return { favorites: [], dailyMenu: [] };
    }
  };

  const [recipes, setRecipes] = useState(() => loadRecipes());
  const [view, setView] = useState('casino'); // 'casino', 'favorites', 'browse', or 'dailyMenu'
  const userData = loadUserData();
  const [savedIds, setSavedIds] = useState(userData.favorites); // User Favorites
  const [dailyMenuIds, setDailyMenuIds] = useState(userData.dailyMenu); // Today's Menu
  const [templates, setTemplates] = useState([]); // Saved Menu Templates
  
  const [currentRecipe, setCurrentRecipe] = useState(() => {
    const loaded = loadRecipes();
    return loaded[0] || DEFAULT_RECIPES[0];
  });
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Lock filters for Casino/Browse
  const [lockCuisine, setLockCuisine] = useState("All");
  const [lockProtein, setLockProtein] = useState("All");

  // State for the template name (Crucial for obeying Rules of Hooks)
  const [templateName, setTemplateName] = useState(''); 

  // Grouping Mode for Favorites
  const [groupBy, setGroupBy] = useState('cuisine'); // 'cuisine' or 'protein'

  // Add/Delete dish states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    cuisine: 'Mediterranean',
    protein: 'Chicken',
    cals: '',
    time: '',
    img: ''
  });

  // Save recipes to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('cleaneats_recipes', JSON.stringify(recipes));
    } catch (e) {
      console.error("Error saving recipes:", e);
    }
  }, [recipes]);

  // Save favorites to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cleaneats_favorites', JSON.stringify(savedIds));
    } catch (e) {
      console.error("Error saving favorites:", e);
    }
  }, [savedIds]);

  // Save daily menu to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cleaneats_dailyMenu', JSON.stringify(dailyMenuIds));
    } catch (e) {
      console.error("Error saving daily menu:", e);
    }
  }, [dailyMenuIds]);

  const savedCount = savedIds.length;
  const dailyMenuCount = dailyMenuIds.length;
  const appId = typeof window !== 'undefined' && typeof window.__app_id !== 'undefined' ? window.__app_id : 'default-app-id';

  // --- FIREBASE SETUP & DATA LOADING ---

  useEffect(() => {
    // Set a timeout to ensure app loads even if Firebase hangs
    const timeoutId = setTimeout(() => {
      if (!isAuthReady) {
        console.warn("Firebase initialization taking too long, proceeding without it.");
        setIsAuthReady(true);
      }
    }, 5000); // 5 second timeout

    try {
      const firebaseConfig = JSON.parse(typeof window !== 'undefined' && typeof window.__firebase_config !== 'undefined' ? window.__firebase_config : '{}');
      if (!firebaseConfig.apiKey || firebaseConfig.apiKey === 'YOUR_API_KEY') {
        console.warn("Firebase config not set. App will work but templates won't be saved.");
        clearTimeout(timeoutId);
        setIsAuthReady(true);
        return;
      }
      const app = initializeApp(firebaseConfig);
      db = getFirestore(app);
      auth = getAuth(app);
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            // Sign in anonymously if no user is found
            await signInAnonymously(auth);
          } catch (authError) {
            console.error("Anonymous sign-in failed:", authError);
            clearTimeout(timeoutId);
            setIsAuthReady(true); // Proceed anyway
          }
        } else {
          clearTimeout(timeoutId);
          setUserId(user.uid);
          setIsAuthReady(true);
        }
      });

      // Attempt custom token sign-in if available
      if (typeof window !== 'undefined' && typeof window.__initial_auth_token !== 'undefined' && window.__initial_auth_token) {
        signInWithCustomToken(auth, window.__initial_auth_token).catch(e => {
          console.error("Custom token sign-in failed, proceeding with anonymous.", e);
        });
      }

      return () => {
        clearTimeout(timeoutId);
        unsubscribe();
      };
    } catch (e) {
      console.error("Firebase initialization failed:", e);
      clearTimeout(timeoutId);
      setIsAuthReady(true); // Proceed without persistence if init fails
    }
  }, []);

  // Load and sync user data with Firebase
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data`, 'userData');
    
    // Load user data from Firebase
    const loadUserDataFromFirebase = async () => {
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.favorites) setSavedIds(data.favorites);
          if (data.dailyMenu) setDailyMenuIds(data.dailyMenu);
          if (data.recipes) setRecipes(data.recipes);
        }
      } catch (e) {
        console.error("Error loading user data from Firebase:", e);
      }
    };

    loadUserDataFromFirebase();

    // Set up real-time listener for user data
    const unsubscribe = onSnapshot(userDocRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        if (data.favorites) setSavedIds(data.favorites);
        if (data.dailyMenu) setDailyMenuIds(data.dailyMenu);
        if (data.recipes) setRecipes(data.recipes);
      }
    }, (error) => {
      console.error("Error listening to user data:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, appId]);

  // Save user data to Firebase whenever it changes
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data`, 'userData');
    
    const saveToFirebase = async () => {
      try {
        await setDoc(userDocRef, {
          favorites: savedIds,
          dailyMenu: dailyMenuIds,
          recipes: recipes,
          lastUpdated: Date.now()
        }, { merge: true });
      } catch (e) {
        console.error("Error saving to Firebase:", e);
      }
    };

    // Debounce Firebase saves to avoid too many writes
    const timeoutId = setTimeout(saveToFirebase, 1000);
    return () => clearTimeout(timeoutId);
  }, [isAuthReady, userId, savedIds, dailyMenuIds, recipes, appId]);

  // Real-time Template Listener
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const templateCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/mealTemplates`);
    
    const unsubscribe = onSnapshot(templateCollectionRef, (snapshot) => {
      const loadedTemplates = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTemplates(loadedTemplates);
    }, (error) => {
      console.error("Error listening to templates:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, appId]);

  // --- CORE LOGIC FUNCTIONS ---

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Filter available recipes based on locks
    const pool = recipes.filter(r => {
      const matchCuisine = lockCuisine === "All" || r.cuisine === lockCuisine;
      const matchProtein = lockProtein === "All" || r.protein === lockProtein;
      return matchCuisine && matchProtein;
    });

    setTimeout(() => {
      if (pool.length > 0) {
        const random = pool[Math.floor(Math.random() * pool.length)];
        setCurrentRecipe(random);
      } else {
        console.warn("No recipes match those exact filters! Try unlocking one."); 
      }
      setIsSpinning(false);
    }, 600);
  };

  // Add new dish
  const handleAddDish = () => {
    if (!newDish.name.trim()) {
      alert('Please enter a dish name');
      return;
    }

    const maxId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id)) : 0;
    const dish = {
      id: maxId + 1,
      name: newDish.name.trim(),
      cuisine: newDish.cuisine,
      protein: newDish.protein,
      cals: parseInt(newDish.cals) || 0,
      time: newDish.time.trim() || '30m',
      img: newDish.img.trim() || `https://placehold.co/800x600/6EE7B7/ffffff?text=${newDish.name.trim().split(' ').map(n=>n[0]).join('')}`
    };

    setRecipes([...recipes, dish]);
    setNewDish({
      name: '',
      cuisine: 'Mediterranean',
      protein: 'Chicken',
      cals: '',
      time: '',
      img: ''
    });
    setShowAddForm(false);
  };

  // Delete dish
  const handleDeleteDish = (id) => {
    if (window.confirm('Are you sure you want to delete this dish?')) {
      setRecipes(recipes.filter(r => r.id !== id));
      // Also remove from favorites and daily menu if present
      setSavedIds(savedIds.filter(sid => sid !== id));
      setDailyMenuIds(dailyMenuIds.filter(did => did !== id));
      // Update current recipe if it was deleted
      if (currentRecipe.id === id && recipes.length > 1) {
        setCurrentRecipe(recipes.find(r => r.id !== id) || recipes[0]);
      }
    }
  };

  // Toggle recipe in Favorites list
  const toggleSave = (id) => {
    setSavedIds(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id) 
        : [...prev, id]
    );
  };
  
  // Toggle recipe in Today's Menu
  const toggleDailyMenu = (id) => {
    setDailyMenuIds(prev => 
      prev.includes(id) 
        ? prev.filter(sid => sid !== id) 
        : [...prev, id]
    );
  };

  const getSavedRecipes = () => recipes.filter(r => savedIds.includes(r.id));
  const getDailyMenuRecipes = () => recipes.filter(r => dailyMenuIds.includes(r.id));

  const saveTemplate = async (name) => {
    if (!isAuthReady || !userId || dailyMenuIds.length === 0 || !db) {
      console.error("Cannot save: Auth not ready or menu is empty.");
      return;
    }

    try {
      const templateCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/mealTemplates`);
      await addDoc(templateCollectionRef, {
        name: name,
        recipeIds: dailyMenuIds,
        createdAt: Date.now()
      });
      console.log(`Template "${name}" saved successfully!`);
    } catch (e) {
      console.error("Error saving template:", e);
    }
  };

  const loadTemplate = (recipeIds) => {
    setDailyMenuIds(recipeIds);
    console.log("Menu loaded from template!");
  };

  const deleteTemplate = async (templateId) => {
    if (!isAuthReady || !userId || !db) return;
    
    try {
      const templateDocRef = doc(db, `/artifacts/${appId}/users/${userId}/mealTemplates`, templateId);
      await deleteDoc(templateDocRef);
      console.log("Template deleted.");
    } catch (e) {
      console.error("Error deleting template:", e);
    }
  };


  // --- RENDER HELPERS ---

  const RecipeCardSmall = ({ recipe, isSaved, isDaily, onToggleSave, onToggleDaily, onDelete }) => (
    <div className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-4 transition-all hover:shadow-md">
      <img 
        src={recipe.img} 
        alt={recipe.name} 
        className="w-20 h-20 rounded-lg object-cover" 
        onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/6EE7B7/ffffff?text=${recipe.name.split(' ').map(n=>n[0]).join('')}`; }}
      />
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-gray-800 truncate">{recipe.name}</h4>
        <div className="flex flex-wrap gap-2 mt-1 text-xs text-stone-500">
          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600">{recipe.cuisine}</span>
          <span className="bg-stone-100 px-2 py-0.5 rounded text-stone-600">{recipe.protein}</span>
        </div>
        <div className="flex gap-3 mt-2 text-xs text-stone-400">
          <span className="flex items-center"><Flame size={12} className="mr-1"/> {recipe.cals}</span>
          <span className="flex items-center"><Clock size={12} className="mr-1"/> {recipe.time}</span>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <button 
          onClick={() => onToggleDaily(recipe.id)}
          className={`p-2 rounded-full transition-colors ${
            isDaily 
              ? 'bg-blue-100 text-blue-600' 
              : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
          }`}
          title={isDaily ? "Remove from Today's Menu" : "Add to Today's Menu"}
        >
          <Calendar size={18} />
        </button>
        <button 
          onClick={() => onToggleSave(recipe.id)}
          className={`p-2 rounded-full transition-colors ${
            isSaved 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
          }`}
          title={isSaved ? "Remove from Favorites" : "Add to Favorites"}
        >
          <Heart size={18} className={isSaved ? 'fill-emerald-600' : ''} />
        </button>
        {onDelete && (
          <button 
            onClick={() => onDelete(recipe.id)}
            className="p-2 rounded-full transition-colors bg-red-100 text-red-600 hover:bg-red-200"
            title="Delete Dish"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
    </div>
  );


  // --- RENDER: DAILY MENU MANAGER VIEW (NEW) ---
  const renderDailyMenuManager = () => {
    // templateName and setTemplateName are now managed by the parent component (CleanPlateCasino)
    const currentMenu = getDailyMenuRecipes();
    const totalCals = currentMenu.reduce((sum, r) => sum + r.cals, 0);

    const handleSaveTemplate = () => {
      if (templateName.trim() === '') {
        console.warn('Please enter a name for your template.');
        return;
      }
      saveTemplate(templateName.trim());
      setTemplateName('');
    };
    
    const handleTemplateNameChange = (e) => {
      setTemplateName(e.target.value);
    };

    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="bg-white p-6 sticky top-0 z-10 border-b border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setView('casino')}
              className="flex items-center text-stone-500 hover:text-emerald-600 font-medium"
            >
              <ArrowLeft size={20} className="mr-1" /> Back to Spin
            </button>
            <h2 className="text-xl font-bold text-gray-800">Today's Menu & Templates</h2>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* Today's Menu */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-stone-100">
            <h3 className="text-lg font-bold text-blue-600 mb-2 flex items-center gap-2">
              <Calendar size={20} /> Current Daily Plan ({currentMenu.length} dishes)
            </h3>
            <p className="text-sm text-stone-500 mb-4">Total Estimated Energy: <span className="font-bold text-gray-800">{totalCals} kcal</span></p>

            {currentMenu.length === 0 ? (
              <p className="text-stone-400 text-sm italic">Add dishes from the Spin or Browse views to start your plan.</p>
            ) : (
              <div className="space-y-3">
                {currentMenu.map(recipe => (
                  <div key={recipe.id} className="flex items-center justify-between bg-blue-50 p-2 rounded-lg">
                    <span className="font-medium text-gray-700">{recipe.name}</span>
                    <button 
                      onClick={() => toggleDailyMenu(recipe.id)}
                      className="text-red-400 hover:text-red-600 p-1 rounded-full bg-blue-100"
                      title="Remove from Menu"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {currentMenu.length > 0 && (
              <div className="mt-4 pt-4 border-t border-stone-100">
                <h4 className="font-bold text-stone-600 mb-2 flex items-center gap-1">
                  <Save size={16} /> Save as Template
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., 'Low-Carb Week'"
                    value={templateName}
                    onChange={handleTemplateNameChange}
                    className="flex-1 p-2 border border-stone-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500 text-sm"
                  />
                  <button 
                    onClick={handleSaveTemplate}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors flex items-center"
                  >
                    Save
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Templates */}
          <div className="bg-white p-4 rounded-xl shadow-md border border-stone-100">
            <h3 className="text-lg font-bold text-emerald-600 mb-4 flex items-center gap-2">
              <List size={20} /> Saved Templates ({templates.length})
            </h3>
            
            {!isAuthReady && <p className="text-yellow-600 text-sm">Connecting to storage...</p>}

            {templates.length === 0 ? (
              <p className="text-stone-400 text-sm italic">Save your first menu above to see templates here!</p>
            ) : (
              <div className="space-y-3">
                {templates.map(template => (
                  <div key={template.id} className="flex items-center justify-between bg-emerald-50 p-3 rounded-lg shadow-sm">
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 truncate">{template.name}</p>
                      <span className="text-xs text-stone-500">{template.recipeIds.length} dishes</span>
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => loadTemplate(template.recipeIds)}
                        className="bg-emerald-500 text-white text-xs px-3 py-1 rounded-full hover:bg-emerald-600 transition-colors"
                      >
                        Load
                      </button>
                      <button 
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full bg-white shadow-sm"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };


  // --- RENDER: BROWSE ALL VIEW ---
  const renderBrowse = () => {
    const filteredRecipes = recipes.filter(r => {
      const matchCuisine = lockCuisine === "All" || r.cuisine === lockCuisine;
      const matchProtein = lockProtein === "All" || r.protein === lockProtein;
      return matchCuisine && matchProtein;
    });

    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        <div className="bg-white p-6 sticky top-0 z-10 border-b border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setView('casino')}
              className="flex items-center text-stone-500 hover:text-emerald-600 font-medium"
            >
              <ArrowLeft size={20} className="mr-1" /> Back to Spin
            </button>
            <h2 className="text-xl font-bold text-gray-800">Browse All</h2>
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 bg-emerald-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition-colors"
            >
              <Plus size={18} /> Add Dish
            </button>
          </div>

          {/* Quick Filters */}
          <div className="grid grid-cols-2 gap-3">
             <div className="relative">
              <select 
                value={lockCuisine} 
                onChange={(e) => setLockCuisine(e.target.value)}
                className="w-full bg-stone-100 border-none rounded-lg text-sm font-semibold text-gray-700 py-2 pl-3 pr-8 appearance-none cursor-pointer hover:bg-stone-200 transition-colors"
              >
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-2.5 pointer-events-none text-stone-400">
                <Utensils size={14} />
              </div>
            </div>
            
            <div className="relative">
              <select 
                value={lockProtein} 
                onChange={(e) => setLockProtein(e.target.value)}
                className="w-full bg-stone-100 border-none rounded-lg text-sm font-semibold text-gray-700 py-2 pl-3 pr-8 appearance-none cursor-pointer hover:bg-stone-200 transition-colors"
              >
                {PROTEINS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
               <div className="absolute right-3 top-2.5 pointer-events-none text-stone-400">
                <Dna size={14} />
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 grid gap-4">
          <div className="text-xs text-stone-400 font-bold uppercase tracking-wider mb-2">
            Showing {filteredRecipes.length} recipes
          </div>
          
          {filteredRecipes.map(recipe => (
            <RecipeCardSmall
              key={recipe.id}
              recipe={recipe}
              isSaved={savedIds.includes(recipe.id)}
              isDaily={dailyMenuIds.includes(recipe.id)}
              onToggleSave={toggleSave}
              onToggleDaily={toggleDailyMenu}
              onDelete={handleDeleteDish}
            />
          ))}

          {filteredRecipes.length === 0 && (
             <div className="text-center py-10 text-stone-400">
               <p>No recipes found matching these filters.</p>
               <button 
                  onClick={() => {setLockCuisine("All"); setLockProtein("All")}}
                  className="text-emerald-600 text-sm font-bold mt-2 hover:underline"
               >
                 Clear Filters
               </button>
             </div>
          )}
        </div>

        {/* Add Dish Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">Add New Dish</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Dish Name *</label>
                  <input
                    type="text"
                    value={newDish.name}
                    onChange={(e) => setNewDish({...newDish, name: e.target.value})}
                    placeholder="e.g., Grilled Salmon"
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Cuisine</label>
                    <select
                      value={newDish.cuisine}
                      onChange={(e) => setNewDish({...newDish, cuisine: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      {CUISINES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Protein</label>
                    <select
                      value={newDish.protein}
                      onChange={(e) => setNewDish({...newDish, protein: e.target.value})}
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    >
                      {PROTEINS.filter(p => p !== 'All').map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Calories</label>
                    <input
                      type="number"
                      value={newDish.cals}
                      onChange={(e) => setNewDish({...newDish, cals: e.target.value})}
                      placeholder="320"
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Prep Time</label>
                    <input
                      type="text"
                      value={newDish.time}
                      onChange={(e) => setNewDish({...newDish, time: e.target.value})}
                      placeholder="25m"
                      className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL (optional)</label>
                  <input
                    type="url"
                    value={newDish.img}
                    onChange={(e) => setNewDish({...newDish, img: e.target.value})}
                    placeholder="https://..."
                    className="w-full p-2 border border-stone-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  />
                  <p className="text-xs text-stone-400 mt-1">Leave empty for auto-generated placeholder</p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setNewDish({
                      name: '',
                      cuisine: 'Mediterranean',
                      protein: 'Chicken',
                      cals: '',
                      time: '',
                      img: ''
                    });
                  }}
                  className="flex-1 px-4 py-2 border border-stone-300 rounded-lg font-semibold text-gray-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDish}
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg font-semibold hover:bg-emerald-600"
                >
                  Add Dish
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // --- RENDER: FAVORITES VIEW (formerly 'menu') ---
  const renderFavorites = () => {
    const saved = getSavedRecipes();
    
    // Group logic
    const grouped = saved.reduce((acc, recipe) => {
      const key = groupBy === 'cuisine' ? recipe.cuisine : recipe.protein;
      if (!acc[key]) acc[key] = [];
      acc[key].push(recipe);
      return acc;
    }, {});

    return (
      <div className="min-h-screen bg-stone-50 pb-20">
        {/* Header */}
        <div className="bg-white p-6 sticky top-0 z-10 border-b border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => setView('casino')}
              className="flex items-center text-stone-500 hover:text-emerald-600 font-medium"
            >
              <ArrowLeft size={20} className="mr-1" /> Back to Spin
            </button>
            <h2 className="text-xl font-bold text-gray-800">My Favorites</h2>
          </div>

          {/* Group Toggle */}
          <div className="flex bg-stone-100 p-1 rounded-lg">
            <button 
              onClick={() => setGroupBy('cuisine')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${groupBy === 'cuisine' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              By Cuisine
            </button>
            <button 
              onClick={() => setGroupBy('protein')}
              className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${groupBy === 'protein' ? 'bg-white text-emerald-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
            >
              By Meat
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="p-6 space-y-8">
          {saved.length === 0 ? (
            <div className="text-center py-20 text-stone-400">
              <Heart size={48} className="mx-auto mb-4 opacity-30" />
              <p>You haven't favorited any recipes yet.</p>
              <button onClick={() => setView('browse')} className="mt-4 text-emerald-600 font-bold underline">Browse all recipes</button>
            </div>
          ) : (
            Object.keys(grouped).map(group => (
              <div key={group} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-8 bg-emerald-400 rounded-full mr-3"></span>
                  {group}
                </h3>
                <div className="grid gap-4">
                  {grouped[group].map(recipe => (
                    <div key={recipe.id} className="bg-white rounded-xl p-3 shadow-sm flex items-center gap-4">
                      <img 
                          src={recipe.img} 
                          alt={recipe.name} 
                          className="w-20 h-20 rounded-lg object-cover" 
                          onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/80x80/6EE7B7/ffffff?text=${recipe.name.split(' ').map(n=>n[0]).join('')}`; }}
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{recipe.name}</h4>
                        <div className="flex gap-3 mt-1 text-xs text-stone-500">
                          <span className="flex items-center"><Flame size={12} className="mr-1"/> {recipe.cals} cal</span>
                          <span className="flex items-center"><Clock size={12} className="mr-1"/> {recipe.time}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                         <button 
                            onClick={() => toggleDailyMenu(recipe.id)}
                            className={`p-2 rounded-full transition-colors ${
                              dailyMenuIds.includes(recipe.id)
                                ? 'bg-blue-100 text-blue-600'
                                : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                            }`}
                            title="Add to Daily Menu"
                          >
                            <Calendar size={18} />
                          </button>
                          <button 
                            onClick={() => toggleSave(recipe.id)}
                            className="p-2 text-stone-300 hover:text-red-400 transition-colors"
                            title="Remove from Favorites"
                          >
                            <Trash2 size={18} />
                          </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // --- RENDER: PRIMARY VIEW ROUTING ---
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-stone-500">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
        <p className="font-semibold">Loading Meal Planner...</p>
      </div>
    );
  }

  if (view === 'favorites') return renderFavorites();
  if (view === 'browse') return renderBrowse();
  if (view === 'dailyMenu') return renderDailyMenuManager();

  // --- RENDER: CASINO VIEW (Discovery) ---

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans text-gray-800">
      
      {/* Top Bar */}
      <div className="px-6 pt-6 pb-2 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-black text-emerald-800 tracking-tight">CLEAN EATS</h1>
          <p className="text-xs text-stone-500 font-medium">RANDOMIZER</p>
        </div>
        <div className="flex gap-2">
           {/* Daily Menu Button */}
          <button 
            onClick={() => setView('dailyMenu')}
            className="relative bg-white p-3 rounded-full shadow-md border border-stone-100 active:scale-95 transition-transform text-stone-600 hover:text-blue-600"
            title="Today's Menu"
          >
            <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {dailyMenuCount}
            </div>
            <Calendar size={24} />
          </button>
          
          {/* Browse All Button */}
          <button 
            onClick={() => setView('browse')}
            className="bg-white p-3 rounded-full shadow-md border border-stone-100 active:scale-95 transition-transform text-stone-600 hover:text-emerald-600"
            title="Browse All"
          >
            <BookOpen size={24} />
          </button>
          
          {/* Favorites Button */}
          <button 
            onClick={() => setView('favorites')}
            className="relative bg-white p-3 rounded-full shadow-md border border-stone-100 group active:scale-95 transition-transform"
            title="My Favorites"
          >
            <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {savedCount}
            </div>
            <Heart size={24} className="text-emerald-600 group-hover:rotate-12 transition-transform fill-emerald-600" />
          </button>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        
        {/* Slot Machine Display */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-xl border border-stone-100 mb-8 relative">
          
          {/* Visual Reels */}
          <div className="flex justify-between gap-2 mb-6">
            <SlotReel value={currentRecipe.cuisine} label="Cuisine" isSpinning={isSpinning} icon={Utensils} />
            <SlotReel value={currentRecipe.protein} label="Protein" isSpinning={isSpinning} icon={Dna} />
            <SlotReel value={currentRecipe.cals + " kcal"} label="Energy" isSpinning={isSpinning} icon={Flame} />
          </div>

          {/* Featured Card */}
          <div className="relative group">
            <div className="absolute inset-0 bg-emerald-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative bg-white rounded-2xl overflow-hidden border border-stone-100 shadow-inner">
              <div className="h-48 overflow-hidden relative">
                 <img 
                    src={currentRecipe.img} 
                    alt={currentRecipe.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${isSpinning ? 'blur-sm scale-110' : 'blur-0 scale-100'}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x192/6EE7B7/ffffff?text=${currentRecipe.name.split(' ').map(n=>n[0]).join('')}`; }}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <h2 className="text-white font-bold text-xl leading-tight shadow-black drop-shadow-md">
                      {isSpinning ? "Spinning..." : currentRecipe.name}
                    </h2>
                  </div>
              </div>
              
              <div className="p-4 flex justify-between">
                <div className="flex flex-col gap-2">
                   {/* Add to Daily Menu Button */}
                  <button 
                    onClick={() => toggleDailyMenu(currentRecipe.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold transition-all transform active:scale-95 text-sm ${
                      dailyMenuIds.includes(currentRecipe.id)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                    }`}
                  >
                    <Calendar size={16} />
                    {dailyMenuIds.includes(currentRecipe.id) ? 'Planned' : 'Add to Menu'}
                  </button>
                  
                  {/* Keep/Save to Favorites Button */}
                  <button 
                    onClick={() => toggleSave(currentRecipe.id)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold transition-all transform active:scale-95 text-sm ${
                      savedIds.includes(currentRecipe.id)
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                    }`}
                  >
                    <Heart size={16} className={savedIds.includes(currentRecipe.id) ? 'fill-emerald-700' : ''} />
                    {savedIds.includes(currentRecipe.id) ? 'Favorited' : 'Keep'}
                  </button>
                </div>
                
                <div className="text-sm text-right text-stone-600">
                  <span className="block font-semibold text-emerald-700">{currentRecipe.time} prep</span>
                  <span className="text-xs">Perfect for {currentRecipe.protein === 'Vegetarian' ? 'plants' : currentRecipe.protein.toLowerCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          
          {/* Lock Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-1">Lock Cuisine</label>
              <select 
                value={lockCuisine} 
                onChange={(e) => setLockCuisine(e.target.value)}
                className="w-full bg-stone-50 border-none rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500 py-2"
              >
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div className="bg-white p-2 rounded-xl border border-stone-200 shadow-sm">
              <label className="block text-xs font-bold text-stone-400 uppercase mb-1 ml-1">Lock Meat</label>
              <select 
                value={lockProtein} 
                onChange={(e) => setLockProtein(e.target.value)}
                className="w-full bg-stone-50 border-none rounded-lg text-sm font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500 py-2"
              >
                {PROTEINS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Big Spin Button */}
          <button 
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black text-xl py-5 rounded-2xl shadow-lg shadow-emerald-200 transform transition-all active:scale-95 active:shadow-none hover:brightness-110 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            <RefreshCw size={28} className={isSpinning ? 'animate-spin' : ''} />
            {isSpinning ? "FINDING..." : "SPIN FOR DINNER"}
          </button>
          
        </div>
      </div>
    </div>
  );
}

