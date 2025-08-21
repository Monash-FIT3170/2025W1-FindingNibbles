import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { useUserPreferences } from '../hooks/useUserPreferences';
import { saveDishInteraction, saveSearchTerm, getPersonalizedRecommendations } from '../api/recommender';
import { findRestaurantsForMultipleDishes, getUserLocation, type NearbyRestaurant, type DishRestaurantMatch, testGooglePlacesAPI } from '../api/restaurantSearch';

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

// Card component for displaying a dish with thumbs up/down buttons and nearby restaurants
const DishCard = ({ 
  dish, 
  onSwipe, 
  nearbyRestaurants,
  showRestaurants,
  isLoadingRestaurants 
}: { 
  dish: Dish; 
  onSwipe: (action: 'like' | 'dislike') => void;
  nearbyRestaurants: NearbyRestaurant[];
  showRestaurants: boolean;
  isLoadingRestaurants: boolean;
}) => {
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
      
      <div className="p-4 flex-1 flex flex-col mb-4">
        <h3 className="text-xl font-bold text-[#4b2e19] mb-2">{dish.name}</h3>
        <p className="text-sm text-[#7a5c43] mb-2">{dish.restaurant}</p>
        <p className="text-[#4b2e19] text-sm flex-1">{dish.description}</p>
        {dish.reason && (
          <p className="mt-2 text-xs text-[#7a5c43] italic">
            💡 {dish.reason}
          </p>
        )}

        {/* Nearby Restaurants Section */}
        {showRestaurants && (
          <div className="mt-4 border-t border-[#e2cfc3] pt-3">
            <h4 className="text-sm font-semibold text-[#4b2e19] mb-2 flex items-center">
              <LocationOnIcon className="text-[#C47B4D] mr-1" />
              Nearby Restaurants
            </h4>
            <p className="text-xs text-[#7a5c43] mb-2">
              Restaurants are ranked by likelihood of serving this dish. Higher confidence scores indicate better matches.
            </p>
            {nearbyRestaurants.length > 0 ? (
              <>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {nearbyRestaurants
                    .filter(restaurant => restaurant.mightServeDish !== false) // Filter out restaurants that definitely don't serve the dish
                    .slice(0, 6)
                    .map((restaurant) => (
                    <div key={restaurant.id} className="bg-[#fff9f4] p-2 rounded-lg border border-[#e2cfc3]">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-[#4b2e19]">{restaurant.name}</p>
                          <p className="text-xs text-[#7a5c43]">{restaurant.address}</p>
                          {restaurant.mightServeDish !== undefined && (
                            <p className="text-xs text-[#C47B4D] font-medium">
                              {restaurant.mightServeDish ? 'Likely serves this dish' : 'May serve this dish'}
                              {restaurant.confidenceScore !== undefined && (
                                <span className="ml-1 text-[#7a5c43]">
                                  ({restaurant.confidenceScore}% match)
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-[#C47B4D] font-medium">
                            {Math.round((restaurant.distance || 0) / 1000 * 10) / 10}km
                          </p>
                          {restaurant.rating && (
                            <p className="text-xs text-[#7a5c43]">⭐ {restaurant.rating}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {nearbyRestaurants.filter(r => r.mightServeDish !== false).length === 0 && (
                  <div className="text-center py-2">
                    <p className="text-xs text-[#7a5c43]">
                      No restaurants found that likely serve this dish
                    </p>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-[#7a5c43]">
                  {isLoadingRestaurants ? 'Searching for restaurants...' : 'No restaurants found nearby'}
                </p>
                {!isLoadingRestaurants && (
                  <p className="text-xs text-[#7a5c43] mt-1">
                    Try expanding your search radius or check your location
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="flex justify-around pb-6 px-4">
        <button onClick={() => onSwipe('dislike')} className="w-1/2 mx-2 h-16 bg-red-200 hover:bg-red-300 text-red-800 rounded-xl shadow-lg flex items-center justify-center text-2xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Dislike"><ThumbDownIcon /></button>
        <button onClick={() => onSwipe('like')} className="w-1/2 mx-2 h-16 bg-green-200 hover:bg-green-300 text-green-800 rounded-xl shadow-lg flex items-center justify-center text-2xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Like"><ThumbUpIcon /></button>
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
  isLoading,
  nearbyRestaurants,
  showRestaurants,
  isLoadingRestaurants
}: { 
  title: string;
  dishes: Dish[];
  currentIndex: number;
  onSwipe: (action: 'like' | 'dislike') => void;
  onNext: () => void;
  onRefresh: () => void;
  isLoading: boolean;
  nearbyRestaurants: NearbyRestaurant[];
  showRestaurants: boolean;
  isLoadingRestaurants: boolean;
}) => {
  const currentDish = dishes[currentIndex];
  const currentRestaurants = currentDish ? nearbyRestaurants.filter(r => r.servesDish === currentDish.name) : [];

  return (
    <div className="max-w-5xl mx-auto w-full">
      <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">{title}</h2>
      <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 w-full max-w-5xl h-[700px] mx-auto relative text-[#7a5c43]">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-lg">Loading dishes...</p>
          </div>
        ) : (
          <AnimatePresence>
            {currentDish ? (
              <DishCard 
                key={currentDish.id} 
                dish={currentDish} 
                onSwipe={onSwipe}
                nearbyRestaurants={currentRestaurants}
                showRestaurants={showRestaurants}
                isLoadingRestaurants={isLoadingRestaurants}
              />
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

  // Restaurant data state
  const [allNearbyRestaurants, setAllNearbyRestaurants] = useState<NearbyRestaurant[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [showRestaurants, setShowRestaurants] = useState(true);
  const [isLoadingRestaurants, setIsLoadingRestaurants] = useState(false);

  // Load all dish categories when component mounts
  useEffect(() => {
    if (!hasInitialized) {
      initializeExplore();
      setHasInitialized(true);
    }
  }, []); // Empty dependency array - only run once

  const initializeExplore = async () => {
    try {
      // Get user location first
      const location = await getUserLocation();
      setUserLocation(location);
      
      // Test the Google Places API to see what's working
      console.log('Testing Google Places API...');
      await testGooglePlacesAPI(location.latitude, location.longitude);
      
      // Load dishes and restaurants in parallel
      await Promise.all([
        loadAllDishes(),
        loadNearbyRestaurants(location)
      ]);
    } catch (error) {
      console.error('Error initializing explore:', error);
      // Still load dishes even if location fails
      await loadAllDishes();
    }
  };

  const loadNearbyRestaurants = async (location: { latitude: number; longitude: number }) => {
    setIsLoadingRestaurants(true);
    try {
      // Get all dishes first
      const allDishes = [
        ...tryNewDishes,
        ...recommendedDishes,
        ...specialOccasionDishes
      ].filter(dish => dish.name); // Filter out empty dishes

      if (allDishes.length === 0) {
        // Wait for dishes to load first
        return;
      }

      console.log('Loading restaurants for dishes:', allDishes.map(d => d.name));

      const dishRestaurantMatches = await findRestaurantsForMultipleDishes(
        allDishes,
        location.latitude,
        location.longitude,
        5000 // 5km radius
      );

      // Flatten all restaurants into one array
      const allRestaurants = dishRestaurantMatches.flatMap(match => match.nearbyRestaurants);
      console.log(`Total restaurants found: ${allRestaurants.length}`);
      setAllNearbyRestaurants(allRestaurants);
    } catch (error) {
      console.error('Error loading nearby restaurants:', error);
      // Don't fail completely - just set empty array and continue
      setAllNearbyRestaurants([]);
    } finally {
      setIsLoadingRestaurants(false);
    }
  };

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

  // Reload restaurants when dishes change
  useEffect(() => {
    if (userLocation && (tryNewDishes.length > 0 || recommendedDishes.length > 0 || specialOccasionDishes.length > 0)) {
      loadNearbyRestaurants(userLocation);
    }
  }, [tryNewDishes, recommendedDishes, specialOccasionDishes, userLocation]);

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

        {/* Location and Restaurant Toggle */}
        <div className="max-w-5xl mx-auto w-full">
          <div className="flex items-center justify-between bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-4">
            <div className="flex items-center space-x-3">
              <LocationOnIcon className="text-[#C47B4D]" />
              <div>
                {userLocation ? (
                  <p className="text-sm text-[#4b2e19]">
                    Location: {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                  </p>
                ) : (
                  <p className="text-sm text-[#7a5c43]">Getting your location...</p>
                )}
                {isLoadingRestaurants && (
                  <p className="text-xs text-[#7a5c43]">Loading restaurants...</p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-sm text-[#4b2e19]">Show nearby restaurants:</label>
              <input
                type="checkbox"
                checked={showRestaurants}
                onChange={(e) => setShowRestaurants(e.target.checked)}
                className="w-4 h-4 text-[#C47B4D] bg-gray-100 border-gray-300 rounded focus:ring-[#C47B4D] focus:ring-2"
              />
            </div>
          </div>
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
          nearbyRestaurants={allNearbyRestaurants}
          showRestaurants={showRestaurants}
          isLoadingRestaurants={isLoadingRestaurants}
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
          nearbyRestaurants={allNearbyRestaurants}
          showRestaurants={showRestaurants}
          isLoadingRestaurants={isLoadingRestaurants}
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
          nearbyRestaurants={allNearbyRestaurants}
          showRestaurants={showRestaurants}
          isLoadingRestaurants={isLoadingRestaurants}
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
