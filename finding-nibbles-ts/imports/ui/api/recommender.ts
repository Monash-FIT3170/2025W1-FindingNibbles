import { Meteor } from 'meteor/meteor';
import { UserPreferences, IUserPreferences } from './UserPreferences';

// Function to build AI prompt based on user preferences from database
export function buildDishPrompt(userPreferences: IUserPreferences) {
  const likedDishNames = userPreferences.likedDishes.map(dish => dish.name);
  const dislikedDishNames = userPreferences.dislikedDishes.map(dish => dish.name);
  
  return `
  You are a food recommendation assistant. 
  Based on this user's preferences:
  - Dietary restrictions: ${userPreferences.dietaryRestrictions.join(", ") || "None"}
  - Liked dishes: ${likedDishNames.join(", ") || "None"}
  - Disliked dishes: ${dislikedDishNames.join(", ") || "None"}
  - Recent searches: ${userPreferences.searchHistory.join(", ") || "None"}
  
  Suggest 5 dishes they are likely to enjoy. 
  Only return JSON in the format:
  [
    { "name": "Dish Name", "restaurant": "Restaurant Name", "description": "Short description", "reason": "Why this dish was recommended" }
  ]
  Do not include dishes that violate dietary restrictions or they disliked.
  Focus on dishes similar to what they liked or that complement their preferences.

  Note: If you think insufficient information is provided, give general popular suggestions.
  `;
}

// Method to get user preferences for recommendations
export async function getUserPreferencesForRecommendations(): Promise<IUserPreferences | null> {
  if (!Meteor.userId()) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to get preferences');
  }

  try {
    // Initialize user preferences if they don't exist
    await Meteor.callAsync('userPreferences.initialize');
    
    // Get the user preferences
    const userId = Meteor.userId();
    if (!userId) return null;
    
    const preferences = await UserPreferences.findOneAsync({ userId });
    return preferences || null;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    throw new Meteor.Error('db-error', 'Failed to get user preferences');
  }
}

// Method to get personalized dish recommendations using Gemini API
export async function getPersonalizedRecommendations(category: string = 'recommended'): Promise<any[]> {
  try {
    console.log(`Getting ${category} recommendations...`);
    const userPrefs = await getUserPreferencesForRecommendations();
    
    // Build different prompts based on category
    let prompt = '';
    if (category === 'try-new') {
      prompt = buildTryNewPrompt(userPrefs);
    } else if (category === 'special-occasion') {
      prompt = buildSpecialOccasionPrompt();
    } else {
      // Default recommended category
      if (userPrefs) {
        prompt = buildDishPrompt(userPrefs);
      } else {
        // If no user preferences, use a general recommendation prompt
        prompt = `
        You are a food recommendation assistant. 
        Suggest 5 popular and well-liked dishes that most people enjoy.
        Only return JSON in the format:
        [
          { "name": "Dish Name", "restaurant": "Restaurant Name", "description": "Short description", "reason": "Popular choice that many people love" }
        ]
        Include a mix of different cuisines and comfort foods.
        `;
      }
    }

    console.log(`Calling Gemini API for ${category}...`);
    const recommendations = await callGeminiAPI(prompt);
    
    if (recommendations && recommendations.length > 0) {
      console.log(`Gemini API returned ${category} recommendations:`, recommendations.length);
      return recommendations;
    }

    console.log(`Gemini API failed or returned empty for ${category}, using fallback`);
    // Fallback to default recommendations if Gemini fails
    return getDefaultRecommendations();
  } catch (error) {
    console.error(`Error getting ${category} recommendations:`, error);
    console.log(`Returning default recommendations due to error`);
    return getDefaultRecommendations();
  }
}

// Function to build prompt for "Try New" category (random suggestions)
function buildTryNewPrompt(userPreferences: IUserPreferences | null) {
  if (!userPreferences || userPreferences.likedDishes.length === 0) {
    return `
    You are a food recommendation assistant. 
    Suggest 5 random, interesting dishes that people might want to try.
    Only return JSON in the format:
    [
      { "name": "Dish Name", "restaurant": "Restaurant Name", "description": "Short description", "reason": "Why this dish is interesting to try" }
    ]
    Make the suggestions diverse and exciting - include different cuisines, unique dishes, and popular favorites.
    `;
  }

  const likedDishNames = userPreferences.likedDishes.map(dish => dish.name);
  return `
  You are a food recommendation assistant. 
  Based on this user's liked dishes: ${likedDishNames.join(", ") || "None"}
  
  Suggest 5 NEW dishes they haven't tried yet but might enjoy based on their preferences.
  Only return JSON in the format:
  [
    { "name": "Dish Name", "restaurant": "Restaurant Name", "description": "Short description", "reason": "Why this dish was recommended based on their likes" }
  ]
  Focus on dishes similar to what they liked but different enough to be exciting new experiences.
  `;
}

