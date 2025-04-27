import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  useLoadScript
} from "@react-google-maps/api";
import { Button } from "@mui/material"; // You can use Material UI for the button.

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [map, setMap] = useState(null);

  const mapContainerStyle = {
    width: "100%",
    height: "500px"
  };

  // Function to fetch restaurants within a radius of 20km
  const fetchRestaurants = (latitude, longitude, radius = 20000) => {
    const placesService = new window.google.maps.places.PlacesService(map);

    const request = {
      location: new window.google.maps.LatLng(latitude, longitude),
      radius: radius,
      type: ["restaurant"]
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setRestaurants(results); // Store the restaurants for later use
      } else {
        console.error("Places API error:", status);
      }
    });
  };

  // Get user location and set map center
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchRestaurants(latitude, longitude); // Fetch restaurants after getting location
        },
        (error) => {
          console.error("Error getting geolocation:", error);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  useEffect(() => {
    getUserLocation(); // Fetch user location when component mounts
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyAhbbEBNoy7_QrgyGmj2qy5oVPPUJ2VfTw">
      <div style={{ display: "flex" }}>
        {/* Map */}
        <div style={{ flex: 1 }}>
          {userLocation && (
            <GoogleMap
              mapContainerStyle={mapContainerStyle}
              center={userLocation}
              zoom={14}
              onLoad={(mapInstance) => setMap(mapInstance)} // Set map instance
            >
              {/* Place markers for each restaurant */}
              {restaurants.map((restaurant, index) => (
                <Marker
                  key={index}
                  position={{
                    lat: restaurant.geometry.location.lat(),
                    lng: restaurant.geometry.location.lng()
                  }}
                  label={restaurant.name}
                />
              ))}
            </GoogleMap>
          )}
        </div>

        {/* Sidebar */}
        <div
          style={{
            width: isSidebarOpen ? "300px" : "0",
            height: "100vh",
            backgroundColor: "white",
            position: "fixed",
            top: 0,
            right: 0,
            overflowY: "auto",
            transition: "width 0.3s",
            boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.1)"
          }}
        >
          <Button onClick={toggleSidebar} style={{ margin: "10px" }}>
            {isSidebarOpen ? "Close Sidebar" : "Open Sidebar"}
          </Button>
          <div
            style={{
              padding: "20px",
              overflowY: "scroll",
              maxHeight: "90vh" // Make the sidebar scrollable
            }}
          >
            {restaurants.map((restaurant, index) => (
              <div key={index} style={{ marginBottom: "20px" }}>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.vicinity}</p>
                <p>Rating: {restaurant.rating}</p>
                <p>Price Level: {restaurant.price_level}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </LoadScript>
  );
};

export default Map;
