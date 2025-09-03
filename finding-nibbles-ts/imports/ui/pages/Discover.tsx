import React, { useState, useEffect} from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Meteor } from 'meteor/meteor';
import type { CustomUser } from "../types/User"; 

// Custom SVG Icons
const ThumbUpIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
  </svg>
);

const ThumbDownIcon = () => (
  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018c.163 0 .326.02.485.06L17 4m-7 10v5a2 2 0 002 2h.095c.5 0 .905-.405.905-.905 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
  </svg>
);

// Defining type for dish object (temp)
type Dish = {
  id: number;
  name: string;
  image: string;
  description: string;
};


// Card component for displaying a dish with thumbs up/down buttons
const DishCard = ({ dish, onSwipe }: { dish: Dish; onSwipe: (action: 'like' | 'dislike') => void }) => {
  const [exitCondition, setExitCondition] = useState(0);

  const handleSwipe = (action: 'like' | 'dislike') => {
    setExitCondition(action === 'like' ? 200 : -200);
    onSwipe(action);
  };
  
  return (
    <motion.div
      key={dish.id}
      className="w-full h-full bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: exitCondition }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}>

      <img src={dish.image} alt={dish.name} className="w-full h-64 object-cover"/>
      <div className="p-4">
        <h3 className="text-xl font-bold text-[#4b2e19]">{dish.name}</h3>
        <p className="mt-2 text-[#4b2e19] text-sm">{dish.description}</p>
      </div>
      <div className="flex justify-around pb-4">
        <button onClick={() => handleSwipe('dislike')} className="w-1/2 mx-2 h-20 bg-red-200 hover:bg-red-300 text-red-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Dislike"><ThumbDownIcon /></button>
        <button onClick={() => handleSwipe('like')} className="w-1/2 mx-2 h-20 bg-green-200 hover:bg-green-300 text-green-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Like"><ThumbUpIcon /></button>
      </div>
    </motion.div>
  );
};


export const Discover = () => {
  const [liked, setLiked] = useState<Dish[]>([]);
  const [disliked, setDisliked] = useState<Dish[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState<string[]>([]);
  const [currentDish, setCurrentDish] = useState<Dish | null>(null);
  const [recommendedDish, setRecommendedDish] = useState<Dish | null>(null);
  const [specialDish, setSpecialDish] = useState<Dish | null>(null);

  useEffect(() => {
    const user = Meteor.user() as CustomUser | null;

    // Fetch liked dishes from the database and use as preferences for AI
    Meteor.call("dishes.getUserPreferences", (err, likedDishes: string[]) => {
      const prefs = likedDishes && likedDishes.length > 0
        ? likedDishes
        : user?.profile?.preferences || [];

      setPreferences(prefs);
      fetchSuggestion({ preferences: prefs.join(',') }, setRecommendedDish);
    });

    fetchSuggestion({}, setCurrentDish);
    fetchSuggestion({ occasion: 'birthday' }, setSpecialDish);
  }, []);

  const fetchSuggestion = async (
    params: Record<string, any> = {},
    setDish: React.Dispatch<React.SetStateAction<Dish | null>> = setCurrentDish
  ) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/aiSuggestion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify( params ),
      });

      if (!response.ok) throw new Error('AI suggestion failed');

      const data = await response.json();
      const { name, description } = data.dish;

      console.log('AI Suggestion Response:', name);

      if (!name || !description) {
        throw new Error('Invalid dish data received');
      }

      const imageRes = await fetch('/api/generateImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: name }),
      });

      const imageData = await imageRes.json();
      const imageUrl = imageData.imageUrl || `data:image/png;base64,${imageData.image}`;

      const newDish: Dish = {
        id: Date.now(),
        name: name,
        image: imageUrl,
        description: description,
      };
 
      setDish(newDish);
    } catch (err) {
      console.error(err);
      setError('Failed to get AI-generated dish.');
    } finally {
      setLoading(false);
    }
  };

  //function to handle preferences and update lists
  // const handlePreference = (action: 'like' | 'dislike') => {
  //   const dish = sampleDishes[currentIndex];


  //   if (action === 'like') setLiked([...liked, dish]);
  //   if (action === 'dislike') setDisliked([...disliked, dish]);
  //   setCurrentIndex((prev) => prev + 1);
  // };

const handlePreference = (action: 'like' | 'dislike', dish: Dish | null) => {
    if (!dish) return;
    if (action === 'like') setLiked((prev) => [...prev, dish]);
    if (action === 'dislike') setDisliked((prev) => [...prev, dish]);
  };

 const handleSwipe = (
    action: 'like' | 'dislike',
    fetchParams: Record<string, any> = {},
    setDish: React.Dispatch<React.SetStateAction<Dish | null>>,
    dish: Dish | null
  ) => {
    handlePreference(action, dish);
    fetchSuggestion(fetchParams, setDish);
  };
  
  

  return (
    <div className="flex min-h-screen pt-20 bg-[#fdfaf7]">
      <div className="flex flex-col flex-1 pb-8 px-4 sm:px-6 space-y-12">
        {/* Page heading */}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#4b2e19] mb-2">Discover</h1>
        </div>

        {/*try me section*/}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Try Me!</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 min-h-[200px] text-[#7a5c43]">
            <AnimatePresence>
                {/* shows current dish if available, else msg */}
              {currentDish ? (<DishCard key={currentDish.id} dish={currentDish}  onSwipe={(action) =>
                    handleSwipe(action, {}, setCurrentDish, currentDish)
                  } />) : (<p className="text-lg">Generating a dish recommendation...</p>)}
            </AnimatePresence>
          </div>
        </div>

        {/* Recommended Dish placeholder */}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Recommended Dish</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 min-h-[200px] text-[#7a5c43]">
            <AnimatePresence>
                {/* shows current dish if available, else msg */}
              {recommendedDish ? (<DishCard key={recommendedDish.id} dish={recommendedDish}  onSwipe={(action) => handleSwipe(action, { preferences: preferences.join(',') }, setRecommendedDish, recommendedDish)} />) : (<p className="text-lg">Generating a dish recommendation...</p>)}
            </AnimatePresence>
          </div>
        </div>

        {/* Specials placeholder */}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Special dish for ...</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 min-h-[200px] text-[#7a5c43]">
            <AnimatePresence>
                {/* shows current dish if available, else msg */}
              {specialDish ? (<DishCard key={specialDish.id} dish={specialDish} onSwipe={(action) => handleSwipe(action, { "occasion": "birthday" }, setSpecialDish, specialDish)}  />) : (<p className="text-lg">Generating a dish recommendation...</p>)}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};