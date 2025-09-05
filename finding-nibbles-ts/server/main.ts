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
import { SearchHistory } from "../imports/api/searchHistory";
import { GoogleAuth } from "google-auth-library";

export const DishSwipes = new Mongo.Collection("dishSwipes");

Meteor.methods({
  // Server-side async insert
  "dishes.swipe": async function ({ name, liked }) {
    if (!this.userId) throw new Meteor.Error("Not authorized");

    await DishSwipes.insertAsync({
      userId: this.userId,
      name,
      liked,
      createdAt: new Date(),
    });
  },

  // Get recent liked dishes
  async "dishes.getUserPreferences"() {
    if (!this.userId) throw new Meteor.Error("Not authorized");

    const likes = await DishSwipes.rawCollection()
      .aggregate([
        { $match: { userId: this.userId, liked: true } },
        { $group: { _id: "$name", lastLikedAt: { $max: "$createdAt" } } },
        { $sort: { lastLikedAt: -1 } },
        { $limit: 50 },
        { $project: { _id: 0, name: "$_id" } },
      ])
      .toArray();

    return likes.map((d: any) => d.name);
  },

  // Get user feedback
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
  const p = Meteor.settings.private;

  // Setup Google Auth using embedded JSON for Galaxy/local
  if (p?.googleServiceAccount) {
    const auth = new GoogleAuth({
      credentials: p.googleServiceAccount,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    // Store globally for use in your app
    globalThis.googleAuth = auth;
  }

  // Seed user if not present
  if (!(await Accounts.findUserByUsername(MOCK_DATA.SEED_USERNAME))) {
    await Accounts.createUser({
      username: MOCK_DATA.SEED_USERNAME,
      password: MOCK_DATA.SEED_PASSWORD,
      profile: {
        name: "Test User",
        preferences: ["Vegetarian"],
      },
    });
    console.log("Seed user created");
  } else {
    console.log("Seed user already exists");
  }
});