// Function to build prompt for "Special Occasion" category
function buildSpecialOccasionPrompt() {
  return `
  You are a food recommendation assistant. 
  Suggest 5 special occasion dishes that would be perfect for celebrations, dates, or important events.
  Only return JSON in the format:
  [
    { "name": "Dish Name", "restaurant": "Restaurant Name", "description": "Short description", "reason": "Why this dish is perfect for special occasions" }
  ]
  Include dishes that are:
  - Visually impressive
  - Unique or memorable
  - Suitable for sharing
  - Higher quality/upscale
  - Perfect for celebrations
  `;
}

// Call Gemini API for recommendations
async function callGeminiAPI(prompt: string): Promise<any[]> {
  try {
    console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
    
    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('API timeout')), 10000); // 10 second timeout
    });

    const fetchPromise = fetch('/api/aiSuggestion', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        type: 'recommendations'
      }),
    });

    // Race between fetch and timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('Gemini API response received:', data);
    
    // Try to parse the response as JSON recommendations
    if (data.suggestion) {
      try {
        // Look for JSON in the response
        const jsonMatch = data.suggestion.match(/\[.*\]/s);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed JSON recommendations:', parsed.length);
          
          // Transform the parsed data to match our Dish type structure
          return parsed.map((item: any, index: number) => ({
            id: index + 1,
            name: item.name || 'Unknown Dish',
            restaurant: item.restaurant || 'Unknown Restaurant',
            image: '', // No image for now
            description: item.description || 'No description available',
            reason: item.reason || 'Recommended by AI',
            isRecommended: true
          }));
        }
      } catch (parseError) {
        console.error('Error parsing Gemini response:', parseError);
      }
    }

    console.log('No valid JSON found in response, returning empty array');
    // If no valid JSON found, return empty array
    return [];
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    return [];
  }
}

// Default recommendations when user has no preferences or API fails
function getDefaultRecommendations() {
  return [
    {
      id: 1,
      name: 'Lanzhou Beef Noodles',
      restaurant: 'Bowltiful',
      image: '',
      description: 'Hand-pulled noodles, flavorful halal beef, and rich broth.',
      isRecommended: false,
      reason: "Popular choice"
    },
    {
      id: 2,
      name: 'Pepperoni Pizza',
      restaurant: 'Pizza Hut',
      image: '',
      description: 'Lots of pepperoni and mozzarella cheese.',
      isRecommended: false,
      reason: "Classic favorite"
    },
    {
      id: 3,
      name: 'Subdog',
      restaurant: 'Subway',
      image: '',
      description: 'The American-style hotdog with mozzarella cheese, tomato sauce and limited-edition tangy mustard',
      isRecommended: false,
      reason: "New item"
    },
    {
      id: 4,
      name: 'Chicken Tikka Masala',
      restaurant: 'Spice Garden',
      image: '',
      description: 'Creamy, spiced chicken in a rich tomato-based curry sauce.',
      isRecommended: false,
      reason: "Indian classic"
    },
    {
      id: 5,
      name: 'Sushi Roll Combo',
      restaurant: 'Ocean Delights',
      image: '',
      description: 'Fresh salmon, tuna, and avocado rolls with wasabi and ginger.',
      isRecommended: false,
      reason: "Fresh and healthy"
    }
  ];
}

// Method to save user interaction with a dish
export async function saveDishInteraction(
  dish: {
    id: number;
    name: string;
    restaurant: string;
    image: string;
    description: string;
  },
  action: 'like' | 'dislike'
) {
  if (!Meteor.userId()) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to save dish interaction');
  }

  try {
    if (action === 'like') {
      await Meteor.callAsync('userPreferences.addLikedDish', dish);
    } else {
      await Meteor.callAsync('userPreferences.addDislikedDish', dish);
    }
    
    return true;
  } catch (error) {
    console.error('Error saving dish interaction:', error);
    throw new Meteor.Error('db-error', 'Failed to save dish interaction');
  }
}

// Method to save search term
export async function saveSearchTerm(searchTerm: string) {
  if (!Meteor.userId()) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to save search term');
  }

  try {
    await Meteor.callAsync('userPreferences.addSearchTerm', searchTerm);
    return true;
  } catch (error) {
    console.error('Error saving search term:', error);
    throw new Meteor.Error('db-error', 'Failed to save search term');
  }
}

// Method to update dietary restrictions
export async function updateDietaryRestrictions(restrictions: string[]) {
  if (!Meteor.userId()) {
    throw new Meteor.Error('not-authorized', 'You must be logged in to update dietary restrictions');
  }

  try {
    await Meteor.callAsync('userPreferences.updateDietaryRestrictions', restrictions);
    return true;
  } catch (error) {
    console.error('Error updating dietary restrictions:', error);
    throw new Meteor.Error('db-error', 'Failed to update dietary restrictions');
  }
}
  