import { Meteor } from 'meteor/meteor';

export interface NearbyRestaurant {
  id: string;
  name: string;
  address: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  types?: string[];
  distance?: number; // in meters
  servesDish: string; // the dish this restaurant serves
  mightServeDish?: boolean; // Added for fallback search
  confidenceScore?: number; // Confidence score (0-100) that restaurant serves the dish
}

export interface DishRestaurantMatch {
  dish: {
    id: number;
    name: string;
    description: string;
    reason?: string;
  };
  nearbyRestaurants: NearbyRestaurant[];
}

// Search for restaurants that serve a specific dish near a location
export async function findRestaurantsServingDish(
  dishName: string,
  latitude: number,
  longitude: number,
  radius: number = 5000 // 5km default radius
): Promise<NearbyRestaurant[]> {
  try {
    // First, try to search for restaurants with the dish name in the query
    const searchQuery = `${dishName} restaurant`;
    
    const API_KEY = Meteor.settings.public?.googlePlacesApiKey || "AIzaSyDMgS81-Z8y-C7g_9I7jfaahGpPMWacRSo";
    const URL = "https://places.googleapis.com/v1/places:searchText";
    
    const payload = {
      textQuery: searchQuery,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius: radius,
        },
      },
    };
    
    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.types",
    };

    console.log('Searching for restaurants with payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Google Places API Error:', errorText);
      
      // If text search fails, try a fallback search for just restaurants in the area
      console.log('Text search failed, trying fallback search...');
      return await fallbackRestaurantSearch(latitude, longitude, radius, dishName);
    }

    const data = await response.json();
    const places = data.places || [];

    console.log(`Found ${places.length} restaurants for "${dishName}"`);
    console.log('Sample place data:', places[0]);

    // Transform the response to match our interface
    const restaurants: NearbyRestaurant[] = places.map((place: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.location.latitude,
        place.location.longitude
      );

      return {
        id: place.id,
        name: place.displayName?.text || place.name || 'Unknown Restaurant',
        address: place.formattedAddress || place.address || 'Address not available',
        location: {
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        },
        rating: place.rating,
        types: place.types,
        distance,
        servesDish: dishName,
      };
    });

    // Sort by distance (closest first)
    return restaurants.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  } catch (error) {
    console.error('Error searching for restaurants serving dish:', error);
    
    // Try fallback search if main search fails
    try {
      console.log('Main search failed, trying fallback...');
      return await fallbackRestaurantSearch(latitude, longitude, radius, dishName);
    } catch (fallbackError) {
      console.error('Fallback search also failed:', fallbackError);
      throw new Error('Failed to search for restaurants');
    }
  }
}

// Fallback search: get restaurants in the area and try to match them intelligently
async function fallbackRestaurantSearch(
  latitude: number,
  longitude: number,
  radius: number,
  dishName: string
): Promise<NearbyRestaurant[]> {
  try {
    const API_KEY = Meteor.settings.public?.googlePlacesApiKey || "AIzaSyDMgS81-Z8y-C7g_9I7jfaahGpPMWacRSo";
    const URL = "https://places.googleapis.com/v1/places:searchNearby";
    
    const payload = {
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: radius,
        },
      },
    };
    
    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.types",
    };

    console.log('Fallback search payload:', JSON.stringify(payload, null, 2));

    const response = await fetch(URL, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Fallback search failed:', errorText);
      throw new Error(`Fallback search failed: ${response.status}`);
    }

    const data = await response.json();
    const places = data.places || [];

    console.log(`Fallback search found ${places.length} restaurants`);
    console.log('Sample fallback place data:', places[0]);

    // Transform the response and try to intelligently match dishes
    const restaurants: NearbyRestaurant[] = places.map((place: any) => {
      const distance = calculateDistance(
        latitude,
        longitude,
        place.location.latitude,
        place.location.longitude
      );

      // Try to determine if this restaurant might serve the dish
      const matchResult = isRestaurantLikelyToServeDish(place, dishName);

      return {
        id: place.id,
        name: place.displayName?.text || place.name || 'Unknown Restaurant',
        address: place.formattedAddress || place.address || 'Address not available',
        location: {
          latitude: place.location.latitude,
          longitude: place.location.longitude,
        },
        rating: place.rating,
        types: place.types,
        distance,
        servesDish: dishName,
        mightServeDish: matchResult.mightServe, // Add this flag to indicate confidence
        confidenceScore: matchResult.confidence, // Add confidence score
      };
    });

    // Sort by likelihood of serving the dish first, then by distance
    return restaurants.sort((a, b) => {
      if (a.mightServeDish && !b.mightServeDish) return -1;
      if (!a.mightServeDish && b.mightServeDish) return 1;
      
      // If both might serve, sort by confidence score
      if (a.mightServeDish && b.mightServeDish) {
        const confidenceDiff = (b.confidenceScore || 0) - (a.confidenceScore || 0);
        if (confidenceDiff !== 0) return confidenceDiff;
      }
      
      // Then sort by distance
      return (a.distance || 0) - (b.distance || 0);
    });
  } catch (error) {
    console.error('Fallback restaurant search failed:', error);
    throw error;
  }
}

