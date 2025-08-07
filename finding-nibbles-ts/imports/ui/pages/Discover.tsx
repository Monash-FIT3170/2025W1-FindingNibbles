import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ThumbUpIcon from '@mui/icons-material/ThumbUp';
import ThumbDownIcon from '@mui/icons-material/ThumbDown';

// Defining type for dish object (temp)
type Dish = {
  id: number;
  name: string;
  restaurant: string;
  image: string;
  description: string;
};

//test dish data
const sampleDishes: Dish[] = [
  {
    id: 1,
    name: 'Lanzhou Beef Noodles',
    restaurant: 'Bowltiful',
    image: 'https://media.timeout.com/images/105975769/750/422/image.jpg',
    description: 'Hand-pulled noodles, flavorful halal beef, and rich broth.',
  },
  {
    id: 2,
    name: 'Pepperoni Pizza',
    restaurant: 'Pizza Hut',
    image: 'https://tb-static.uber.com/prod/image-proc/processed_images/8e42f0ba1d0f35a331e93a147fa4eb36/db809eadd12d21eb61044e0f3bf7c9b7.jpeg',
    description: 'Lots of pepperoni and mozzarella cheese.',
  },
  {
    id: 3,
    name: 'Subdog',
    restaurant: 'Subway',
    image: 'https://www.cmgassets.com/s3fs-public/styles/opengraph/public/2024-09/subway_subdog_.jpeg?h=0995d4b4&itok=roPWZmK7',
    description: 'The American-style hotdog with mozzarella cheese, tomato sauce and limited-edition tangy mustard',
  },
];

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

      <img src={dish.image} alt={dish.name} className="w-full h-64 object-cover"/>
      <div className="p-4">
        <h3 className="text-xl font-bold text-[#4b2e19]">{dish.name}</h3>
        <p className="text-sm text-[#7a5c43]">{dish.restaurant}</p>
        <p className="mt-2 text-[#4b2e19] text-sm">{dish.description}</p>
      </div>
      <div className="flex justify-around pb-4">
        <button onClick={() => onSwipe('dislike')} className="w-1/2 mx-2 h-20 bg-red-200 hover:bg-red-300 text-red-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Dislike"><ThumbDownIcon /></button>
        <button onClick={() => onSwipe('like')} className="w-1/2 mx-2 h-20 bg-green-200 hover:bg-green-300 text-green-800 rounded-xl shadow-lg flex items-center justify-center text-3xl transition-transform transform hover:scale-105 cursor-pointer" aria-label="Like"><ThumbUpIcon /></button>
      </div>
    </motion.div>
  );
};

export const Discover = () => {
  //index of currently shown dish
  const [currentIndex, setCurrentIndex] = useState(0);

  // liked/disliked dishes lists
  const [liked, setLiked] = useState<Dish[]>([]);
  const [disliked, setDisliked] = useState<Dish[]>([]);

  //function to handle preferences and update lists
  const handlePreference = (action: 'like' | 'dislike') => {
    const dish = sampleDishes[currentIndex];
    if (action === 'like') setLiked([...liked, dish]);
    if (action === 'dislike') setDisliked([...disliked, dish]);
    setCurrentIndex((prev) => prev + 1);
  };

  const currentDish = sampleDishes[currentIndex];

  return (
    <div className="flex min-h-screen bg-[#fdfaf7]">
      <div className="flex flex-col flex-1 py-8 px-4 sm:px-6 space-y-12">
        {/* Page heading */}
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-[#4b2e19] mb-2">Discover</h1>
        </div>

        {/* Search input field */}
        <div className="max-w-5xl mx-auto w-full">
          <input
            type="text"
            placeholder="Search for a dish or restaurant..."
            className="w-full px-4 py-3 border border-[#e2cfc3] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d9bca8] text-[#4b2e19] bg-white"/>
        </div>

        {/*try me section*/}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Try Me!</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 w-full max-w-5xl h-[500px] mx-auto relative text-[#7a5c43]">
            <AnimatePresence>
                {/* shows current dish if available, else msg */}
              {currentDish ? (<DishCard key={currentDish.id} dish={currentDish} onSwipe={handlePreference} />) : (<p className="text-lg">You're preferences have been saved and future recommendations will be adjusted accordingly. Refresh for more!</p>)}
            </AnimatePresence>
          </div>
        </div>

        {/* Recommended Restaurants placeholder */}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Recommended Restaurants</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 min-h-[200px] text-[#7a5c43]">
            <p className="text-center text-lg">Coming soon!</p>
          </div>
        </div>

        {/* Specials placeholder */}
        <div className="max-w-5xl mx-auto w-full">
          <h2 className="text-2xl font-bold text-[#4b2e19] mb-4">Specials</h2>
          <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl shadow-md p-6 min-h-[200px] text-[#7a5c43]">
            <p className="text-center text-lg">Coming soon!</p>
          </div>
        </div>
      </div>
    </div>
  );
};