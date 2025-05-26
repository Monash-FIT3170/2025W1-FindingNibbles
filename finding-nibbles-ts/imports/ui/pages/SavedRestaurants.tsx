import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { Tracker } from 'meteor/tracker';
import { SavedRestaurantsCollection, ISavedRestaurant } from '../api/SavedRestaurants';
import { Sidebar } from '../components/layouts/Sidebar';

export const SavedRestaurantsList = () => {
  const [restaurants, setRestaurants] = useState<ISavedRestaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const subscription = Meteor.subscribe('savedRestaurants');

    const computation = Tracker.autorun(() => {
      if (subscription.ready()) {
        const saved = SavedRestaurantsCollection.find({}).fetch();
        setRestaurants(saved);
        setLoading(false);
      }
    });

    return () => {
      subscription.stop();
      computation.stop();
    };
  }, []);

  const handleRemove = (name: string) => {
    Meteor.call('savedRestaurants.remove', name, (error: any) => {
      if (error) {
        alert(`Failed to remove: ${error.reason || error.message || error}`);
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
              restaurants.map((restaurant: any) => (
                <div
                  key={restaurant.name}
                  className="flex justify-between items-center border-2 border-[#b87b45] rounded-full px-4 py-2 text-center text-base text-black"
                >
                  <span>{restaurant.name}</span>
                  <button
                    onClick={() => handleRemove(restaurant.name)}
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
