import { Mongo } from 'meteor/mongo';

// Define the interfaces for your schemas
export interface IFoodItem {
  _id?: string;
  name: string;
  restaurant?: string;
  image?: string;
  description: string;
  ingredients: string[];
  flavourProfile: {
    sweet: number;
    salty: number;
    sour: number;
    bitter: number;
    umami: number;
    spicy: number;
  };
  cuisine: string;
  category: string;
  textures: string[];
  dietaryInfo: {
    vegetarian: boolean;
    vegan: boolean;
    glutenFree: boolean;
    dairyFree: boolean;
    halal: boolean;
  };
  nutritionEstimate: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    isEstimated?: boolean;
  };
  createdAt?: Date;
  createdBy?: string;
}

export interface IUserPreference {
  _id?: string;
  userId: string;
  likedDishes: Array<{
    dishId: string;
    dishName?: string;
    timestamp: Date;
    rating: number;
  }>;
  dislikedDishes: Array<{
    dishId: string;
    dishName?: string;
    timestamp: Date;
    rating: number;
  }>;
  ingredientScores?: Record<string, number>;
  flavourPreferences?: {
    sweet: number;
    salty: number;
    sour: number;
    bitter: number;
    umami: number;
    spicy: number;
  };
  avoidIngredients?: string[];
  dietaryRestrictions?: string[];
  updatedAt?: Date;
}

export const FoodItems = new Mongo.Collection<IFoodItem>('foodItems');
export const UserPreferences = new Mongo.Collection<IUserPreference>('userPreferences');