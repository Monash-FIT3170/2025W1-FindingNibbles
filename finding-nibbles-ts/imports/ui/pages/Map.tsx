import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Circle ,InfoWindow } from "@react-google-maps/api";
import { Box, Button, Slider, Typography } from "@mui/material";
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
  const [hoveredMarkerIndex, setHoveredMarkerIndex] = useState<number | null>(null);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(null);

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

const cuisineIcons: Record<string, string> = {
  "Hamburger": "/images/burger.png",
  "Italian": "/images/italian.png",
  "Indian" : "/images/indfsian.png",
};


const getCuisineIcon = (types: string[] | undefined): string | undefined => {
  if (!types) return;

  for (let type of types) {
    if (type.includes("restaurant")) {
      const cuisine = normalizeCuisineType(type); 
      if (cuisineIcons[cuisine]) {
        return cuisineIcons[cuisine];
      }
    }
  }

  return undefined; 
};


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
  }, [userLocation, map, radius]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRadiusChange = (_event: Event, newValue: number | number[]) => {
    setRadius(newValue as number);
  };

  const formatRadius = (value: number): string => {
    if (value < 1000) {
      return `${value} m`;
    } else {
      return `${(value / 1000).toFixed(1)} km`;
    }
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyAGR1fMiA0HwSF5h5zlv6oyL2JpoegvYuM" libraries={["places"]}>
      <div style={{ position: "relative", height: "100vh" }}>
        {userLocation && (
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={userLocation}
            zoom={14}
            options={{
              ...mapContainerStyle,
              scrollwheel: false,
            }}
            onLoad={(mapInstance) => setMap(mapInstance)}
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

          {restaurants.map((restaurant, index) => {
            const isHovered = hoveredMarkerIndex === index;
              <Marker
                key={index}
                position={{
                  lat: restaurant.location.latitude,
                  lng: restaurant.location.longitude,
                }}
                icon={{
                  url: iconUrl,
                  scaledSize: new window.google.maps.Size(
                    isHovered ? 50 : 40,  // Grow on hover
                    isHovered ? 50 : 40
                  ),
                }}
                onMouseOver={() => setHoveredMarkerIndex(index)}
          </GoogleMap>
        )}

        <Box
          sx={{
            position: "absolute",
            bottom: "70px",
            left: "11%",
            transform: "translateX(-50%)",
            width: "300px",
            bgcolor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 1000,
          }}
        >
          <Typography gutterBottom>Search Radius: {formatRadius(radius)}</Typography>
          <Slider
            value={radius}
            onChange={handleRadiusChange}
            valueLabelDisplay="auto"
            valueLabelFormat={formatRadius}
            min={500}
            max={5000}
            step={100}
          />
        </Box>

        <div
        style={{
          position: "absolute",     // Use fixed so it stays pinned to viewport
          bottom: "25%",        // Anchor to bottom
          left: "7%",          // Anchor to left
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: "10px",           // Space between buttons
        }}
      >
        <Button variant="contained" onClick={toggleSidebar}>
          {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          </Button>
          <Button variant="contained" onClick={() => setIsDicePopupOpen(true)}>
            Roll the Dice
          </Button>
        </div>


        {isSidebarOpen && (
          <div
            style={{
              position: "absolute",
              top: 0,
              right: 0,
              width: "300px",
              height: "calc(100vh - 60px)",
              backgroundColor: "white",
              overflowY: "scroll",
              zIndex: 999,
              padding: "20px",
              boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Box mb={2}>
              <Typography variant="h6">
                Showing restaurants within {formatRadius(radius)}
              </Typography>
            </Box>

            {restaurants.length > 0 ? (
              restaurants.map((restaurant, index) => (
                <div key={index} style={{ marginBottom: "20px" }}>
                  <h3>{restaurant.displayName?.text || "N/A"}</h3>
                  <p>{restaurant.formattedAddress || "N/A"}</p>
                  <p>Rating: {restaurant.rating || "N/A"}</p>
                  <p>
                    Cuisine:{" "}
                    {restaurant.types?.filter((type) => type.includes("restaurant")).map(normalizeCuisineType).join(", ") ||
                      "N/A"}
                  </p>
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
