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
  X,
  Pencil
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

const CUISINES = ["All", "Japanese", "American", "Chinese", "Korean", "Mexican", "Italian"];
const PROTEINS = ["All", "Chicken", "Beef", "Seafood", "Pork","Vegetarian", "Dessert"];
const HEALTH_TAGS = ["All", "Healthy", "Moderate Healthy", "Guilty Pleasure"];

// Placeholder for Firebase/Auth instances
let db = null;
let auth = null;

// --- COMPONENTS ---

// 1. Slot Machine Reel Component
const SlotReel = ({ value, label, isSpinning, icon: Icon }) => (
  <div className="flex flex-col items-center gap-2 w-1/3">
    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{label}</span>
      <div className={`relative w-full h-24 bg-white rounded-xl border-2 border-[#d6ced9] flex items-center justify-center overflow-hidden shadow-sm transition-all duration-300 ${isSpinning ? 'scale-95 opacity-80' : 'scale-100 opacity-100'}`}>
      <div className={`absolute inset-0 bg-[#ded7e0]/20 flex flex-col items-center justify-center transition-transform duration-100 ${isSpinning ? 'animate-pulse translate-y-1' : 'translate-y-0'}`}>
        <Icon size={28} className="text-amber-600 mb-1" />
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
      const savedMenu = localStorage.getItem('cleaneats_currentMenu');
      return {
        currentMenu: savedMenu ? JSON.parse(savedMenu) : []
      };
    } catch (e) {
      console.error("Error loading user data:", e);
      return { currentMenu: [] };
    }
  };

  const [recipes, setRecipes] = useState(() => DEFAULT_RECIPES); // Start with defaults, Firebase will load shared recipes
  const [view, setView] = useState('spin'); // 'spin', 'browse', or 'menus'
  const userData = loadUserData();
  const [currentMenuIds, setCurrentMenuIds] = useState(userData.currentMenu); // Current working menu
  const [savedMenus, setSavedMenus] = useState([]); // Saved Menus (formerly templates)
  
  const [currentRecipe, setCurrentRecipe] = useState(DEFAULT_RECIPES[0]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [userId, setUserId] = useState(null);
  
  // Swipe gesture state
  const [swipePosition, setSwipePosition] = useState({ x: 0, y: 0 });
  const [swipeStart, setSwipeStart] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  
  // Lock filters for Casino/Browse
  const [lockCuisine, setLockCuisine] = useState("All");
  const [lockProtein, setLockProtein] = useState("All");
  const [lockHealthTag, setLockHealthTag] = useState("All");
  const [lockFreeformTag, setLockFreeformTag] = useState("All");
  
  // Scroll state for hiding filters on mobile
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showFilters, setShowFilters] = useState(true);

  // State for the menu name (Crucial for obeying Rules of Hooks)
  const [templateName, setTemplateName] = useState(''); // Reusing this state for menu name
  const [menuNameInput, setMenuNameInput] = useState(''); // For saving current menu

  // Add/Delete dish states
  const [showAddForm, setShowAddForm] = useState(false);
  const [newDish, setNewDish] = useState({
    name: '',
    cuisine: 'Mediterranean',
    protein: 'Chicken',
    cals: '',
    time: '',
    img: '',
    healthTag: 'Healthy', // 'Healthy', 'Moderate Healthy', 'Guilty Pleasure'
    freeformTag: '' // User-defined tag
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  // Menu selector modal state
  const [showMenuSelector, setShowMenuSelector] = useState(false);
  const [selectedRecipeForMenu, setSelectedRecipeForMenu] = useState(null);
  
  // Menu display state
  const [viewingMenu, setViewingMenu] = useState(null);
  
  // Recipe detail view state
  const [viewingRecipe, setViewingRecipe] = useState(null);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [recipeNote, setRecipeNote] = useState('');
  
  // Menu editing state
  const [editingMenuId, setEditingMenuId] = useState(null);
  const [editingMenuName, setEditingMenuName] = useState('');
  const [showCalories, setShowCalories] = useState(true);

  // Recipes are now shared via Firebase, no need to save to localStorage
  // (localStorage was for user-specific recipes, but now recipes are public/shared)

  // Save current menu to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('cleaneats_currentMenu', JSON.stringify(currentMenuIds));
    } catch (e) {
      console.error("Error saving current menu:", e);
    }
  }, [currentMenuIds]);

  const currentMenuCount = currentMenuIds.length;
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
      
      // Set isAuthReady to true immediately after Firebase is initialized
      // (even if user isn't authenticated yet - we'll wait for that separately)
      setIsAuthReady(true);
      
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          try {
            // Sign in anonymously if no user is found
            await signInAnonymously(auth);
          } catch (authError) {
            console.error("Anonymous sign-in failed:", authError);
            if (authError.code === 'auth/configuration-not-found') {
              console.warn("⚠️ Anonymous Authentication is not enabled in Firebase Console.");
              console.warn("Please enable it at: https://console.firebase.google.com/project/cleaneats-49351/authentication/providers");
              console.warn("The app will work with localStorage fallback, but menus won't sync across devices.");
            }
            // Don't set isAuthReady to false - keep it true so app can work
            // App will use localStorage fallback
          }
        } else {
          clearTimeout(timeoutId);
          setUserId(user.uid);
          console.log("✅ Firebase authenticated:", user.uid);
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

  // Load shared recipes from Firebase (public, everyone can see/edit)
  useEffect(() => {
    if (!isAuthReady || !db) return;

    const sharedRecipesRef = collection(db, `/artifacts/${appId}/sharedRecipes`);
    
    // Set up real-time listener for shared recipes
    const unsubscribe = onSnapshot(sharedRecipesRef, (snapshot) => {
      const sharedRecipes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Merge shared recipes with default recipes (avoid duplicates by name)
      const defaultNames = new Set(DEFAULT_RECIPES.map(r => r.name));
      const uniqueShared = sharedRecipes.filter(r => !defaultNames.has(r.name));
      const allRecipes = [...DEFAULT_RECIPES, ...uniqueShared];
      
      setRecipes(allRecipes);
    }, (error) => {
      console.error("Error listening to shared recipes:", error);
      // Fallback to default recipes if Firebase fails
      setRecipes(DEFAULT_RECIPES);
    });

    return () => unsubscribe();
  }, [isAuthReady, appId]);

  // Load and sync user data with Firebase (favorites, daily menu - private)
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data`, 'userData');
    
    // Load user data from Firebase
    const loadUserDataFromFirebase = async () => {
      try {
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.currentMenu) setCurrentMenuIds(data.currentMenu);
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
        if (data.currentMenu) setCurrentMenuIds(data.currentMenu);
      }
    }, (error) => {
      console.error("Error listening to user data:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, appId]);

  // Save user data to Firebase whenever it changes (favorites, daily menu only - not recipes)
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const userDocRef = doc(db, `/artifacts/${appId}/users/${userId}/data`, 'userData');
    
    const saveToFirebase = async () => {
      try {
        await setDoc(userDocRef, {
          currentMenu: currentMenuIds,
          lastUpdated: Date.now()
        }, { merge: true });
      } catch (e) {
        console.error("Error saving to Firebase:", e);
      }
    };

    // Debounce Firebase saves to avoid too many writes
    const timeoutId = setTimeout(saveToFirebase, 1000);
    return () => clearTimeout(timeoutId);
  }, [isAuthReady, userId, currentMenuIds, appId]);

  // Load saved menus from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cleaneats_savedMenus');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Only load local menus if Firebase hasn't loaded yet
        if (savedMenus.length === 0) {
          setSavedMenus(parsed);
        }
      }
    } catch (e) {
      console.error("Error loading menus from localStorage:", e);
    }
  }, []);

  // Real-time Saved Menus Listener
  useEffect(() => {
    if (!isAuthReady || !userId || !db) return;

    const menusCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
    
    const unsubscribe = onSnapshot(menusCollectionRef, (snapshot) => {
      const loadedMenus = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setSavedMenus(loadedMenus);
      
      // Also sync to localStorage as backup
      try {
        localStorage.setItem('cleaneats_savedMenus', JSON.stringify(loadedMenus));
      } catch (e) {
        console.error("Error saving menus to localStorage:", e);
      }
    }, (error) => {
      console.error("Error listening to saved menus:", error);
    });

    return () => unsubscribe();
  }, [isAuthReady, userId, appId]);

  // Handle scroll to hide/show filters on mobile
  useEffect(() => {
    if (view !== 'browse') {
      setShowFilters(true);
      return;
    }

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // Only hide on mobile (screen width < 768px)
      if (window.innerWidth < 768) {
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down - hide filters
          setShowFilters(false);
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show filters
          setShowFilters(true);
        }
      } else {
        // Always show on desktop
        setShowFilters(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY, view]);

  // Prevent body scrolling when modals are open (but allow modal content to scroll)
  useEffect(() => {
    const hasOpenModal = showAddForm || viewingRecipe || showMenuSelector || viewingMenu;
    if (hasOpenModal) {
      // Save current scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll position
      const scrollY = document.body.style.top;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    }
    return () => {
      // Cleanup on unmount
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
    };
  }, [showAddForm, viewingRecipe, showMenuSelector, viewingMenu]);

  // --- CORE LOGIC FUNCTIONS ---

  // Handle image file selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB.');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setNewDish({...newDish, img: reader.result}); // Set as base64 data URL
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove selected image
  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setNewDish({...newDish, img: ''});
  };

  const handleSpin = () => {
    if (isSpinning) return;
    setIsSpinning(true);
    
    // Filter available recipes based on locks
    const pool = recipes.filter(r => {
      const matchCuisine = lockCuisine === "All" || r.cuisine === lockCuisine;
      const matchProtein = lockProtein === "All" || r.protein === lockProtein;
      
      // Health tag filter
      const recipeHealthTag = getHealthTag(r.cals || 0, r.healthTag).label;
      const matchHealthTag = lockHealthTag === "All" || recipeHealthTag === lockHealthTag;
      
      // Freeform tag filter
      const matchFreeformTag = lockFreeformTag === "All" || 
        (lockFreeformTag !== "All" && r.freeformTag && r.freeformTag.trim() === lockFreeformTag);
      
      return matchCuisine && matchProtein && matchHealthTag && matchFreeformTag;
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

  // Swipe handlers
  const handleSwipeStart = (e) => {
    if (isSpinning) return;
    const touch = e.touches ? e.touches[0] : e;
    setSwipeStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleSwipeMove = (e) => {
    if (!isDragging || !swipeStart || isSpinning) return;
    const touch = e.touches ? e.touches[0] : e;
    const deltaX = touch.clientX - swipeStart.x;
    const deltaY = touch.clientY - swipeStart.y;
    setSwipePosition({ x: deltaX, y: deltaY });
  };

  const handleSwipeEnd = () => {
    if (!isDragging || isSpinning) return;
    
    const swipeThreshold = 100; // Minimum distance to trigger swipe
    const absX = Math.abs(swipePosition.x);
    const absY = Math.abs(swipePosition.y);
    
    // Only trigger if horizontal swipe is dominant
    if (absX > absY && absX > swipeThreshold) {
      if (swipePosition.x > 0) {
        // Swipe right = Like = Add to menu
        handleSwipeLike();
      } else {
        // Swipe left = Pass = Next recipe
        handleSwipePass();
      }
    }
    
    // Reset swipe state
    setSwipePosition({ x: 0, y: 0 });
    setSwipeStart(null);
    setIsDragging(false);
  };

  const handleSwipeLike = () => {
    const recipeId = currentRecipe.id || currentRecipe.name;
    if (!currentMenuIds.includes(recipeId)) {
      setCurrentMenuIds([...currentMenuIds, recipeId]);
    }
    // Move to next recipe
    handleSpin();
  };

  const handleSwipePass = () => {
    // Just move to next recipe
    handleSpin();
  };

  // Add new dish or update existing dish
  const handleAddDish = async () => {
    if (!newDish.name.trim()) {
      alert('Please enter a dish name');
      return;
    }

    // Determine image: prioritize imagePreview (new upload), then newDish.img (URL or existing), then placeholder
    let finalImage = '';
    if (imagePreview) {
      // New image uploaded
      finalImage = imagePreview;
    } else if (newDish.img && newDish.img.trim()) {
      // Image URL provided or existing image kept
      finalImage = newDish.img.trim();
    } else if (editingRecipe && editingRecipe.img) {
      // Editing and no new image - keep existing
      finalImage = editingRecipe.img;
    } else {
      // No image - use placeholder
      finalImage = `https://placehold.co/800x600/d97706/ffffff?text=${newDish.name.trim().split(' ').map(n=>n[0]).join('')}`;
    }

    const dish = {
      name: newDish.name.trim(),
      cuisine: newDish.cuisine,
      protein: newDish.protein,
      cals: parseInt(newDish.cals) || 0,
      time: newDish.time.trim() || '30m',
      img: finalImage,
      healthTag: newDish.healthTag || 'Healthy',
      freeformTag: newDish.freeformTag.trim() || '',
      notes: editingRecipe?.notes || '',
      createdAt: editingRecipe?.createdAt || Date.now(),
      createdBy: editingRecipe?.createdBy || userId || 'anonymous'
    };

    // If editing, update existing recipe
    if (editingRecipe && editingRecipe.id && typeof editingRecipe.id === 'string' && editingRecipe.id.length >= 20 && !editingRecipe.id.startsWith('local_') && isAuthReady && db) {
      try {
        const recipeDocRef = doc(db, `/artifacts/${appId}/sharedRecipes`, editingRecipe.id);
        await updateDoc(recipeDocRef, dish);
        // Recipe will be updated automatically via the real-time listener
      } catch (e) {
        console.error("Error updating recipe in Firebase:", e);
        alert('Failed to update recipe. Please try again.');
        return;
      }
    } else if (isAuthReady && db) {
      // Save new recipe to Firebase shared recipes collection
      try {
        const sharedRecipesRef = collection(db, `/artifacts/${appId}/sharedRecipes`);
        await addDoc(sharedRecipesRef, dish);
        // Recipe will be added automatically via the real-time listener
      } catch (e) {
        console.error("Error saving recipe to Firebase:", e);
        alert('Failed to save recipe. Please try again.');
        return;
      }
    } else {
      // Fallback to local storage if Firebase not available
      if (editingRecipe) {
        // Update local recipe
        setRecipes(prevRecipes => prevRecipes.map(r => {
          const rId = r.id || r.name;
          const editId = editingRecipe.id || editingRecipe.name;
          return rId === editId ? { ...r, ...dish } : r;
        }));
      } else {
        // Add new local recipe
        const maxId = recipes.length > 0 ? Math.max(...recipes.map(r => r.id || 0)) : 0;
        const dishWithId = { ...dish, id: maxId + 1 };
        setRecipes([...recipes, dishWithId]);
      }
    }

    setNewDish({
      name: '',
      cuisine: 'Mediterranean',
      protein: 'Chicken',
      cals: '',
      time: '',
      img: '',
      healthTag: 'Healthy',
      freeformTag: ''
    });
    setImageFile(null);
    setImagePreview(null);
    setEditingRecipe(null);
    setShowAddForm(false);
  };

  // Delete dish from shared recipes
  const handleDeleteDish = async (recipe) => {
    if (window.confirm('Are you sure you want to delete this dish? Everyone will lose access to it.')) {
      const recipeId = recipe.id || recipe.name;
      
      // If it's a shared recipe (has Firebase doc ID - typically 20 chars), delete from Firebase
      // Firebase IDs are alphanumeric strings, typically 20 characters long
      if (recipe.id && typeof recipe.id === 'string' && recipe.id.length >= 20 && !recipe.id.startsWith('local_') && isAuthReady && db) {
        try {
          const recipeDocRef = doc(db, `/artifacts/${appId}/sharedRecipes`, recipe.id);
          await deleteDoc(recipeDocRef);
          // Recipe will be removed automatically via the real-time listener
        } catch (e) {
          console.error("Error deleting recipe from Firebase:", e);
          alert('Failed to delete recipe. Please try again.');
          return;
        }
      } else {
        // Default recipe or local-only recipe - remove from local state by ID
        setRecipes(prevRecipes => {
          return prevRecipes.filter(r => {
            const rId = r.id || r.name;
            return rId !== recipeId;
          });
        });
      }
      
      // Also remove from current menu if present
      setCurrentMenuIds(prev => prev.filter(did => did !== recipeId));
      
      // Update current recipe if it was deleted (compare by ID)
      const currentRecipeId = currentRecipe.id || currentRecipe.name;
      if (currentRecipeId === recipeId && recipes.length > 1) {
        const remainingRecipes = recipes.filter(r => {
          const rId = r.id || r.name;
          return rId !== recipeId;
        });
        if (remainingRecipes.length > 0) {
          setCurrentRecipe(remainingRecipes[0]);
        }
      }
    }
  };

  // Open menu selector to add recipe to a saved menu
  const openMenuSelector = (recipe) => {
    setSelectedRecipeForMenu(recipe);
    setShowMenuSelector(true);
  };

  // Add recipe to a specific saved menu
  const addToMenu = async (menuId) => {
    if (!selectedRecipeForMenu || !isAuthReady || !userId || !db) return;
    
    try {
      const menuDocRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
      const menuDoc = await getDoc(menuDocRef);
      
      if (menuDoc.exists()) {
        const menuData = menuDoc.data();
        const recipeId = selectedRecipeForMenu.id || selectedRecipeForMenu.name;
        
        // Add recipe if not already in menu
        if (!menuData.recipeIds.includes(recipeId)) {
          await updateDoc(menuDocRef, {
            recipeIds: [...menuData.recipeIds, recipeId]
          });
        }
      }
      
      setShowMenuSelector(false);
      setSelectedRecipeForMenu(null);
    } catch (e) {
      console.error("Error adding recipe to menu:", e);
      alert('Failed to add dish to menu. Please try again.');
    }
  };

  // Create new menu and add recipe to it
  const createMenuAndAdd = async () => {
    if (!selectedRecipeForMenu) {
      alert('No recipe selected. Please try again.');
      return;
    }
    
    const menuName = templateName.trim() || `Menu ${savedMenus.length + 1}`;
    const recipeId = selectedRecipeForMenu.id || selectedRecipeForMenu.name;
    
    // If Firebase is ready, save to Firebase
    if (isAuthReady && userId && db) {
      try {
        const menusCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
        await addDoc(menusCollectionRef, {
          name: menuName,
          recipeIds: [recipeId],
          createdAt: Date.now()
        });
        
        // Success - close modal and reset
        setShowMenuSelector(false);
        setSelectedRecipeForMenu(null);
        setTemplateName('');
        return;
      } catch (e) {
        console.error("Error creating menu:", e);
        alert(`Failed to create menu: ${e.message || 'Please try again.'}`);
        return;
      }
    }
    
    // Fallback: Save to localStorage if Firebase not ready
    try {
      const newMenu = {
        id: `local_${Date.now()}`,
        name: menuName,
        recipeIds: [recipeId],
        createdAt: Date.now()
      };
      
      // Add to local state temporarily
      setSavedMenus(prev => [...prev, newMenu]);
      
      // Save to localStorage
      const savedMenusLocal = JSON.parse(localStorage.getItem('cleaneats_savedMenus') || '[]');
      savedMenusLocal.push(newMenu);
      localStorage.setItem('cleaneats_savedMenus', JSON.stringify(savedMenusLocal));
      
      // Success - close modal and reset
      setShowMenuSelector(false);
      setSelectedRecipeForMenu(null);
      setTemplateName('');
      
      alert('Menu created! It will sync to cloud when connection is ready.');
    } catch (e) {
      console.error("Error saving menu locally:", e);
      alert('Failed to create menu. Please try again.');
    }
  };

  const getCurrentMenuRecipes = () => recipes.filter(r => {
    const recipeId = r.id || r.name;
    return currentMenuIds.includes(recipeId);
  });

  const saveMenu = async (name) => {
    if (!isAuthReady || !userId || currentMenuIds.length === 0 || !db) {
      console.error("Cannot save: Auth not ready or menu is empty.");
      return;
    }

    try {
      const menusCollectionRef = collection(db, `/artifacts/${appId}/users/${userId}/savedMenus`);
      await addDoc(menusCollectionRef, {
        name: name,
        recipeIds: currentMenuIds,
        createdAt: Date.now()
      });
      console.log(`Menu "${name}" saved successfully!`);
    } catch (e) {
      console.error("Error saving menu:", e);
    }
  };

  const loadMenu = (recipeIds) => {
    setCurrentMenuIds(recipeIds);
    console.log("Menu loaded!");
  };

  const deleteMenu = async (menuId) => {
    if (!isAuthReady || !userId || !db) return;
    
    try {
      const menuDocRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
      await deleteDoc(menuDocRef);
      console.log("Menu deleted.");
    } catch (e) {
      console.error("Error deleting menu:", e);
    }
  };

  const updateMenuName = async (menuId, newName) => {
    if (!newName || !newName.trim()) {
      alert('Menu name cannot be empty');
      return;
    }
    
    if (!isAuthReady || !userId || !db) {
      // Fallback to localStorage
      try {
        const savedMenusLocal = JSON.parse(localStorage.getItem('cleaneats_savedMenus') || '[]');
        const updatedMenus = savedMenusLocal.map(menu => 
          menu.id === menuId ? { ...menu, name: newName.trim() } : menu
        );
        localStorage.setItem('cleaneats_savedMenus', JSON.stringify(updatedMenus));
        setSavedMenus(updatedMenus);
        setEditingMenuId(null);
        setEditingMenuName('');
        return;
      } catch (e) {
        console.error("Error updating menu name locally:", e);
        alert('Failed to update menu name. Please try again.');
        return;
      }
    }
    
    try {
      const menuDocRef = doc(db, `/artifacts/${appId}/users/${userId}/savedMenus`, menuId);
      await updateDoc(menuDocRef, { name: newName.trim() });
      // Update local state immediately
      setSavedMenus(prev => prev.map(menu => 
        menu.id === menuId ? { ...menu, name: newName.trim() } : menu
      ));
      setEditingMenuId(null);
      setEditingMenuName('');
      console.log("Menu name updated.");
    } catch (e) {
      console.error("Error updating menu name:", e);
      alert('Failed to update menu name. Please try again.');
    }
  };


  // --- RENDER HELPERS ---

  // Helper function to determine health tag based on calories or use provided tag
  const getHealthTag = (cals, providedTag) => {
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

  const RecipeCardSmall = ({ recipe, onAddToMenu, onDelete, onView }) => {
    // Check if recipe is in any saved menu
    const recipeId = recipe.id || recipe.name;
    const isInAnyMenu = savedMenus.some(menu => menu.recipeIds.includes(recipeId));
    
    return (
      <div className="bg-white border border-stone-200 overflow-hidden transition-all hover:border-stone-400 group relative flex flex-col cursor-pointer" onClick={() => onView && onView(recipe)}>
        {/* Image - Square */}
        <div className="relative w-full aspect-square overflow-hidden">
          <img 
            src={recipe.img} 
            alt={recipe.name} 
            className="w-full h-full object-cover transition-opacity duration-300 group-hover:opacity-90" 
            onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x400/f5f5f4/78716c?text=${recipe.name.split(' ').map(n=>n[0]).join('')}`; }}
          />
          {/* Heart button overlay - Minimalist */}
          {onAddToMenu && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onAddToMenu(recipe);
              }}
              className={`absolute top-3 right-3 p-1.5 transition-all ${
                isInAnyMenu 
                  ? 'text-stone-900' 
                  : 'text-stone-400 hover:text-stone-900'
              }`}
              title="Add to Menu"
            >
              <Heart size={18} className={isInAnyMenu ? 'fill-current' : ''} strokeWidth={1.5} />
            </button>
          )}
          {/* Delete button overlay - Minimalist */}
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(recipe);
              }}
              className="absolute top-3 left-3 p-1.5 text-stone-400 hover:text-stone-900 transition-colors"
              title="Delete Dish"
            >
              <Trash2 size={16} strokeWidth={1.5} />
            </button>
          )}
        </div>
        
        {/* Content - Minimalist */}
        <div className="p-4 flex-1 flex flex-col border-t border-stone-100">
          <h4 className="font-light text-stone-900 text-base mb-3 line-clamp-2 tracking-wide">{recipe.name}</h4>
          
          {/* Details - Minimalist */}
          <div className="flex items-center gap-3 text-xs text-stone-500 uppercase tracking-wider mt-auto">
            <span>{recipe.cuisine}</span>
            <span className="text-stone-300">•</span>
            <span>{recipe.protein}</span>
            <span className="text-stone-300">•</span>
            <span>{recipe.time}</span>
          </div>
        </div>
      </div>
    );
  };


  // --- RENDER: MENU MANAGER VIEW ---
  const renderMenuManager = () => {
    const currentMenuRecipes = getCurrentMenuRecipes();
    const currentMenuTotalCals = currentMenuRecipes.reduce((sum, r) => sum + r.cals, 0);

    return (
      <div className="min-h-screen bg-white pb-32">
        <div className="bg-white p-8 sticky top-0 z-10 border-b border-stone-200">
          <div className="text-center">
            <h2 className="text-3xl font-light text-stone-900 tracking-wider uppercase mb-2">My Menus</h2>
            <div className="text-xs text-stone-500 uppercase tracking-widest">
              {savedMenus.length} {savedMenus.length === 1 ? 'Menu' : 'Menus'}
            </div>
          </div>
        </div>

        <div className="p-8 space-y-16 max-w-4xl mx-auto">
          
          {/* Current Menu (Today's Menu) */}
          <div className="border-b border-stone-200 pb-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-light text-stone-900 mb-2 tracking-wide uppercase">
                Today's Menu
              </h3>
              <div className="text-xs text-stone-500 uppercase tracking-widest">
                {currentMenuIds.length} {currentMenuIds.length === 1 ? 'Dish' : 'Dishes'}
              </div>
            </div>
            
            {currentMenuIds.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-stone-400 text-sm mb-2">No dishes in your menu yet.</p>
                <p className="text-stone-500 text-xs uppercase tracking-wider">Swipe right on recipes in the Spin tab to add them</p>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-8 border-b border-stone-200 pb-4">
                    <div className="text-right">
                      <div className="text-xs text-stone-400 uppercase tracking-widest mb-1">Total</div>
                      <div className="text-2xl font-light text-stone-900 tracking-wide">
                        {currentMenuTotalCals} <span className="text-sm text-stone-500">kcal</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all dishes from today\'s menu?')) {
                          setCurrentMenuIds([]);
                        }
                      }}
                      className="text-xs text-stone-400 hover:text-stone-900 uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  {/* Recipe Cards Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                    {currentMenuRecipes.map((recipe, index) => {
                      const recipeId = recipe.id || recipe.name || index;
                      return (
                        <RecipeCardSmall
                          key={recipeId}
                          recipe={recipe}
                          onAddToMenu={null}
                          onDelete={(r) => {
                            const id = r.id || r.name;
                            setCurrentMenuIds(currentMenuIds.filter(did => did !== id));
                          }}
                        />
                      );
                    })}
                  </div>
                </div>
                
                {/* Save Menu Section - Minimalist */}
                <div className="border-t border-stone-200 pt-8">
                  <div className="flex gap-3 max-w-md mx-auto">
                    <input
                      type="text"
                      placeholder="Menu name (optional)"
                      value={menuNameInput}
                      onChange={(e) => setMenuNameInput(e.target.value)}
                      className="flex-1 p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none text-sm bg-transparent"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && menuNameInput.trim()) {
                          saveMenu(menuNameInput.trim());
                          setMenuNameInput('');
                        }
                      }}
                    />
                    <button
                      onClick={() => {
                        if (menuNameInput.trim()) {
                          saveMenu(menuNameInput.trim());
                          setMenuNameInput('');
                        } else {
                          const defaultName = `Menu ${savedMenus.length + 1}`;
                          saveMenu(defaultName);
                        }
                      }}
                      disabled={currentMenuIds.length === 0}
                      className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Save
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          
          {/* Saved Menus */}
          <div className="border-b border-stone-200 pb-12">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-light text-stone-900 mb-2 tracking-wide uppercase">
                Saved Menus
              </h3>
            </div>
            
            {!isAuthReady && <p className="text-center text-stone-400 text-sm uppercase tracking-wider">Connecting to storage...</p>}

            {savedMenus.length === 0 ? (
              <p className="text-center text-stone-400 text-sm">No saved menus yet. Save your first menu above.</p>
            ) : (
              <div className="space-y-6">
                {savedMenus.map(menu => {
                  const menuRecipes = recipes.filter(r => {
                    const recipeId = r.id || r.name;
                    return menu.recipeIds.includes(recipeId);
                  });
                  const menuTotalCals = menuRecipes.reduce((sum, r) => sum + r.cals, 0);
                  
                  return (
                    <div key={menu.id} className="border-b border-stone-100 pb-6 last:border-0">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          {editingMenuId === menu.id ? (
                            <div className="flex items-center gap-3 mb-2">
                              <input
                                type="text"
                                value={editingMenuName}
                                onChange={(e) => setEditingMenuName(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') {
                                    updateMenuName(menu.id, editingMenuName);
                                  } else if (e.key === 'Escape') {
                                    setEditingMenuId(null);
                                    setEditingMenuName('');
                                  }
                                }}
                                className="flex-1 text-xl font-light text-stone-900 tracking-wide border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                                autoFocus
                              />
                              <button
                                onClick={() => updateMenuName(menu.id, editingMenuName)}
                                className="text-stone-600 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => {
                                  setEditingMenuId(null);
                                  setEditingMenuName('');
                                }}
                                className="text-stone-400 hover:text-stone-900 transition-colors"
                              >
                                <X size={16} strokeWidth={1.5} />
                              </button>
                            </div>
                          ) : (
                            <h4 className="text-xl font-light text-stone-900 mb-2 tracking-wide">{menu.name}</h4>
                          )}
                          <div className="flex items-center gap-4 text-xs text-stone-500 uppercase tracking-wider">
                            <span>{menu.recipeIds.length} {menu.recipeIds.length === 1 ? 'Dish' : 'Dishes'}</span>
                            <span className="text-stone-300">•</span>
                            <span>{menuTotalCals} kcal</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button 
                            onClick={() => setViewingMenu(menu)}
                            className="text-stone-600 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                          >
                            View
                          </button>
                          {editingMenuId !== menu.id && (
                            <button 
                              onClick={() => {
                                setEditingMenuId(menu.id);
                                setEditingMenuName(menu.name);
                              }}
                              className="text-stone-400 hover:text-stone-900 transition-colors"
                              title="Edit menu name"
                            >
                              <Pencil size={16} strokeWidth={1.5} />
                            </button>
                          )}
                          <button 
                            onClick={() => deleteMenu(menu.id)}
                            className="text-stone-400 hover:text-stone-900 transition-colors"
                          >
                            <Trash2 size={16} strokeWidth={1.5} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
        
        {/* Restaurant Menu Display Modal - Minimalist Japanese Style */}
        {viewingMenu && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-3xl w-full mx-auto px-6 py-12 pb-32">
              {/* Toggle and Close Button - Top */}
              <div className="flex justify-between items-center mb-8">
                <button
                  onClick={() => setShowCalories(!showCalories)}
                  className="text-stone-400 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                >
                  {showCalories ? 'Hide Calories' : 'Show Calories'}
                </button>
                <button
                  onClick={() => {
                    loadMenu(viewingMenu.recipeIds);
                    setViewingMenu(null);
                    setShowCalories(true); // Reset to default when closing
                  }}
                  className="text-stone-400 hover:text-stone-800 transition-colors p-2"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Menu Header - Minimalist */}
              <div className="text-center mb-16 border-b border-stone-200 pb-8">
                <h2 className="text-4xl font-light tracking-wider text-stone-900 mb-3 uppercase letter-spacing-wider">
                  {viewingMenu.name}
                </h2>
                <div className="text-xs text-stone-500 tracking-widest uppercase">
                  {viewingMenu.recipeIds.length} {viewingMenu.recipeIds.length === 1 ? 'Dish' : 'Dishes'}
                </div>
              </div>
              
              {/* Menu Items - Clean Lines */}
              <div className="space-y-12 mb-16">
                {recipes
                  .filter(r => {
                    const recipeId = r.id || r.name;
                    return viewingMenu.recipeIds.includes(recipeId);
                  })
                  .map((recipe, index) => {
                    return (
                      <div key={recipe.id || recipe.name || index} className="border-b border-stone-100 pb-8 last:border-0 last:pb-0">
                        <div className="flex items-start justify-between gap-8">
                          {/* Left: Number, Name and Details */}
                          <div className="flex-1 flex items-start gap-4">
                            <span className="text-stone-400 text-xl font-light tracking-wide mt-1">
                              {index + 1}
                            </span>
                            <div className="flex-1">
                              <h3 className="text-2xl font-light text-stone-900 mb-2 tracking-wide">
                                {recipe.name}
                              </h3>
                              <div className="flex items-center gap-4 text-xs text-stone-500 uppercase tracking-wider mt-3">
                                <span>{recipe.cuisine}</span>
                                <span className="text-stone-300">•</span>
                                <span>{recipe.protein}</span>
                                <span className="text-stone-300">•</span>
                                <span>{recipe.time}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Right: Calories - Minimalist (conditionally shown) */}
                          {showCalories && (
                            <div className="text-right">
                              <div className="text-xl font-light text-stone-700 tracking-wide">
                                {recipe.cals}
                              </div>
                              <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">
                                kcal
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
              
              {/* Menu Footer - Subtle */}
              <div className="border-t border-stone-200 pt-8 text-center">
                {showCalories && (
                  <div className="mb-6">
                    <div className="text-xs text-stone-400 uppercase tracking-widest mb-2">Total</div>
                    <div className="text-3xl font-light text-stone-900 tracking-wide">
                      {recipes.filter(r => {
                        const recipeId = r.id || r.name;
                        return viewingMenu.recipeIds.includes(recipeId);
                      }).reduce((sum, r) => sum + r.cals, 0)}
                      <span className="text-lg text-stone-500 ml-2">kcal</span>
                    </div>
                  </div>
                )}
                <button
                  onClick={() => {
                    loadMenu(viewingMenu.recipeIds);
                    setViewingMenu(null);
                    setShowCalories(true); // Reset to default when closing
                  }}
                  className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // --- RENDER: BROWSE ALL VIEW ---
  const renderBrowse = () => {
    // Get all unique freeform tags for filter dropdown
    const allFreeformTags = Array.from(new Set(
      recipes
        .map(r => r.freeformTag)
        .filter(tag => tag && tag.trim() !== '')
    )).sort();

    const filteredRecipes = recipes.filter(r => {
      const matchCuisine = lockCuisine === "All" || r.cuisine === lockCuisine;
      const matchProtein = lockProtein === "All" || r.protein === lockProtein;
      
      // Health tag filter
      const recipeHealthTag = getHealthTag(r.cals || 0, r.healthTag).label;
      const matchHealthTag = lockHealthTag === "All" || recipeHealthTag === lockHealthTag;
      
      // Freeform tag filter
      const matchFreeformTag = lockFreeformTag === "All" || 
        (lockFreeformTag !== "All" && r.freeformTag && r.freeformTag.trim() === lockFreeformTag);
      
      return matchCuisine && matchProtein && matchHealthTag && matchFreeformTag;
    });

    return (
      <div className="min-h-screen bg-white pb-32">
        <div className={`bg-white p-8 sticky top-0 z-10 border-b border-stone-200 transition-transform duration-300 ${
          showFilters ? 'translate-y-0' : '-translate-y-full'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-light text-stone-900 tracking-wider uppercase mb-2">Browse</h2>
              <div className="text-xs text-stone-500 uppercase tracking-widest">
                {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'}
              </div>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
            >
              Add Dish
            </button>
          </div>

          {/* Filters - Minimalist */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
             <div>
              <select 
                value={lockCuisine === "All" ? "" : lockCuisine} 
                onChange={(e) => setLockCuisine(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Cuisines</option>
                {CUISINES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <select 
                value={lockProtein === "All" ? "" : lockProtein} 
                onChange={(e) => setLockProtein(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Proteins</option>
                {PROTEINS.filter(p => p !== 'All').map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>

            <div>
              <select 
                value={lockHealthTag === "All" ? "" : lockHealthTag} 
                onChange={(e) => setLockHealthTag(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Health Levels</option>
                {HEALTH_TAGS.filter(tag => tag !== 'All').map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
            
            <div>
              <select 
                value={lockFreeformTag === "All" ? "" : lockFreeformTag} 
                onChange={(e) => setLockFreeformTag(e.target.value || "All")}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="" disabled>Others</option>
                {allFreeformTags.map(tag => <option key={tag} value={tag}>{tag}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="p-8 max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {filteredRecipes.map((recipe, index) => {
              const recipeId = recipe.id || recipe.name || index;
              return (
                <RecipeCardSmall
                  key={recipeId}
                  recipe={recipe}
                  onAddToMenu={openMenuSelector}
                  onDelete={handleDeleteDish}
                  onView={(recipe) => {
                    setViewingRecipe(recipe);
                    setRecipeNote(recipe.notes || '');
                  }}
                />
              );
            })}
          </div>

          {filteredRecipes.length === 0 && (
             <div className="text-center py-16">
               <p className="text-stone-400 mb-4">No recipes found matching these filters.</p>
               <button 
                  onClick={() => {
                    setLockCuisine("All");
                    setLockProtein("All");
                    setLockHealthTag("All");
                    setLockFreeformTag("All");
                  }}
                  className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
               >
                 Clear Filters
               </button>
             </div>
          )}
        </div>

        {/* Menu Selector Modal - Minimalist */}
        {showMenuSelector && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-md w-full mx-auto px-4 py-12 pb-32">
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => {
                    setShowMenuSelector(false);
                    setSelectedRecipeForMenu(null);
                  }}
                  className="text-stone-400 hover:text-stone-900 transition-colors p-2"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="text-center mb-12 border-b border-stone-200 pb-8">
                <h3 className="text-2xl font-light text-stone-900 tracking-wide uppercase mb-2">Add to Menu</h3>
                {selectedRecipeForMenu && (
                  <p className="text-sm text-stone-500 uppercase tracking-wider mt-2">
                    {selectedRecipeForMenu.name}
                  </p>
                )}
              </div>

              <div className="space-y-4 max-h-64 overflow-y-auto mb-8">
                {savedMenus.length === 0 ? (
                  <p className="text-stone-400 text-sm text-center py-8">
                    No menus yet. Create one below.
                  </p>
                ) : (
                  savedMenus.map(menu => {
                    const recipeId = selectedRecipeForMenu?.id || selectedRecipeForMenu?.name;
                    const isAlreadyInMenu = menu.recipeIds.includes(recipeId);
                    
                    return (
                      <button
                        key={menu.id}
                        onClick={() => !isAlreadyInMenu && addToMenu(menu.id)}
                        disabled={isAlreadyInMenu}
                        className={`w-full p-4 text-left border-b border-stone-100 transition-colors ${
                          isAlreadyInMenu
                            ? 'text-stone-300 cursor-not-allowed'
                            : 'text-stone-900 hover:text-stone-600'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-light text-lg tracking-wide mb-1">{menu.name}</p>
                            <p className="text-xs text-stone-500 uppercase tracking-wider">{menu.recipeIds.length} dishes</p>
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>

              <div className="border-t border-stone-200 pt-8">
                <p className="text-xs text-stone-500 uppercase tracking-widest mb-4 text-center">Or create a new menu</p>
                <div className="flex gap-3">
                  <input
                    type="text"
                    placeholder="Menu name (optional)"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    className="flex-1 p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none text-sm bg-transparent"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        createMenuAndAdd();
                      }
                    }}
                  />
                  <button
                    onClick={createMenuAndAdd}
                    className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1 disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Create
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recipe Detail Modal - Minimalist */}
        {viewingRecipe && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-2xl w-full mx-auto px-4 py-12 pb-32">
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => {
                    setViewingRecipe(null);
                    setRecipeNote('');
                  }}
                  className="text-stone-400 hover:text-stone-900 transition-colors p-2"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              {/* Recipe Image */}
              <div className="mb-8">
                <img 
                  src={viewingRecipe.img} 
                  alt={viewingRecipe.name}
                  className="w-full h-64 object-cover border border-stone-200"
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = `https://placehold.co/800x400/f5f5f4/78716c?text=${viewingRecipe.name.split(' ').map(n=>n[0]).join('')}`; 
                  }}
                />
              </div>
              
              {/* Recipe Header */}
              <div className="text-center mb-12 border-b border-stone-200 pb-8">
                <h2 className="text-4xl font-light text-stone-900 tracking-wider uppercase mb-4">
                  {viewingRecipe.name}
                </h2>
                <div className="flex items-center justify-center gap-4 text-xs text-stone-500 uppercase tracking-wider">
                  <span>{viewingRecipe.cuisine}</span>
                  <span className="text-stone-300">•</span>
                  <span>{viewingRecipe.protein}</span>
                  <span className="text-stone-300">•</span>
                  <span>{viewingRecipe.time}</span>
                </div>
              </div>
              
              {/* Recipe Details */}
              <div className="space-y-8 mb-12">
                <div className="flex items-start justify-between border-b border-stone-100 pb-6">
                  <div>
                    <div className="text-xs text-stone-400 uppercase tracking-widest mb-2">Calories</div>
                    <div className="text-3xl font-light text-stone-900 tracking-wide">
                      {viewingRecipe.cals}
                      <span className="text-lg text-stone-500 ml-2">kcal</span>
                    </div>
                  </div>
                </div>
                
                {/* Tags */}
                <div className="border-b border-stone-100 pb-6">
                  <div className="text-xs text-stone-400 uppercase tracking-widest mb-4">Tags</div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Cuisine</div>
                      <div className="flex flex-wrap gap-3">
                        <span className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded text-xs font-light tracking-wide">
                          {viewingRecipe.cuisine}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Protein</div>
                      <div className="flex flex-wrap gap-3">
                        <span className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded text-xs font-light tracking-wide">
                          {viewingRecipe.protein}
                        </span>
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Health Level</div>
                      <div className="flex flex-wrap gap-3">
                        {(() => {
                          const healthTag = getHealthTag(viewingRecipe.cals || 0, viewingRecipe.healthTag);
                          return (
                            <span className={`${healthTag.color} px-3 py-1.5 rounded text-xs font-light tracking-wide`}>
                              {healthTag.label}
                            </span>
                          );
                        })()}
                      </div>
                    </div>
                    {viewingRecipe.freeformTag && (
                      <div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mb-2">Custom Tags</div>
                        <div className="flex flex-wrap gap-3">
                          <span className="bg-stone-100 text-stone-600 px-3 py-1.5 rounded text-xs font-light tracking-wide">
                            {viewingRecipe.freeformTag}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Notes Section */}
                <div className="border-b border-stone-100 pb-6">
                  <div className="text-xs text-stone-400 uppercase tracking-widest mb-4">Recipe Notes</div>
                  <textarea
                    value={recipeNote}
                    onChange={(e) => setRecipeNote(e.target.value)}
                    placeholder="Add your recipe notes, ingredients, instructions, or any other details here..."
                    className="w-full p-4 border border-stone-200 focus:border-stone-900 focus:outline-none bg-transparent resize-none font-light text-stone-900 leading-relaxed min-h-[200px]"
                    rows={8}
                  />
                  <button
                    onClick={async () => {
                      if (!viewingRecipe || !isAuthReady || !db) return;
                      
                      const recipeId = viewingRecipe.id || viewingRecipe.name;
                      
                      // If it's a Firebase recipe, save notes to Firebase
                      if (viewingRecipe.id && typeof viewingRecipe.id === 'string' && viewingRecipe.id.length >= 20 && !viewingRecipe.id.startsWith('local_')) {
                        try {
                          const recipeDocRef = doc(db, `/artifacts/${appId}/sharedRecipes`, viewingRecipe.id);
                          await updateDoc(recipeDocRef, { notes: recipeNote });
                          // Update local state
                          setRecipes(prevRecipes => prevRecipes.map(r => {
                            const rId = r.id || r.name;
                            return rId === recipeId ? { ...r, notes: recipeNote } : r;
                          }));
                          alert('Notes saved!');
                        } catch (e) {
                          console.error("Error saving notes:", e);
                          alert('Failed to save notes. Please try again.');
                        }
                      } else {
                        // Local recipe - update local state
                        setRecipes(prevRecipes => prevRecipes.map(r => {
                          const rId = r.id || r.name;
                          return rId === recipeId ? { ...r, notes: recipeNote } : r;
                        }));
                        alert('Notes saved!');
                      }
                    }}
                    className="mt-4 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-1"
                  >
                    Save Notes
                  </button>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-4 border-t border-stone-200 pt-8 pb-8">
                <button
                  onClick={() => {
                    setViewingRecipe(null);
                    setEditingRecipe(viewingRecipe);
                    setNewDish({
                      name: viewingRecipe.name,
                      cuisine: viewingRecipe.cuisine,
                      protein: viewingRecipe.protein,
                      cals: viewingRecipe.cals.toString(),
                      time: viewingRecipe.time,
                      img: viewingRecipe.img,
                      healthTag: viewingRecipe.healthTag || 'Healthy',
                      freeformTag: viewingRecipe.freeformTag || ''
                    });
                    setImagePreview(null);
                    setImageFile(null);
                    setRecipeNote(viewingRecipe.notes || '');
                    setShowAddForm(true);
                  }}
                  className="flex-1 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-1 flex items-center justify-center gap-2"
                >
                  <Pencil size={16} strokeWidth={1.5} />
                  Edit
                </button>
                <button
                  onClick={() => setViewingRecipe(null)}
                  className="flex-1 text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Dish Modal - Minimalist */}
        {showAddForm && (
          <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
            <div className="max-w-md w-full mx-auto px-4 py-12 pb-32">
              <div className="flex justify-end mb-8">
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRecipe(null);
                    setNewDish({
                      name: '',
                      cuisine: 'Mediterranean',
                      protein: 'Chicken',
                      cals: '',
                      time: '',
                      img: '',
                      healthTag: 'Healthy',
                      freeformTag: ''
                    });
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="text-stone-400 hover:text-stone-900 transition-colors p-2"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="text-center mb-12 border-b border-stone-200 pb-8">
                <h3 className="text-2xl font-light text-stone-900 tracking-wide uppercase">
                  {editingRecipe ? 'Edit Dish' : 'Add New Dish'}
                </h3>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Dish Name</label>
                  <input
                    type="text"
                    value={newDish.name}
                    onChange={(e) => setNewDish({...newDish, name: e.target.value})}
                    placeholder="e.g., Grilled Salmon"
                    className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Cuisine</label>
                    <select
                      value={newDish.cuisine}
                      onChange={(e) => setNewDish({...newDish, cuisine: e.target.value})}
                      className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent appearance-none"
                    >
                      {CUISINES.filter(c => c !== 'All').map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Protein</label>
                    <select
                      value={newDish.protein}
                      onChange={(e) => setNewDish({...newDish, protein: e.target.value})}
                      className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent appearance-none"
                    >
                      {PROTEINS.filter(p => p !== 'All').map(p => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Calories</label>
                    <input
                      type="number"
                      value={newDish.cals}
                      onChange={(e) => setNewDish({...newDish, cals: e.target.value})}
                      placeholder="320"
                      className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Prep Time</label>
                    <input
                      type="text"
                      value={newDish.time}
                      onChange={(e) => setNewDish({...newDish, time: e.target.value})}
                      placeholder="25m"
                      className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Health Level</label>
                    <select
                      value={newDish.healthTag}
                      onChange={(e) => setNewDish({...newDish, healthTag: e.target.value})}
                      className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent appearance-none"
                    >
                      <option value="Healthy">Healthy</option>
                      <option value="Moderate Healthy">Moderate Healthy</option>
                      <option value="Guilty Pleasure">Guilty Pleasure</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Custom Tags</label>
                    <input
                      type="text"
                      value={newDish.freeformTag}
                      onChange={(e) => setNewDish({...newDish, freeformTag: e.target.value})}
                      placeholder="e.g., Quick, Spicy, Vegan"
                      className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Image</label>
                  
                  {(imagePreview || (editingRecipe && editingRecipe.img && !imagePreview && (newDish.img || newDish.img === editingRecipe.img))) ? (
                    <div className="relative">
                      <img 
                        src={imagePreview || newDish.img || editingRecipe?.img} 
                        alt="Preview" 
                        className="w-full h-48 object-cover border border-stone-200"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="absolute top-3 right-3 text-stone-400 hover:text-stone-900 transition-colors p-1"
                        title="Remove image"
                      >
                        <X size={16} strokeWidth={1.5} />
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <label className="flex flex-col items-center justify-center w-full h-32 border border-stone-300 cursor-pointer hover:border-stone-900 transition-colors">
                        <div className="flex flex-col items-center justify-center">
                          <p className="text-xs text-stone-500 uppercase tracking-wider mb-1">Click to upload</p>
                          <p className="text-xs text-stone-400">PNG, JPG, GIF</p>
                        </div>
                        <input 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageSelect}
                        />
                      </label>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <div className="w-full border-t border-stone-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-white px-2 text-stone-400">Or</span>
                        </div>
                      </div>
                      
                      <input
                        type="url"
                        value={newDish.img}
                        onChange={(e) => setNewDish({...newDish, img: e.target.value})}
                        placeholder="Enter image URL..."
                        className="w-full p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none bg-transparent"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-4 mt-12 border-t border-stone-200 pt-8">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingRecipe(null);
                    setNewDish({
                      name: '',
                      cuisine: 'Mediterranean',
                      protein: 'Chicken',
                      cals: '',
                      time: '',
                      img: '',
                      healthTag: 'Healthy',
                      freeformTag: ''
                    });
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="flex-1 text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddDish}
                  className="flex-1 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-1"
                >
                  {editingRecipe ? 'Save Changes' : 'Add Dish'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };


  // --- RENDER: PRIMARY VIEW ROUTING ---
  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin text-stone-900 mb-4" strokeWidth={1.5} />
        <p className="text-sm uppercase tracking-widest">Loading</p>
      </div>
    );
  }

  // --- RENDER: TAB NAVIGATION ---
  const renderTabs = () => {
    const tabs = [
      { id: 'spin', label: 'Spin', icon: RefreshCw },
      { id: 'browse', label: 'Browse', icon: BookOpen },
      { id: 'menus', label: 'Menus', icon: List, badge: currentMenuCount }
    ];

    return (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 z-50 pb-safe">
        <div className="flex justify-around items-center px-2 py-4">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = view === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-2 transition-all relative ${
                  isActive 
                    ? 'text-stone-900' 
                    : 'text-stone-400 hover:text-stone-600'
                }`}
              >
                <div className="relative">
                  <Icon size={20} strokeWidth={isActive ? 2 : 1.5} />
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <div className="absolute -top-1 -right-1 bg-stone-900 text-white text-[10px] font-light w-4 h-4 flex items-center justify-center border border-white">
                      {tab.badge}
                    </div>
                  )}
                </div>
                <span className={`text-[10px] uppercase tracking-widest ${isActive ? 'text-stone-900 font-light' : 'text-stone-400'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  // --- RENDER: SPIN VIEW ---
  const renderSpin = () => {
    return (
      <div className="min-h-screen bg-white flex flex-col font-sans text-stone-900 pb-32">
      
      {/* Top Bar */}
      <div className="px-8 pt-8 pb-4">
        <div className="text-center">
          <h1 className="text-3xl font-light text-stone-900 tracking-wider uppercase mb-2">Clean Eats</h1>
          <p className="text-xs text-stone-500 uppercase tracking-widest">Randomizer</p>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 pb-24">
        
        {/* Slot Machine Display */}
        <div className="w-full max-w-md bg-white border border-stone-200 p-8 mb-12 relative">
          
          {/* Visual Reels */}
          <div className="flex justify-between gap-4 mb-8 border-b border-stone-200 pb-6">
            <SlotReel value={currentRecipe.cuisine} label="Cuisine" isSpinning={isSpinning} icon={Utensils} />
            <SlotReel value={currentRecipe.protein} label="Protein" isSpinning={isSpinning} icon={Dna} />
            <SlotReel value={currentRecipe.cals + " kcal"} label="Energy" isSpinning={isSpinning} icon={Flame} />
          </div>

          {/* Featured Card - Swipeable */}
          <div className="relative group">
            <div 
              className="relative bg-white overflow-hidden border border-stone-200 cursor-grab active:cursor-grabbing select-none"
              style={{
                transform: `translateX(${swipePosition.x}px) rotate(${swipePosition.x * 0.1}deg)`,
                transition: isDragging ? 'none' : 'transform 0.3s ease-out',
                opacity: isDragging ? 1 - Math.abs(swipePosition.x) / 300 : 1
              }}
              onMouseDown={handleSwipeStart}
              onMouseMove={handleSwipeMove}
              onMouseUp={handleSwipeEnd}
              onMouseLeave={handleSwipeEnd}
              onTouchStart={handleSwipeStart}
              onTouchMove={handleSwipeMove}
              onTouchEnd={handleSwipeEnd}
            >
              {/* Swipe indicators */}
              {isDragging && (
                <>
                  {swipePosition.x > 50 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 z-10">
                      <div className="text-stone-900 text-xl font-light tracking-wider uppercase flex items-center gap-2">
                        <Heart size={20} strokeWidth={1.5} />
                        Like
                      </div>
                    </div>
                  )}
                  {swipePosition.x < -50 && (
                    <div className="absolute inset-0 flex items-center justify-center bg-stone-900/10 z-10">
                      <div className="text-stone-900 text-xl font-light tracking-wider uppercase">
                        Pass
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <div className="h-48 overflow-hidden relative">
                 <img 
                    src={currentRecipe.img} 
                    alt={currentRecipe.name} 
                    className={`w-full h-full object-cover transition-transform duration-700 ${isSpinning ? 'blur-sm scale-110' : 'blur-0 scale-100'}`}
                    onError={(e) => { e.target.onerror = null; e.target.src = `https://placehold.co/400x192/d97706/ffffff?text=${currentRecipe.name.split(' ').map(n=>n[0]).join('')}`; }}
                    draggable={false}
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-stone-900/80 p-4">
                    <h2 className="text-white font-light text-xl leading-tight tracking-wide">
                      {isSpinning ? "Spinning..." : currentRecipe.name}
                    </h2>
                  </div>
              </div>
              
              <div className="p-6 border-t border-stone-200">
                <div className="flex items-center justify-between text-xs text-stone-500 uppercase tracking-wider">
                  <span>{currentRecipe.time}</span>
                  <span className="text-stone-300">•</span>
                  <span>{currentRecipe.protein === 'Vegetarian' ? 'Vegetarian' : currentRecipe.protein}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full max-w-md space-y-4">
          
          {/* Lock Filters */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Cuisine</label>
              <select 
                value={lockCuisine} 
                onChange={(e) => setLockCuisine(e.target.value)}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                {CUISINES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            
            <div>
              <label className="block text-xs text-stone-500 uppercase tracking-widest mb-2">Protein</label>
              <select 
                value={lockProtein} 
                onChange={(e) => setLockProtein(e.target.value)}
                className="w-full bg-transparent border-b border-stone-300 focus:border-stone-900 text-sm font-light text-stone-700 py-2 appearance-none cursor-pointer focus:outline-none"
              >
                {PROTEINS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-4">
            <button 
              onClick={handleSwipePass}
              disabled={isSpinning}
              className="flex-1 text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <X size={18} strokeWidth={1.5} />
              Pass
            </button>
            <button 
              onClick={handleSwipeLike}
              disabled={isSpinning}
              className="flex-1 text-stone-900 hover:text-stone-600 text-sm uppercase tracking-widest border-b border-stone-900 hover:border-stone-600 transition-colors pb-2 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Heart size={18} strokeWidth={1.5} />
              Like
            </button>
          </div>
          
          {/* Spin Button (Alternative) */}
          <button 
            onClick={handleSpin}
            disabled={isSpinning}
            className="w-full text-stone-500 hover:text-stone-900 text-xs uppercase tracking-widest border-b border-stone-200 hover:border-stone-900 transition-colors pb-2 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <RefreshCw size={16} className={isSpinning ? 'animate-spin' : ''} strokeWidth={1.5} />
            {isSpinning ? "Finding..." : "Skip to Next"}
          </button>
          
        </div>
      </div>
      
      {/* Menu Selector Modal - Minimalist */}
      {showMenuSelector && (
        <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="max-w-md w-full mx-auto px-4 py-12 pb-32">
            <div className="flex justify-end mb-8">
              <button
                onClick={() => {
                  setShowMenuSelector(false);
                  setSelectedRecipeForMenu(null);
                }}
                className="text-stone-400 hover:text-stone-900 transition-colors p-2"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="text-center mb-12 border-b border-stone-200 pb-8">
              <h3 className="text-2xl font-light text-stone-900 tracking-wide uppercase mb-2">Add to Menu</h3>
              {selectedRecipeForMenu && (
                <p className="text-sm text-stone-500 uppercase tracking-wider mt-2">
                  {selectedRecipeForMenu.name}
                </p>
              )}
            </div>

            <div className="space-y-4 max-h-64 overflow-y-auto mb-8">
              {savedMenus.length === 0 ? (
                <p className="text-stone-400 text-sm text-center py-8">
                  No menus yet. Create one below.
                </p>
              ) : (
                savedMenus.map(menu => {
                  const recipeId = selectedRecipeForMenu?.id || selectedRecipeForMenu?.name;
                  const isAlreadyInMenu = menu.recipeIds.includes(recipeId);
                  
                  return (
                    <button
                      key={menu.id}
                      onClick={() => !isAlreadyInMenu && addToMenu(menu.id)}
                      disabled={isAlreadyInMenu}
                      className={`w-full p-4 text-left border-b border-stone-100 transition-colors ${
                        isAlreadyInMenu
                          ? 'text-stone-300 cursor-not-allowed'
                          : 'text-stone-900 hover:text-stone-600'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-light text-lg tracking-wide mb-1">{menu.name}</p>
                          <p className="text-xs text-stone-500 uppercase tracking-wider">{menu.recipeIds.length} dishes</p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            <div className="border-t border-stone-200 pt-8">
              <p className="text-xs text-stone-500 uppercase tracking-widest mb-4 text-center">Or create a new menu</p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="Menu name (optional)"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  className="flex-1 p-3 border-b border-stone-300 focus:border-stone-900 focus:outline-none text-sm bg-transparent"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      createMenuAndAdd();
                    }
                  }}
                />
                <button
                  onClick={createMenuAndAdd}
                  className="text-stone-600 hover:text-stone-900 text-sm uppercase tracking-widest border-b border-stone-300 hover:border-stone-900 transition-colors pb-1 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Tab Navigation */}
      {renderTabs()}
    </div>
    );
  };

  // --- RENDER: PRIMARY VIEW ROUTING ---
  if (view === 'browse') {
    return (
      <>
        {renderBrowse()}
        {renderTabs()}
      </>
    );
  }
  
  if (view === 'menus') {
    return (
      <>
        {renderMenuManager()}
        {renderTabs()}
      </>
    );
  }

  // Default: Spin view
  return renderSpin();
}

