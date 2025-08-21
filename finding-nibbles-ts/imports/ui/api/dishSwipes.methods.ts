import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';

export const Swipes = new Mongo.Collection('swipes');

Meteor.methods({
  'dishes.swipe'(dishId, action) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    if (!['like', 'dislike'].includes(action)) throw new Meteor.Error('Invalid action');
    Swipes.upsert(
      { userId: this.userId, dishId },
      { $set: { action, updatedAt: new Date() } }
    );
  },
});
