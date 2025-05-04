import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker, Circle } from "@react-google-maps/api";
import { Box, Button, Slider, Typography } from "@mui/material";

export const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [map, setMap] = useState(null);
  const [radius, setRadius] = useState(2000);

  const mapContainerStyle = {
    position: "absolute",
    top: "60px",
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "calc(100vh - 60px)"
  };

  async function fetchRestaurants(latitude, longitude) {
    const API_KEY = "AIzaSyAGR1fMiA0HwSF5h5zlv6oyL2JpoegvYuM";
    const URL = "https://places.googleapis.com/v1/places:searchNearby";

    const payload = {
      includedTypes: ["restaurant"],
      maxResultCount: 10,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: radius
        }
      }
    };

    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.location,places.rating"
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

      console.log("Fetched Restaurants:", restaurants);
      return restaurants;
    } catch (error) {
      console.error("Error fetching restaurants:", error.message);
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
  }, [userLocation, map, radius]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleRadiusChange = (event, newValue) => {
    setRadius(newValue)
  };

  const formatRadius = (value) => {
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
    >
      <div style={{ position: "relative", height: "100vh" }}>
        {userLocation && (
          <GoogleMap
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={14}
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
                strokeWeight: 2
              }}
            />

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

        <Box
          sx={{
            position: "absolute",
            bottom: "30px",
            left: "50%",
            transform: "translateX(-50%)",
            width: "300px",
            bgcolor: "white",
            p: 2,
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 1000
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

        <Button
          variant="contained"
          onClick={toggleSidebar}
          style={{
            position: "absolute",
            top: "15px",
            right: "10px",
            zIndex: 1000
          }}
        >
          {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
        </Button>

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
                </div>
              ))
            ) : (
              <p>Loading restaurants...</p>
            )}
          </div>
        )}
      </div>
    </LoadScript>
  );
};