// Helper function to determine if a restaurant might serve a specific dish
function isRestaurantLikelyToServeDish(place: any, dishName: string): { mightServe: boolean; confidence: number } {
  const restaurantName = place.displayName?.text || place.name || '';
  const types = place.types || [];
  
  let confidence = 0;
  
  // Convert dish name to lowercase for comparison
  const dishLower = dishName.toLowerCase();
  
  // Check if restaurant name contains dish-related keywords
  const dishKeywords = extractDishKeywords(dishName);
  const hasDishKeywords = dishKeywords.some(keyword => 
    restaurantName.toLowerCase().includes(keyword.toLowerCase())
  );
  if (hasDishKeywords) confidence += 30;
  
  // Check if restaurant types match the dish type
  const hasMatchingType = types.some((type: string) => {
    const typeLower = type.toLowerCase();
    return dishKeywords.some(keyword => typeLower.includes(keyword.toLowerCase()));
  });
  if (hasMatchingType) confidence += 25;
  
  // Check for specific cuisine matches
  const hasCuisineMatch = checkCuisineMatch(dishName, restaurantName, types);
  if (hasCuisineMatch) confidence += 35;
  
  // Check for exact dish name matches in restaurant name
  const hasExactDishMatch = restaurantName.toLowerCase().includes(dishLower);
  if (hasExactDishMatch) confidence += 40;
  
  // Check for chain restaurant matches
  const hasChainMatch = checkChainRestaurantMatch(dishName, restaurantName);
  if (hasChainMatch) confidence += 50;
  
  // Bonus for restaurant names that are very specific to the cuisine
  if (restaurantName.toLowerCase().includes('pizzeria') && dishLower.includes('pizza')) confidence += 20;
  if (restaurantName.toLowerCase().includes('sushi') && dishLower.includes('sushi')) confidence += 20;
  if (restaurantName.toLowerCase().includes('curry') && dishLower.includes('curry')) confidence += 20;
  
  return {
    mightServe: confidence >= 30, // Require at least 30% confidence
    confidence: Math.min(confidence, 100) // Cap at 100%
  };
}

// Check if the cuisine type matches between dish and restaurant
function checkCuisineMatch(dishName: string, restaurantName: string, types: string[]): boolean {
  const dishLower = dishName.toLowerCase();
  const restaurantLower = restaurantName.toLowerCase();
  
  // Italian cuisine
  if (dishLower.includes('pizza') || dishLower.includes('pasta') || dishLower.includes('spaghetti')) {
    return restaurantLower.includes('italian') || restaurantLower.includes('pizzeria') || 
           types.some(type => type.includes('italian'));
  }
  
  // Japanese cuisine
  if (dishLower.includes('sushi') || dishLower.includes('ramen')) {
    return restaurantLower.includes('japanese') || restaurantLower.includes('sushi') || 
           types.some(type => type.includes('japanese'));
  }
  
  // Indian cuisine
  if (dishLower.includes('tikka') || dishLower.includes('curry') || dishLower.includes('masala')) {
    return restaurantLower.includes('indian') || restaurantLower.includes('curry') || 
           types.some(type => type.includes('indian'));
  }
  
  // Chinese cuisine
  if (dishLower.includes('noodles') || dishLower.includes('lanzhou')) {
    return restaurantLower.includes('chinese') || restaurantLower.includes('noodles') || 
           types.some(type => type.includes('chinese'));
  }
  
  // Mexican cuisine
  if (dishLower.includes('taco') || dishLower.includes('burrito')) {
    return restaurantLower.includes('mexican') || restaurantLower.includes('taco') || 
           types.some(type => type.includes('mexican'));
  }
  
  return false;
}

// Check if it's a chain restaurant that might serve the dish
function checkChainRestaurantMatch(dishName: string, restaurantName: string): boolean {
  const dishLower = dishName.toLowerCase();
  const restaurantLower = restaurantName.toLowerCase();
  
  // Subway for sandwiches/hotdogs
  if ((dishLower.includes('sub') || dishLower.includes('hotdog')) && restaurantLower.includes('subway')) {
    return true;
  }
  
  // Pizza chains
  if (dishLower.includes('pizza') && 
      (restaurantLower.includes('pizza hut') || restaurantLower.includes('domino') || restaurantLower.includes('papa john'))) {
    return true;
  }
  
  // Burger chains
  if (dishLower.includes('burger') && 
      (restaurantLower.includes('mcdonald') || restaurantLower.includes('burger king') || restaurantLower.includes('wendy'))) {
    return true;
  }
  
  return false;
}

