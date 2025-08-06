import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';

export interface MealType {
  _id?: string;
  userId: string;
  date: string; // in dd/mm/yyyy
  meal: string;
  calories: number | null;
  protein: number | null;
  fat: number | null;
  carbs: number | null;
}

//collection to store meals
export const Meals = new Mongo.Collection<MealType>('meals');

// publish meals for logged in user
if (Meteor.isServer) {
  Meteor.publish('meals', function () {
    if (!this.userId) return this.ready(); // return nothing if not logged in
    return Meals.find({ userId: this.userId }); //return meals for only the logged in user
  });
}

//methods for interacting with meals collection
Meteor.methods({

   //insert meal into collection
  async 'meals.insert'(meal: Omit<MealType, '_id' | 'userId'>) {

    //ensure logged in user
    if (!this.userId) throw new Meteor.Error('Not authorized');

    //add userId to meal and insert into collection
    return await Meals.insertAsync({ ...meal, userId: this.userId });
  },


  //remove meal by its ID if it belongs to the logged in user
  async 'meals.remove'(mealId: string) {

    //ensure logged in user and meal exists
    if (!this.userId) throw new Meteor.Error('Not authorized');

    //find meal by ID and userId (to ensure it's that user's meal)
    const meal = await Meals.findOneAsync({ _id: mealId, userId: this.userId });
    if (!meal) throw new Meteor.Error('Meal not found or not authorized');


    //remove meal from collection
    return await Meals.removeAsync({ _id: mealId });
  },
});