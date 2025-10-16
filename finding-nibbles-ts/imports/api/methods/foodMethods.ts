import { Meteor } from 'meteor/meteor';
import { FoodItems, UserPreferences } from '../collections';

// Define interfaces for type safety
interface FoodItem {
  _id?: string;
  name: string;
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

interface UserPreference {
  dishId: string;
  dishName: string;
  timestamp: Date;
  rating: number;
}

interface AIPreferences {
  dietaryRestrictions?: string[];
  avoidIngredients?: string[];
  mode?: 'tryNew' | 'recommended' | 'occasion';
}

Meteor.methods({
  // Method to save a food item to database
  async 'foodItems.save'(foodItem: FoodItem): Promise<string> {
    // Remove any _id from the input (let MongoDB generate it)
    const { _id, ...itemWithoutId } = foodItem;
    
    // Insert into database
    const newId = FoodItems.insert({
      ...itemWithoutId,
      createdAt: new Date(),
      createdBy: Meteor.userId() || 'system'
    });
    
    console.log('Saved food item with ID:', newId);
    return newId;
  },

  // Method to get AI suggestions (we'll expand this later)
  async 'foodItems.getAISuggestions'(preferences: AIPreferences): Promise<FoodItem[]> {
    // For now, return hardcoded pizza for testing
    const mockPizzaSuggestion: FoodItem = {
      name: "Margherita Pizza",
      description: "Classic Neapolitan pizza with fresh mozzarella, tomatoes, and basil",
      ingredients: ["pizza dough", "tomato sauce", "fresh mozzarella", "basil", "olive oil"],
      flavourProfile: {
        sweet: 3,
        salty: 6,
        sour: 4,
        bitter: 1,
        umami: 7,
        spicy: 0
      },
      cuisine: "Italian",
      category: "Main Course",
      textures: ["crispy", "chewy", "melty"],
      dietaryInfo: {
        vegetarian: true,
        vegan: false,
        glutenFree: false,
        dairyFree: false,
        halal: true
      },
      nutritionEstimate: {
        calories: 285,
        protein: 12,
        carbs: 35,
        fat: 10,
        isEstimated: true
      }
    };

    // TODO: Later, this will call your AI endpoint
    // For now, return the mock data
    return [mockPizzaSuggestion];
  },

  // Method to save user preference
  async 'userPreferences.updateLike'(dishId: string, dishName: string, isLiked: boolean): Promise<boolean> {
    const userId = Meteor.userId();
    if (!userId) {
      throw new Meteor.Error('not-authorized', 'User must be logged in');
    }

    const preference: UserPreference = {
      dishId,
      dishName,
      timestamp: new Date(),
      rating: isLiked ? 5 : 1
    };

    const update = isLiked 
      ? { $push: { likedDishes: preference } }
      : { $push: { dislikedDishes: preference } };

    UserPreferences.upsert(
      { userId },
      {
        $set: { userId, updatedAt: new Date() },
        ...update
      }
    );

    return true;
  },

  // Get user's feedback for AI context
  async 'dishes.getUserFeedback'(): Promise<any> {
    const userId = Meteor.userId();
    if (!userId) return null;

    const prefs = UserPreferences.findOne({ userId });
    if (!prefs) return null;

    return {
      likes: prefs.likedDishes?.map(d => d.dishName) || [],
      dislikes: prefs.dislikedDishes?.map(d => d.dishName) || [],
      recentSearches: [] // You can add this later
    };
  }
});