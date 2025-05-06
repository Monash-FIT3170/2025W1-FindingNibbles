import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Button } from "@mui/material";
import DicePopup from "../components/popups/DicePopup";

interface Location {
  lat: number;
  lng: number;
}

interface Restaurant {
  displayName?: {
    text: string;
  };
  formattedAddress?: string;
  location: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  types?: string[];
}

export const Map = () => {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [availableCuisines, setAvailableCuisines] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isDicePopupOpen, setIsDicePopupOpen] = useState(false);
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const mapContainerStyle: google.maps.MapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }]
      }
    ]
  };

  const containerStyle = {
    position: "absolute" as const,
    top: "60px",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "calc(100vh - 60px)"
  };

  // Function to normalize cuisine types from Google Places API
  const normalizeCuisineType = (type: string): string => {
    // Remove '_restaurant' suffix and capitalize first letter
    const baseType = type.replace('_restaurant', '');
    return baseType.charAt(0).toUpperCase() + baseType.slice(1);
  };

  // Function to check if a type is a cuisine
  const isCuisineType = (type: string): boolean => {
    // List of generic restaurant types to exclude
    const genericTypes = [
      'restaurant',
      'food',
      'meal_delivery',
      'meal_takeaway',
      'cafe',
      'bar',
      'bakery',
      'fast_food',
      'hamburger',
      'pizza',
      'sandwich',
      'breakfast',
      'lunch',
      'dinner'
    ];

    // Check if the type is not in the generic types list and contains 'restaurant'
    return type.includes('restaurant') && !genericTypes.some(genericType => type === genericType);
  };

  async function fetchRestaurants(latitude: number, longitude: number): Promise<Restaurant[]> {
    const API_KEY = "AIzaSyAGR1fMiA0HwSF5h5zlv6oyL2JpoegvYuM";
    const URL = "https://places.googleapis.com/v1/places:searchNearby";

    const payload = {
      includedTypes: ["restaurant"],
      maxResultCount: 20, // Increased to get more variety of cuisines
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: 2000.0
        }
      }
    };

    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.rating,places.types"
    };

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const restaurants = data.places || [];

      // Extract and process cuisine types
      const cuisineTypes = new Set<string>();
      restaurants.forEach((restaurant: Restaurant) => {
        if (restaurant.types) {
          restaurant.types.forEach((type: string) => {
            if (isCuisineType(type)) {
              cuisineTypes.add(normalizeCuisineType(type));
            }
          });
        }
      });

      const availableCuisines = Array.from(cuisineTypes);
      console.log("Available Cuisines:", availableCuisines);
      setAvailableCuisines(availableCuisines);
      return restaurants;
    } catch (error) {
      console.error("Error fetching restaurants:", error instanceof Error ? error.message : String(error));
      return [];
    }
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setUserLocation({ lat: 37.7749, lng: -122.4194 });
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 37.7749, lng: -122.4194 });
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && map) {
      fetchRestaurants(userLocation.lat, userLocation.lng)
        .then((data) => setRestaurants(data))
        .catch((error) => console.error("Error fetching restaurants:", error));
    }
  }, [userLocation, map]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LoadScript
      googleMapsApiKey="AIzaSyAGR1fMiA0HwSF5h5zlv6oyL2JpoegvYuM"
      libraries={["places"]}
    >
      <div style={{ position: "relative", height: "100vh" }}>
        {userLocation && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation}
            zoom={14}
            options={mapContainerStyle}
            onLoad={(mapInstance) => setMap(mapInstance)}
          >
            {restaurants.map((restaurant, index) => (
              <Marker
                key={index}
                position={{
                  lat: restaurant.location.latitude,
                  lng: restaurant.location.longitude
                }}
              />
            ))}
          </GoogleMap>
        )}

        <div style={{ position: "absolute", top: "15px", right: "10px", zIndex: 1000, display: "flex", gap: "10px" }}>
          <Button
            variant="contained"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          </Button>
          <Button
            variant="contained"
            onClick={() => setIsDicePopupOpen(true)}
          >
            Roll the Dice 
          </Button>
        </div>

        {isSidebarOpen && (
          <div
            style={{
              position: "absolute",
              top: "60px",
              right: 0,
              width: "300px",
              height: "calc(100vh - 60px)",
              backgroundColor: "white",
              overflowY: "scroll",
              zIndex: 999,
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
            }}
          >
            {restaurants.length > 0 ? (
              restaurants.map((restaurant, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <h3>{restaurant.displayName?.text || "N/A"}</h3>
                  <p>{restaurant.formattedAddress || "N/A"}</p>
                  <p>Rating: {restaurant.rating || "N/A"}</p>
                  <p>Cuisine: {restaurant.types?.filter(type => type.includes('restaurant')).map(normalizeCuisineType).join(', ') || "N/A"}</p>
                </div>
              ))
            ) : (
              <p>Loading restaurants...</p>
            )}
          </div>
        )}

        <DicePopup 
          open={isDicePopupOpen} 
          onClose={() => setIsDicePopupOpen(false)}
          availableCuisines={availableCuisines}
        />
      </div>
    </LoadScript>
  );
};

