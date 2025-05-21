import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { SavedRestaurantsCollection } from '../types/SavedRestaurants';

Meteor.methods({
  'savedRestaurants.remove'(restaurantId: string) {
    check(restaurantId, String);
    const userId = Meteor.userId();
    if (!userId) throw new Meteor.Error('Not authorized');
    SavedRestaurantsCollection.removeAsync({ _id: restaurantId, userId });
  },
});

Meteor.methods({
    'savedRestaurants.insert'(restaurant: {
      name: string;
      address?: string;
      location: { lat: number; lng: number };
      rating?: number;
      types?: string[];
    }) {
      check(restaurant, {
        name: String,
        address: Match.Optional(String),
        location: {
          lat: Number,
          lng: Number,
        },
        rating: Match.Optional(Number),
        types: Match.Optional([String]),
      });
  
      if (!this.userId) {
        throw new Meteor.Error('Not authorized');
      }
  
      // Optionally check if restaurant is already saved for this user...
  
      return SavedRestaurantsCollection.insert({
        userId: this.userId,
        ...restaurant,
        createdAt: new Date(),
      });
    },
  });
