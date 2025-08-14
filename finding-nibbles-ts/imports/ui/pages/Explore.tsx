import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { saveDishInteraction, saveSearchTerm, getPersonalizedRecommendations } from '../api/recommender';

// Defining type for dish object
type Dish = {
  id: number;
  name: string;
  restaurant: string;
  image: string;
  description: string;
  reason?: string;
  isRecommended?: boolean;
};

// Card component for displaying a dish with thumbs up/down buttons
const DishCard = ({ dish, onSwipe }: { dish: Dish; onSwipe: (action: 'like' | 'dislike') => void }) => {
  return (
    <motion.div
      key={dish.id}
      className="absolute top-0 left-0 w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col max-w-full"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -200 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}>

      {/* Image or placeholder */}
      {dish.image ? (
        <img src={dish.image} alt={dish.name} className="w-full h-64 object-cover"/>
      ) : (
        <div className="w-full h-64 bg-gradient-to-br from-[#C47B4D] to-[#a95f30] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="text-6xl mb-2">🍽️</div>
            <p className="text-lg font-semibold">No Image Available</p>
          </div>
        </div>
      )}
      
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-[#4b2e19] mb-2">{dish.name}</h3>
        <p className="text-sm text-[#7a5c43] mb-2">{dish.restaurant}</p>
        <p className="text-[#4b2e19] text-sm flex-1">{dish.description}</p>
        {dish.reason && (
          <p className="mt-2 text-xs text-[#7a5c43] italic">
            💡 {dish.reason}
          </p>
        )}
      </div>
      
      <div className="flex justify-around pb-4">
        <button onClick={() => onSwipe('dislike')} className="w-1/2 mx-2 h-20 bg-red-200 hover:bg-red-300 text-red-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Dislike"><ThumbDownIcon /></button>
        <button onClick={() => onSwipe('like')} className="w-1/2 mx-2 h-20 bg-green-200 hover:bg-green-300 text-green-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Like"><ThumbUpIcon /></button>
      </div>
    </motion.div>
  );
};

