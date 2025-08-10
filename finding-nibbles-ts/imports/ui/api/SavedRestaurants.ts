import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

// Define the interface for saved restaurant documents
export interface ISavedRestaurant {
  userId: string;
  id: string; // Unique identifier from Google Places API
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  rating?: number | null;
  types?: string[];
  createdAt?: Date;
}

export const SavedRestaurantsCollection = new Mongo.Collection<ISavedRestaurant>('savedRestaurants');

if (Meteor.isServer) {
  Meteor.startup(() => {
    SavedRestaurantsCollection.rawCollection().createIndex(
      { userId: 1, id: 1 }, // ensure uniqueness by user & place id
      { unique: true }
    ).then(() => console.log('Saved restaurants index created'))
     .catch(err => console.error('Error creating saved restaurant index:', err));
  });
}

Meteor.methods({
  async 'savedRestaurants.save'(restaurant: ISavedRestaurant) {
    check(restaurant, {
      userId: String,
      id: String,
      name: String,
      location: String,
      latitude: Match.Optional(Number),
      longitude: Match.Optional(Number),
      rating: Match.Optional(Number),
      types: Match.Optional([String]),
    });

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to save restaurants');
    }

    try {
      const result = await SavedRestaurantsCollection.insertAsync({
        ...restaurant,
        userId,
        createdAt: new Date(),
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

  async 'savedRestaurants.remove'(id: string) {
    check(id, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('not-authorized');
    }

    const removed = await SavedRestaurantsCollection.removeAsync({ userId, id });

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
      { sort: { createdAt: -1 } } // newest first
    );
  });
}
