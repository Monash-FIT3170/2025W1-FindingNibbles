import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Button } from "@mui/material";

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [map, setMap] = useState(null);

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
          radius: 2000.0
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
            mapContainerStyle={mapContainerStyle}
            center={userLocation}
            zoom={14}
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

export default Map;
