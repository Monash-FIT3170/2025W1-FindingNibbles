import { Mongo } from 'meteor/mongo';

export const FoodItems = new Mongo.Collection('foodItems');

const FoodItemSchema = {

    _id: String,
    name: String,
    restaurant: String,
    image: String,
    description: String,
    ingredients: [String],
    flavourProfile:{
        sweet: Number,
        salty: Number,
        sour: Number,
        bitter: Number,
        umami: Number,
        spicy: Number
    },
    cusine:String,
    category: String, // Might not need
    textures:[String],
    dietaryInfo:{
        vegetarian: Boolean,
        vegan: Boolean,
        glutenFree: Boolean,
        dairyFree: Boolean,
        halal: Boolean
    },

    // Could include a nutrition component for the food
     nutritionEstimate: {
        calories: Number,
        protein: Number,
        carbs: Number,
        fat: Number
     }
};

export const UserPreferences = new Mongo.Collection('userPreferences');

const UserPreferenceSchema = {
    userId: String,
    likedDishes:[{
        dishId: String,
        timestamp: Date, // Might not need
        rating: Number
    }],
    dislikedDishes: [{
        dishId: String,
        timestamp: Date,
        rating: Number
    }],
    ingredientScores:{}, // object to score how favourable certain ingredients are to the user
    flavourPreferences: {
        sweet: Number,
        salty: Number,
        sour: Number,
        bitter: Number,
        umami: Number,
        spicy: Number
    },
    avoidIngredients: [String],
    dietaryRestrictions: [String]
};
