import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { MOCK_DATA } from './config';
import '../imports/api/users/methods';
import '../imports/api/aiSuggestion';
import '../imports/api/generateImage';
import '../imports/api/searchHistory';
import '../imports/api/SavedRestaurants';
import '../imports/api/Plans';
import '../imports/api/meals';
import "../imports/api/savedDishes";
import { Mongo } from "meteor/mongo";

export const DishSwipes = new Mongo.Collection("dishSwipes");

Meteor.methods({
  "dishes.swipe"({ name, liked }) {
    if (!this.userId) throw new Meteor.Error("Not authorized");
    DishSwipes.insert({
      userId: this.userId,
      name,
      liked,
      createdAt: new Date(),
    });
  },
});

Meteor.startup(async () => {
  // Debug: Check if settings are loaded

  const p = Meteor.settings.private;
  if (p?.googleServiceAccountPath) {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = p.googleServiceAccountPath;
  }

  // Create seed user if it doesn't exist
  if (!(await Accounts.findUserByUsername(MOCK_DATA.SEED_USERNAME))) {
    await Accounts.createUser({
      username: MOCK_DATA.SEED_USERNAME,
      password: MOCK_DATA.SEED_PASSWORD,
      profile: {
        name: 'Test User',
        preferences: ['Vegetarian'],
      },
    });
    console.log('Seed user created');
  } else {
    console.log('Seed user already exists');
  }
});