// Extract relevant keywords from dish names
function extractDishKeywords(dishName: string): string[] {
  const keywords: string[] = [];
  const dishLower = dishName.toLowerCase();
  
  // Common cuisine types and dish patterns
  if (dishLower.includes('pizza')) {
    keywords.push('pizza', 'italian', 'restaurant', 'pizzeria');
  }
  if (dishLower.includes('sushi')) {
    keywords.push('sushi', 'japanese', 'asian', 'restaurant');
  }
  if (dishLower.includes('tikka') || dishLower.includes('curry') || dishLower.includes('masala')) {
    keywords.push('indian', 'curry', 'restaurant');
  }
  if (dishLower.includes('noodles') || dishLower.includes('beef') || dishLower.includes('lanzhou')) {
    keywords.push('chinese', 'asian', 'noodles', 'restaurant');
  }
  if (dishLower.includes('hotdog') || dishLower.includes('sub') || dishLower.includes('subway')) {
    keywords.push('american', 'fast food', 'sandwich', 'restaurant');
  }
  if (dishLower.includes('burger') || dishLower.includes('hamburger')) {
    keywords.push('burger', 'hamburger', 'fast food', 'american', 'restaurant');
  }
  if (dishLower.includes('pasta') || dishLower.includes('spaghetti')) {
    keywords.push('italian', 'pasta', 'restaurant');
  }
  if (dishLower.includes('taco') || dishLower.includes('burrito')) {
    keywords.push('mexican', 'taco', 'burrito', 'restaurant');
  }
  if (dishLower.includes('ramen')) {
    keywords.push('ramen', 'japanese', 'asian', 'noodles', 'restaurant');
  }
  if (dishLower.includes('pho')) {
    keywords.push('pho', 'vietnamese', 'asian', 'noodles', 'restaurant');
  }
  
  // Add the main dish name as a keyword
  keywords.push(dishName);
  
  // Add common restaurant suffixes
  keywords.push('restaurant', 'cafe', 'diner', 'bistro', 'grill');
  
  return keywords;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// Get user's current location
export async function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        reject(new Error(`Geolocation error: ${error.message}`));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  });
}

// Find restaurants for multiple dishes at once
export async function findRestaurantsForMultipleDishes(
  dishes: Array<{ id: number; name: string; description: string; reason?: string }>,
  latitude: number,
  longitude: number,
  radius: number = 5000
): Promise<DishRestaurantMatch[]> {
  try {
    const results: DishRestaurantMatch[] = [];

    // Search for each dish in parallel
    const searchPromises = dishes.map(async (dish) => {
      try {
        const restaurants = await findRestaurantsServingDish(
          dish.name,
          latitude,
          longitude,
          radius
        );

        return {
          dish,
          nearbyRestaurants: restaurants.slice(0, 5), // Limit to top 5 restaurants per dish
        };
      } catch (error) {
        console.error(`Error searching for dish "${dish.name}":`, error);
        return {
          dish,
          nearbyRestaurants: [],
        };
      }
    });

    const resultsArray = await Promise.all(searchPromises);
    return resultsArray;
  } catch (error) {
    console.error('Error searching for multiple dishes:', error);
    throw new Error('Failed to search for multiple dishes');
  }
}

// Simple test function to debug Google Places API
export async function testGooglePlacesAPI(latitude: number, longitude: number) {
  try {
    const API_KEY = Meteor.settings.public?.googlePlacesApiKey || "AIzaSyDMgS81-Z8y-C7g_9I7jfaahGpPMWacRSo";
    
    // Test 1: Basic nearby search
    console.log('Testing basic nearby search...');
    const basicPayload = {
      maxResultCount: 5,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: 1000,
        },
      },
    };
    
    const basicResponse = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify(basicPayload),
    });
    
    if (basicResponse.ok) {
      const basicData = await basicResponse.json();
      console.log('Basic search successful:', basicData);
    } else {
      const errorText = await basicResponse.text();
      console.error('Basic search failed:', errorText);
    }
    
    // Test 2: Text search
    console.log('Testing text search...');
    const textPayload = {
      textQuery: "restaurant",
      maxResultCount: 5,
      locationBias: {
        circle: {
          center: { latitude, longitude },
          radius: 1000,
        },
      },
    };
    
    const textResponse = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location",
      },
      body: JSON.stringify(textPayload),
    });
    
    if (textResponse.ok) {
      const textData = await textResponse.json();
      console.log('Text search successful:', textData);
    } else {
      const errorText = await textResponse.text();
      console.error('Text search failed:', errorText);
    }
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}
