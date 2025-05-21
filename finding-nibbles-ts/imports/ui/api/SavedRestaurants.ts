import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Define the interface for saved restaurant documents
export interface ISavedRestaurant {
  _id?: string;
  userId: string;
  restaurantId: string; // could be a place_id or internal id
  name: string;
  savedAt: Date;
}

export const SavedRestaurantsCollection = new Mongo.Collection<ISavedRestaurant>('savedRestaurants');

// Create a unique index to prevent duplicate saves per user
if (Meteor.isServer) {
  Meteor.startup(() => {
    SavedRestaurantsCollection.rawCollection().createIndex(
      { userId: 1, restaurantId: 1 },
      { unique: true }
    ).then(() => console.log('Saved restaurants index created'))
     .catch(err => console.error('Error creating saved restaurant index:', err));
  });
}

// Define methods for saving/removing restaurants
Meteor.methods({
  async 'savedRestaurants.save'(restaurantId: string, name: string) {
    check(restaurantId, String);
    check(name, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to save restaurants');
    }

    try {
      const result = await SavedRestaurantsCollection.upsertAsync(
        { userId: this.userId, restaurantId },
        {
          $set: {
            userId: this.userId,
            restaurantId,
            name,
            savedAt: new Date()
          }
        }
      );

      return result;
    } catch (error) {
      console.error('Error saving restaurant:', error);
      throw new Meteor.Error('db-error', 'Failed to save restaurant');
    }
  },

  async 'savedRestaurants.remove'(restaurantId: string) {
    check(restaurantId, String);

    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove saved restaurants');
    }

    try {
      await SavedRestaurantsCollection.removeAsync({ userId: this.userId, restaurantId });
    } catch (error) {
      console.error('Error removing saved restaurant:', error);
      throw new Meteor.Error('db-error', 'Failed to remove saved restaurant');
    }
  }
});

// Publication for the user's saved restaurants
if (Meteor.isServer) {
  Meteor.publish('savedRestaurants', function () {
    if (!this.userId) {
      return this.ready();
    }

    return SavedRestaurantsCollection.find(
      { userId: this.userId },
      { sort: { savedAt: -1 } }
    );
  });
}
