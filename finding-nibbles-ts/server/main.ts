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
import { SearchHistory } from "../imports/ui/api/searchHistory";

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

  async "dishes.getUserPreferences"() {
    if (!this.userId) throw new Meteor.Error("Not authorized");
    const likes = await DishSwipes.rawCollection().aggregate([
      { $match: { userId: this.userId, liked: true } },
      { $group: { _id: "$name", lastLikedAt: { $max: "$createdAt" } } },
      { $sort: { lastLikedAt: -1 } },
      { $limit: 50 },
      { $project: { _id: 0, name: "$_id" } }
    ]).toArray();
    return likes.map((d: any) => d.name);
  },

  async "dishes.getUserFeedback"() {
    if (!this.userId) throw new Meteor.Error("Not authorized");

    const [likes, dislikes, searches] = await Promise.all([
      DishSwipes.find({ userId: this.userId, liked: true }, { sort: { createdAt: -1 }, limit: 100 }).fetchAsync(),
      DishSwipes.find({ userId: this.userId, liked: false }, { sort: { createdAt: -1 }, limit: 100 }).fetchAsync(),
      SearchHistory.find({ userId: this.userId }, { sort: { timestamp: -1 }, limit: 50 }).fetchAsync(),
    ]);

    return {
      likes: [...new Set(likes.map((d: any) => d.name))],
      dislikes: [...new Set(dislikes.map((d: any) => d.name))],
      recentSearches: [...new Set(searches.map((s: any) => s.searchTerm))],
    };
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

