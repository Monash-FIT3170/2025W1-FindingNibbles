import React, { useState, useEffect } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { Button } from "@mui/material";

const Map = () => {
  const [userLocation, setUserLocation] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [map, setMap] = useState(null);
  // Map container styling
  const mapContainerStyle = {
    position: "absolute",
    top: "60px", // leave space for navbar
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "calc(100vh - 60px)" // Dynamic height for the map container
  };

  // Fetch restaurants near user location
  const fetchRestaurants = (latitude, longitude, radius = 20000) => {
    if (!map) return;

    const placesService = new window.google.maps.places.PlacesService(map);

    const request = {
      location: new window.google.maps.LatLng(latitude, longitude),
      radius: radius,
      type: ["restaurant"]
    };

    placesService.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        setRestaurants(results);
      } else {
        console.error("Places API error:", status);
      }
    });
  };

  // Get user location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          // Set default location (can be changed to any fallback coordinates)
          setUserLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco as fallback
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setUserLocation({ lat: 37.7749, lng: -122.4194 }); // San Francisco as fallback
    }
  };

  useEffect(() => {
    getUserLocation();
  }, []);

  useEffect(() => {
    if (userLocation && map) {
      fetchRestaurants(userLocation.lat, userLocation.lng);
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
        {/* Map */}
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
                  lat: restaurant.geometry.location.lat(),
                  lng: restaurant.geometry.location.lng()
                }}
              />
            ))}
          </GoogleMap>
        )}

        {/* Sidebar Toggle Button */}
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

        {/* Sidebar */}
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
                  <h3>{restaurant.name}</h3>
                  <p>{restaurant.vicinity}</p>
                  <p>Rating: {restaurant.rating}</p>
                  <p>Price Level: {restaurant.price_level || "N/A"}</p>
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
