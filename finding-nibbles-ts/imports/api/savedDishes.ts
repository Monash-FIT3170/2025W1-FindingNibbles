import { Mongo } from "meteor/mongo";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";

export interface ISavedDish {
  _id?: string;
  userId: string;
  name: string;
  city: string;
  createdAt?: Date;
}

export const SavedDishesCollection = new Mongo.Collection<ISavedDish>("savedDishes");

if (Meteor.isServer) {
  Meteor.startup(() => {
    SavedDishesCollection.rawCollection()
      .createIndex({ userId: 1, name: 1, city: 1 }, { unique: true })
      .then(() => console.log("Saved dishes index created"))
      .catch((err) => console.error("Error creating saved dishes index:", err));
  });
}

Meteor.methods({
  async "savedDishes.add"(name: string, city: string) {
    check(name, String);
    check(city, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized", "You must be logged in to save dishes");
    }

    const dishToInsert: ISavedDish = {
      name,
      city,
      userId,
      createdAt: new Date(),
    };

    const existing = SavedDishesCollection.findOne({ userId, name, city });
    if (existing) {
      throw new Meteor.Error("duplicate-entry", "You already saved this dish");
    }

    try {
      const result = await SavedDishesCollection.insertAsync(dishToInsert);
      return result;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Meteor.Error("duplicate-entry", "You already saved this dish");
      }
      console.error("Error saving dish:", error);
      throw new Meteor.Error("db-error", "Failed to save dish");
    }
  },

  async "savedDishes.remove"(dishId: string) {
    check(dishId, String);

    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error("not-authorized");
    }

    const removed = await SavedDishesCollection.removeAsync({ _id: dishId, userId });
    if (removed === 0) {
      throw new Meteor.Error("not-found", "Dish not found");
    }

    return removed;
  },
});

if (Meteor.isServer) {
  Meteor.publish("savedDishes", function () {
    if (!this.userId) return this.ready();
    return SavedDishesCollection.find({ userId: this.userId }, { sort: { createdAt: -1 } });
  });
}
