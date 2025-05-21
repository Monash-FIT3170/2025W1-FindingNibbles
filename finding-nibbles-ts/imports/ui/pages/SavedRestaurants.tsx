import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { SavedRestaurantsCollection, ISavedRestaurant} from '../api/SavedRestaurants';
import { Sidebar } from '../components/layouts/Sidebar';

export const SavedRestaurantsList = () => {
  const [restaurants, setRestaurants] = useState<ISavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = Meteor.subscribe('savedRestaurants');

    const updateRestaurants = () => {
      if (subscription.ready()) {
        const saved = SavedRestaurantsCollection.find({}, { sort: { savedAt: -1 } }).fetch();
        setRestaurants(saved);  
        setLoading(false);
      }
    };

    updateRestaurants();
    const intervalId = setInterval(updateRestaurants, 500);

    return () => {
      subscription.stop();
      clearInterval(intervalId);
    };
  }, []);

  const handleRemove = (restaurantId: string) => {
    Meteor.call('savedRestaurants.remove', restaurantId, (error: any) => {
      if (error) {
        console.error('Error removing saved restaurant:', error);
      } else {
        setRestaurants(prev => prev.filter(r => r.restaurantId !== restaurantId));
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-[Comic_Sans_MS]">
      <Sidebar />

      <div className="flex flex-col flex-1 items-center p-6">
        <h1 className="text-2xl font-bold mb-6">Saved Restaurants</h1>
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b87b45]"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-4 w-full max-w-md">
            {restaurants.length > 0 ? (
              restaurants.map((restaurant) => (
                <div
                  key={restaurant._id}
                  className="flex justify-between items-center border-2 border-[#b87b45] rounded-full px-4 py-2 text-center text-base text-black"
                >
                  <span>{restaurant.name}</span>
                  <button
                    onClick={() => handleRemove(restaurant.restaurantId)}
                    className="text-black font-bold hover:text-[#b87b45]"
                    aria-label={`Remove ${restaurant.name}`}
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No saved restaurants found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
