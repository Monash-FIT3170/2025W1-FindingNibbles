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
import fs from "fs";
import os from "os";
import path from "path";

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
  if (!p?.googleServiceAccount) {
    console.warn("No googleServiceAccount in settings");
    return;
  }

  let auth: GoogleAuth;

  if (typeof p.googleServiceAccount === "string") {
    // Local dev: path to a JSON key file
    process.env.GOOGLE_APPLICATION_CREDENTIALS = p.googleServiceAccount;

    auth = new GoogleAuth({
      keyFile: p.googleServiceAccount,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    console.log("GoogleAuth initialised with key file path");
  } else {
    // Prod: JSON object embedded in settings → write to a secure temp file
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "gcp-"));
    const keyPath = path.join(tmpDir, "serviceAccount.json");
    fs.writeFileSync(keyPath, JSON.stringify(p.googleServiceAccount));

    process.env.GOOGLE_APPLICATION_CREDENTIALS = keyPath;

    auth = new GoogleAuth({
      keyFile: keyPath,
      scopes: ["https://www.googleapis.com/auth/cloud-platform"],
    });

    console.log("GoogleAuth initialised with temp file at:", keyPath);
  }

  // Make available globally
  (globalThis as any).googleAuth = auth;


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
