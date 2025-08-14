import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Define the interface for user preferences documents
export interface IUserPreferences {
  _id?: string;
  userId: string;
  likedDishes: Array<{
    id: number;
    name: string;
    restaurant: string;
    image: string;
    description: string;
    timestamp: Date;
  }>;
  dislikedDishes: Array<{
    id: number;
    name: string;
    restaurant: string;
    image: string;
    description: string;
    timestamp: Date;
  }>;
  dietaryRestrictions: string[];
  searchHistory: string[];
  lastUpdated: Date;
  createdAt: Date;
}

export const UserPreferences = new Mongo.Collection<IUserPreferences>('userPreferences');

// Create indexes for better performance
if (Meteor.isServer) {
  Meteor.startup(() => {
    UserPreferences.rawCollection().createIndex({ userId: 1 }, { unique: true })
      .then(() => console.log('User preferences index created'))
      .catch(err => console.error('Error creating user preferences index:', err));
  });
}

// Define methods for working with user preferences
Meteor.methods({
  async 'userPreferences.initialize'() {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to initialize preferences');
    }

    try {
      const existingPrefs = await UserPreferences.findOneAsync({ userId: this.userId });
      if (!existingPrefs) {
        const newPrefs: IUserPreferences = {
          userId: this.userId,
          likedDishes: [],
          dislikedDishes: [],
          dietaryRestrictions: [],
          searchHistory: [],
          lastUpdated: new Date(),
          createdAt: new Date()
        };
        
        await UserPreferences.insertAsync(newPrefs);
        return newPrefs;
      }
      return existingPrefs;
    } catch (error) {
      console.error('Error initializing user preferences:', error);
      throw new Meteor.Error('db-error', 'Failed to initialize preferences');
    }
  },

  async 'userPreferences.addLikedDish'(dish: {
    id: number;
    name: string;
    restaurant: string;
    image: string;
    description: string;
  }) {
    check(dish, {
      id: Number,
      name: String,
      restaurant: String,
      image: String,
      description: String
    });
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add liked dish');
    }

    try {
      const dishWithTimestamp = {
        ...dish,
        timestamp: new Date()
      };

      await UserPreferences.updateAsync(
        { userId: this.userId },
        { 
          $push: { likedDishes: dishWithTimestamp },
          $set: { lastUpdated: new Date() }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error adding liked dish:', error);
      throw new Meteor.Error('db-error', 'Failed to add liked dish');
    }
  },

  async 'userPreferences.addDislikedDish'(dish: {
    id: number;
    name: string;
    restaurant: string;
    image: string;
    description: string;
  }) {
    check(dish, {
      id: Number,
      name: String,
      restaurant: String,
      image: String,
      description: String
    });
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add disliked dish');
    }

    try {
      const dishWithTimestamp = {
        ...dish,
        timestamp: new Date()
      };

      await UserPreferences.updateAsync(
        { userId: this.userId },
        { 
          $push: { dislikedDishes: dishWithTimestamp },
          $set: { lastUpdated: new Date() }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error adding disliked dish:', error);
      throw new Meteor.Error('db-error', 'Failed to add disliked dish');
    }
  },

  async 'userPreferences.updateDietaryRestrictions'(restrictions: string[]) {
    check(restrictions, [String]);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to update dietary restrictions');
    }

    try {
      await UserPreferences.updateAsync(
        { userId: this.userId },
        { 
          $set: { 
            dietaryRestrictions: restrictions,
            lastUpdated: new Date()
          }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error updating dietary restrictions:', error);
      throw new Meteor.Error('db-error', 'Failed to update dietary restrictions');
    }
  },

  async 'userPreferences.addSearchTerm'(searchTerm: string) {
    check(searchTerm, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to add search term');
    }

    try {
      await UserPreferences.updateAsync(
        { userId: this.userId },
        { 
          $addToSet: { searchHistory: searchTerm },
          $set: { lastUpdated: new Date() }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error adding search term:', error);
      throw new Meteor.Error('db-error', 'Failed to add search term');
    }
  },

  async 'userPreferences.removeLikedDish'(dishId: number) {
    check(dishId, Number);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove liked dish');
    }

    try {
      await UserPreferences.updateAsync(
        { userId: this.userId },
        { 
          $pull: { likedDishes: { id: dishId } },
          $set: { lastUpdated: new Date() }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error removing liked dish:', error);
      throw new Meteor.Error('db-error', 'Failed to remove liked dish');
    }
  },

  async 'userPreferences.removeDislikedDish'(dishId: number) {
    check(dishId, Number);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove disliked dish');
    }

    try {
      await UserPreferences.updateAsync(
        { userId: this.userId },
        { 
          $pull: { dislikedDishes: { id: dishId } },
          $set: { lastUpdated: new Date() }
        }
      );
      
      return true;
    } catch (error) {
      console.error('Error removing disliked dish:', error);
      throw new Meteor.Error('db-error', 'Failed to remove disliked dish');
    }
  }
});

// Publish user preferences for the current user
if (Meteor.isServer) {
  Meteor.publish('userPreferences', function() {
    if (!this.userId) {
      return this.ready();
    }
    
    return UserPreferences.find(
      { userId: this.userId },
      { limit: 1 }
    );
  });
}
