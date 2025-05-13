import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";
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
  const [radius, setRadius] = useState(1000);  // Default radius set to 1000 meters
  const [isMapLoading, setIsMapLoading] = useState(true);

  useEffect(() => {
    const updateMaxResults = async () => {
      if (userLocation && map) {
          const fetchedRestaurants = await fetchRestaurants(userLocation.lat, userLocation.lng);
          const limitedRestaurants = fetchedRestaurants.slice(0, 20); // cap at 20
          setRestaurants(limitedRestaurants);
        }
    };

    updateMaxResults();
  }, [userLocation, map, radius]);


  const mapContainerStyle: google.maps.MapOptions = {
    fullscreenControl: false,
    mapTypeControl: false,
    streetViewControl: false,
    zoomControl: true,
    styles: [
      {
        featureType: "poi",
        elementType: "labels",
        stylers: [{ visibility: "off" }],
      },
    ],
  };

  const containerStyle = {
    position: "fixed" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100vh",
    zIndex: 0 // Ensure it's behind navbar and controls
  };

  // Normalize cuisine type from Google Places API
  const normalizeCuisineType = (type: string): string => {
    const baseType = type.replace("_restaurant", "");
    return baseType.charAt(0).toUpperCase() + baseType.slice(1);
  };

  const isCuisineType = (type: string): boolean => {
    const genericTypes = [
      "restaurant",
      "food",
      "meal_delivery",
      "meal_takeaway",
      "cafe",
      "bar",
      "bakery",
      "fast_food",
      "hamburger",
      "pizza",
      "sandwich",
      "breakfast",
      "lunch",
      "dinner",
    ];

    return type.includes("restaurant") && !genericTypes.some((genericType) => type === genericType);
  };

  async function fetchRestaurants(latitude: number, longitude: number): Promise<Restaurant[]> {
    const API_KEY = "AIzaSyAGR1fMiA0HwSF5h5zlv6oyL2JpoegvYuM";
    const URL = "https://places.googleapis.com/v1/places:searchNearby";

    const payload = {
      includedTypes: ["restaurant"],
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
      "X-Goog-FieldMask": "places.displayName,places.formattedAddress,places.location,places.rating,places.types",
    };

    try {
      const response = await fetch(URL, {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
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

      setAvailableCuisines(Array.from(cuisineTypes));
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
      setIsMapLoading(true);
      fetchRestaurants(userLocation.lat, userLocation.lng)
        .then((data) => {
          setRestaurants(data);
          setIsMapLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching restaurants:", error);
          setIsMapLoading(false);
        });
    }
  }, [userLocation, map, radius]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRadius(Number(e.target.value));
  };

  const formatRadius = (value: number): string => {
    if (value < 1000) {
      return `${value} m`;
    } else {
      return `${(value / 1000).toFixed(1)} km`;
    }
  };

  return (
    <LoadScript 
      googleMapsApiKey="AIzaSyAGR1fMiA0HwSF5h5zlv6oyL2JpoegvYuM" 
      libraries={["places"]}
      onLoad={() => console.log("Google Maps API loaded")}
      loadingElement={
        <div className="flex justify-center items-center h-screen w-full bg-white bg-opacity-80">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          <h6 className="ml-2 text-lg font-medium">Loading Maps...</h6>
        </div>
      }
    >
      <div className="relative h-screen">
        {userLocation && (
          <>
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={userLocation}
              zoom={14}
              options={{
                ...mapContainerStyle,
                scrollwheel: false,
              }}
              onLoad={(mapInstance) => {
                setMap(mapInstance);
                setIsMapLoading(false);
              }}
            >
              <Marker position={userLocation} />

              <Circle
                center={userLocation}
                radius={radius}
                options={{
                  fillColor: "rgba(100, 158, 255, 0.2)",
                  strokeColor: "#4285F4",
                  strokeOpacity: 0.8,
                  strokeWeight: 2,
                }}
              />

              {restaurants.map((restaurant, index) => (
                <Marker
                  key={index}
                  position={{
                    lat: restaurant.location.latitude,
                    lng: restaurant.location.longitude,
                  }}
                />
              ))}
            </GoogleMap>
            
            {isMapLoading && (
              <div className="absolute top-0 left-0 flex justify-center items-center h-full w-full bg-white bg-opacity-70 z-[1001]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                <h6 className="ml-2 text-lg font-medium">Loading restaurants...</h6>
              </div>
            )}
          </>
        )}

        {!userLocation && (
          <div className="flex flex-col justify-center items-center h-screen w-full bg-gray-100">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
            <h6 className="mt-2 text-lg font-medium">Getting your location...</h6>
          </div>
        )}

        <div className="absolute bottom-[70px] left-[11%] transform -translate-x-1/2 w-[300px] bg-white p-4 rounded-lg shadow-md z-[1000]">
          <p className="mb-2">Search Radius: {formatRadius(radius)}</p>
          <div className="w-full">
            <input
              type="range"
              value={radius}
              onChange={handleRadiusChange}
              min="500"
              max="5000"
              step="100"
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 px-1">
              <span>500m</span>
              <span>5km</span>
            </div>
          </div>
        </div>

        <div className="absolute bottom-1/4 left-[7%] z-[2000] flex flex-col gap-2.5">
          <button 
            className="bg-[#C47B4D] hover:bg-[#A35F35] text-white py-2 px-4 rounded shadow transition-colors"
            onClick={toggleSidebar}
          >
            {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          </button>
          <button 
            className="bg-[#C47B4D] hover:bg-[#A35F35] text-white py-2 px-4 rounded shadow transition-colors"
            onClick={() => setIsDicePopupOpen(true)}
          >
            Roll the Dice
          </button>
        </div>

        {isSidebarOpen && (
          <div className="absolute top-0 right-0 w-[300px] h-[calc(100vh-60px)] bg-white overflow-y-auto z-[999] p-5 shadow-md">
            <div className="mb-4">
              <h6 className="text-lg font-medium">
                Showing restaurants within {formatRadius(radius)}
              </h6>
            </div>

            {restaurants.length > 0 ? (
              restaurants.map((restaurant, index) => (
                <div key={index} className="mb-5 p-3 bg-gray-50 rounded-lg shadow-sm">
                  <h3 className="font-bold text-lg">{restaurant.displayName?.text || "N/A"}</h3>
                  <p className="text-gray-600 mt-1">{restaurant.formattedAddress || "N/A"}</p>
                  <p className="mt-1">Rating: {restaurant.rating || "N/A"}</p>
                  <p className="mt-1">
                    Cuisine:{" "}
                    {restaurant.types?.filter((type) => type.includes("restaurant")).map(normalizeCuisineType).join(", ") ||
                      "N/A"}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500">Loading restaurants...</p>
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