// Slider component for each section
const DishSlider = ({ 
  title, 
  dishes, 
  currentIndex, 
  onSwipe, 
  onNext, 
  onRefresh,
  isLoading 
}: { 
  title: string;
  dishes: Dish[];
  currentIndex: number;
  onSwipe: (action: 'like' | 'dislike') => void;
  onNext: () => void;
  onRefresh: () => void;
  isLoading: boolean;
}) => {
  const currentDish = dishes[currentIndex];

  return (
    <div className="max-w-5xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">{title}</h2>
      <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 w-full max-w-5xl h-[500px] mx-auto relative text-[#7a5c43]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg">Loading dishes...</p>
          </div>
        ) : (
          <AnimatePresence>
            {currentDish ? (
              <DishCard key={currentDish.id} dish={currentDish} onSwipe={onSwipe} />
            ) : (
              <div className="text-center">
                <p className="text-lg mb-4">You've seen all the dishes!</p>
                <button 
                  onClick={onRefresh}
                  className="px-6 py-3 bg-[#C47B4D] text-white rounded-xl hover:bg-[#a95f30] transition-colors"
                >
                  Get More Dishes
                </button>
              </div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};

export const Explore = () => {
  const { userPreferences, isLoading } = useUserPreferences();
  
  // State for each slider
  const [tryNewDishes, setTryNewDishes] = useState<Dish[]>([]);
  const [recommendedDishes, setRecommendedDishes] = useState<Dish[]>([]);
  const [specialOccasionDishes, setSpecialOccasionDishes] = useState<Dish[]>([]);
  
  // Current indices for each slider
  const [tryNewIndex, setTryNewIndex] = useState(0);
  const [recommendedIndex, setRecommendedIndex] = useState(0);
  const [specialOccasionIndex, setSpecialOccasionIndex] = useState(0);
  
  // Loading states for each slider
  const [isLoadingTryNew, setIsLoadingTryNew] = useState(false);
  const [isLoadingRecommended, setIsLoadingRecommended] = useState(false);
  const [isLoadingSpecial, setIsLoadingSpecial] = useState(false);
  
  const [hasInitialized, setHasInitialized] = useState(false);

  // Load all dish categories when component mounts
  useEffect(() => {
    if (!hasInitialized) {
      loadAllDishes();
      setHasInitialized(true);
    }
  }, []); // Empty dependency array - only run once

  const loadAllDishes = async () => {
    await Promise.all([
      loadTryNewDishes(),
      loadRecommendedDishes(),
      loadSpecialOccasionDishes()
    ]);
  };

  const loadTryNewDishes = async () => {
    setIsLoadingTryNew(true);
    try {
      const dishes = await getPersonalizedRecommendations('try-new');
      setTryNewDishes(dishes);
      setTryNewIndex(0);
    } catch (error) {
      console.error('Error loading try new dishes:', error);
      setTryNewDishes(sampleDishes);
    } finally {
      setIsLoadingTryNew(false);
    }
  };

  const loadRecommendedDishes = async () => {
    setIsLoadingRecommended(true);
    try {
      const dishes = await getPersonalizedRecommendations('recommended');
      setRecommendedDishes(dishes);
      setRecommendedIndex(0);
    } catch (error) {
      console.error('Error loading recommended dishes:', error);
      setRecommendedDishes(sampleDishes);
    } finally {
      setIsLoadingRecommended(false);
    }
  };

  const loadSpecialOccasionDishes = async () => {
    setIsLoadingSpecial(true);
    try {
      const dishes = await getPersonalizedRecommendations('special-occasion');
      setSpecialOccasionDishes(dishes);
      setSpecialOccasionIndex(0);
    } catch (error) {
      console.error('Error loading special occasion dishes:', error);
      setSpecialOccasionDishes(sampleDishes);
    } finally {
      setIsLoadingSpecial(false);
    }
  };

  // Handle preferences for each slider
  const handleTryNewPreference = async (action: 'like' | 'dislike') => {
    const dish = tryNewDishes[tryNewIndex];
    if (!dish) return;

    try {
      await saveDishInteraction(dish, action);
    } catch (error) {
      console.error('Error saving preference:', error);
    }
    
    setTryNewIndex((prev) => prev + 1);
    
    if (tryNewIndex >= tryNewDishes.length - 2) {
      loadTryNewDishes();
    }
  };

  const handleRecommendedPreference = async (action: 'like' | 'dislike') => {
    const dish = recommendedDishes[recommendedIndex];
    if (!dish) return;

    try {
      await saveDishInteraction(dish, action);
    } catch (error) {
      console.error('Error saving preference:', error);
    }
    
    setRecommendedIndex((prev) => prev + 1);
    
    if (recommendedIndex >= recommendedDishes.length - 2) {
      loadRecommendedDishes();
    }
  };

  const handleSpecialOccasionPreference = async (action: 'like' | 'dislike') => {
    const dish = specialOccasionDishes[specialOccasionIndex];
    if (!dish) return;

    try {
      await saveDishInteraction(dish, action);
    } catch (error) {
      console.error('Error saving preference:', error);
    }
    
    setSpecialOccasionIndex((prev) => prev + 1);
    
    if (specialOccasionIndex >= specialOccasionDishes.length - 2) {
      loadSpecialOccasionDishes();
    }
  };

  // Handle search
  const handleSearch = async (searchTerm: string) => {
    if (searchTerm.trim()) {
      try {
        await saveSearchTerm(searchTerm.trim());
        // Reload recommendations with new search term
        loadRecommendedDishes();
      } catch (error) {
        console.error('Error saving search term:', error);
      }
    }
  };

  // Sample dishes as fallback
  const sampleDishes: Dish[] = [
    {
      id: 1,
      name: 'Lanzhou Beef Noodles',
      restaurant: 'Bowltiful',
      image: '',
      description: 'Hand-pulled noodles, flavorful halal beef, and rich broth.',
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      restaurant: 'Pizza Hut',
      image: '',
      description: 'Lots of pepperoni and mozzarella cheese.',
    },
    {
      id: 3,
      name: 'Subdog',
      restaurant: 'Subway',
      image: '',
      description: 'The American-style hotdog with mozzarella cheese, tomato sauce and limited-edition tangy mustard',
    },
  ];

  return (
    <div className="flex min-h-screen bg-[#fdfaf7]">
      <div className="flex flex-col flex-1 py-8 px-4 sm:px-6 space-y-12">
        {/* Page heading */}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#4b2e19] mb-2">Explore</h1>
        </div>

        {/* Search input field */}
        <div className="max-w-5xl mx-auto w-full">
          <input
            type="text"
            placeholder="Search for a dish or restaurant..."
            className="w-full px-4 py-3 border border-[#e2cfc3] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d9bca8] text-[#4b2e19] bg-white"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleSearch((e.target as HTMLInputElement).value);
              }
            }}
          />
        </div>

        {/* Try New Slider */}
        <DishSlider
          title="Try New"
          dishes={tryNewDishes}
          currentIndex={tryNewIndex}
          onSwipe={handleTryNewPreference}
          onNext={() => setTryNewIndex(prev => prev + 1)}
          onRefresh={loadTryNewDishes}
          isLoading={isLoadingTryNew}
        />

        {/* Recommended Dishes Slider */}
        <DishSlider
          title="Recommended Dishes"
          dishes={recommendedDishes}
          currentIndex={recommendedIndex}
          onSwipe={handleRecommendedPreference}
          onNext={() => setRecommendedIndex(prev => prev + 1)}
          onRefresh={loadRecommendedDishes}
          isLoading={isLoadingRecommended}
        />

        {/* Special Occasion Slider */}
        <DishSlider
          title="Special Occasion"
          dishes={specialOccasionDishes}
          currentIndex={specialOccasionIndex}
          onSwipe={handleSpecialOccasionPreference}
          onNext={() => setSpecialOccasionIndex(prev => prev + 1)}
          onRefresh={loadSpecialOccasionDishes}
          isLoading={isLoadingSpecial}
        />

        {/* User Preferences Summary */}
        {userPreferences && (
          <div className="max-w-5xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Your Preferences</h2>
            <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <h3 className="font-bold text-[#4b2e19]">Liked Dishes</h3>
                  <p className="text-2xl text-green-600">{userPreferences.likedDishes.length}</p>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-[#4b2e19]">Disliked Dishes</h3>
                  <p className="text-2xl text-red-600">{userPreferences.dislikedDishes.length}</p>
                </div>
                <div className="text-center">
                  <h3 className="font-bold text-[#4b2e19]">Searches</h3>
                  <p className="text-2xl text-blue-600">{userPreferences.searchHistory.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
