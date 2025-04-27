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

}