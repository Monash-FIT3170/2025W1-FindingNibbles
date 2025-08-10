import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

export interface ISavedRestaurant {
  _id?: string; // <-- Add this line
  userId: string;
  placeId: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  rating?: number | null;
  cuisine?: string[];
  createdAt?: Date;
}

export const SavedRestaurantsCollection = new Mongo.Collection<ISavedRestaurant>('savedRestaurants');

if (Meteor.isServer) {
  Meteor.startup(() => {
    SavedRestaurantsCollection.rawCollection().createIndex(
      { userId: 1, placeId: 1 }, // ensure uniqueness by userId and placeId
      { unique: true }
    ).then(() => console.log('Saved restaurants index created'))
      .catch(err => console.error('Error creating saved restaurant index:', err));
  });
}

Meteor.methods({
  async 'savedRestaurants.save'(restaurant: ISavedRestaurant) {
    // Validate input matches expected schema exactly
    check(restaurant, {
      userId: String,          // You can optionally omit userId from client and set from Meteor.userId()
      placeId: String,
      name: String,
      location: String,
      latitude: Match.Optional(Number),
      longitude: Match.Optional(Number),
      rating: Match.Optional(Number),
      cuisine: Match.Optional([String]),
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to save restaurants');
    }

    // Enforce server-side userId instead of client-sent userId
    const restaurantToInsert = {
      ...restaurant,
      userId,
      createdAt: new Date(),
    };

    // Check for existing saved restaurant for this user and placeId
    const existing = SavedRestaurantsCollection.findOne({ userId, placeId: restaurant.placeId });
    if (existing) {
      throw new Meteor.Error('duplicate-entry', 'You have already saved this restaurant');
    }

    try {
      // Insert restaurant document asynchronously
      const result = await SavedRestaurantsCollection.insertAsync(restaurantToInsert);
      return result;
    } catch (error: any) {
      if (error.code === 11000) { // duplicate key error
        throw new Meteor.Error('duplicate-entry', 'You already saved this restaurant');
      }
      console.error('Error saving restaurant:', error);
      throw new Meteor.Error('db-error', 'Failed to save restaurant');
    }
  },

  async 'savedRestaurants.remove'(placeId: string) {
    check(placeId, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('not-authorized');
    }

    const removed = await SavedRestaurantsCollection.removeAsync({ userId, placeId });

    if (removed === 0) {
      throw new Meteor.Error('not-found', 'Restaurant not found');
    }

    return removed;
  }
});

// Publication
if (Meteor.isServer) {
  Meteor.publish('savedRestaurants', function () {
    if (!this.userId) {
      return this.ready();
    }

    return SavedRestaurantsCollection.find(
      { userId: this.userId },
      { sort: { createdAt: -1 } }
    );
  });
}