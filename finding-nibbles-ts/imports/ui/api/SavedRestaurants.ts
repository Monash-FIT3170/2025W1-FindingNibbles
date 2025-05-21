import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Define the interface for saved restaurant documents
export interface ISavedRestaurant {
  userId: string;
  name: string;
  location: string;
}

export const SavedRestaurantsCollection = new Mongo.Collection<ISavedRestaurant>('savedRestaurants');

// Create a unique index to prevent duplicate saves per user
if (Meteor.isServer) {
  Meteor.startup(() => {
    SavedRestaurantsCollection.rawCollection().createIndex(
      { userId: 1, name: 1 }, // Use `name` instead of missing `restaurantId`
      { unique: true }
    ).then(() => console.log('Saved restaurants index created'))
     .catch(err => console.error('Error creating saved restaurant index:', err));
  });
}

// Define methods for saving/removing restaurants
Meteor.methods({
  async 'savedRestaurants.save'(restaurant: { userId: string, name: string; location: string }) {
    check(restaurant, {
      userId: String,
      name: String,
      location: String,
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to save restaurants');
    }

    try {
      const result = await SavedRestaurantsCollection.insertAsync({
        userId,
        name: restaurant.name,
        location: restaurant.location,
      });
      return result;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Meteor.Error('duplicate-entry', 'You already saved this restaurant');
      }
      console.error('Error saving restaurant:', error);
      throw new Meteor.Error('db-error', 'Failed to save restaurant');
    }
  },

  async 'savedRestaurants.remove'(name: string) {
    check(name, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('not-authorized');
    }

    const removed = await SavedRestaurantsCollection.removeAsync({ userId, name });

    if (removed === 0) {
      throw new Meteor.Error('not-found', 'Restaurant not found');
    }

    return removed;
  }
});

// Publication for the user's saved restaurants
if (Meteor.isServer) {
  Meteor.publish('savedRestaurants', function () {
    if (!this.userId) {
      return this.ready();
    }

    return SavedRestaurantsCollection.find({ userId: this.userId });
  });
}
