import { useTracker } from 'meteor/react-meteor-data';
import { UserPreferences, IUserPreferences } from '../api/UserPreferences';
import { Meteor } from 'meteor/meteor';

export const useUserPreferences = () => {
  const userId = Meteor.userId();
  
  const { userPreferences, isLoading } = useTracker(() => {
    if (!userId) {
      return {
        userPreferences: null,
        isLoading: false
      };
    }

    try {
      // Get the user preferences
      const prefs = UserPreferences.findOne({ userId });
      
      // Check if the subscription is ready by looking for any data
      // If we have preferences or if the collection has been queried, we're ready
      const subscriptionReady = prefs !== undefined || UserPreferences.find({ userId }).count() >= 0;
      
      return {
        userPreferences: prefs,
        isLoading: !subscriptionReady
      };
    } catch (error) {
      console.error('Error in useUserPreferences hook:', error);
      return {
        userPreferences: null,
        isLoading: false
      };
    }
  }, [userId]);

  return {
    userPreferences,
    isLoading,
    hasPreferences: !!userPreferences,
    likedDishes: userPreferences?.likedDishes || [],
    dislikedDishes: userPreferences?.dislikedDishes || [],
    dietaryRestrictions: userPreferences?.dietaryRestrictions || [],
    searchHistory: userPreferences?.searchHistory || []
  };
};
