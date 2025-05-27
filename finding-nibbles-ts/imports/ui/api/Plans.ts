import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface PlanType {
  _id?: string;
  userId: string;
  title: string;
  restaurants: any[];
}

// Define the collection first
export const Plans = new Mongo.Collection<PlanType>('plans');

// Publish plans for the current user
if (Meteor.isServer) {
  Meteor.publish('plans', function () {
    if (!this.userId) {
      return this.ready();
    }
    return Plans.find({ userId: this.userId as string });
  });
}

Meteor.methods({
  async 'plans.insert'(title: string) {
    console.log('plans.insert called', this.userId, title);
    if (!this.userId) throw new Meteor.Error('Not authorized');
    return await Plans.insertAsync({ userId: this.userId, title, restaurants: [] });
  },
  async 'plans.addRestaurant'(planId: string, restaurant: any) {
    console.log('plans.addRestaurant called', this.userId, planId, restaurant);
    if (!this.userId) throw new Meteor.Error('Not authorized');
    return await Plans.updateAsync(
      { _id: planId, userId: this.userId },
      { $addToSet: { restaurants: restaurant } }
    );
  },
  async 'plans.remove'(planId: string) {
    if (!this.userId) throw new Meteor.Error('Not authorized');
    const plan = await Plans.findOneAsync({ _id: planId, userId: this.userId });
    if (!plan) throw new Meteor.Error('Plan not found or not authorized');
    return await Plans.removeAsync({ _id: planId, userId: this.userId });
  },
  // Add more methods as needed (remove, update, etc.)
});

