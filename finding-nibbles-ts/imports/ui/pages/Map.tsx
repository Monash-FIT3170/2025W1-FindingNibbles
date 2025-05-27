import React, { useState, useEffect, useCallback } from "react";
import { TextField, Box, MenuItem} from "@mui/material";
import { Meteor } from 'meteor/meteor';
import DicePopup from "../components/popups/DicePopup"; 
import { GoogleMap, LoadScript, Marker, Circle, Autocomplete, InfoWindow } from "@react-google-maps/api";
import { ISavedRestaurant } from "../api/SavedRestaurants";
import { RadarChart } from "recharts";
import { GenerateContentResponseHandler } from "@google-cloud/vertexai";
// Add debounce utility
const debounce = (func: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

interface Location {
  lat: number;
  lng: number;
}
interface Restaurant {
  id?: string;
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
  const [highlightedCuisine, setHighlightedCuisine] = useState<string | null>(null);


  const [isMapLoading, setIsMapLoading] = useState(true);
  const [sortedRestaurants, setSortedRestaurants] = useState<Restaurant[]>([]);
  const [debouncedRadius, setDebouncedRadius] = useState(radius);
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const [searchValue, setSearchValue] = useState<string>('');
  const [searchSaved, setSearchSaved] = useState(false);
  const [selectedCusine, setSelectedCusine] = useState<string>('All');






  // Create debounced fetch function with useCallback
  const debouncedFetchRestaurants = useCallback(
    debounce(async (lat: number, lng: number, rad: number) => {
      setIsMapLoading(true);
      try {


        const central_points = findCoordinates(lat,lng,2000);      
        const new_radius = Math.ceil((1/3)*2000);


        const innerPoints = central_points.flatMap(({lat,lng}) =>
          findCoordinates(lat,lng,new_radius)
        );

        const full_restaurant_search: Restaurant[][] = await Promise.all(
          innerPoints.map(({lat,lng,radius}) =>
          fetchRestaurants(lat,lng,radius)
          )
        );
      setRestaurants(full_restaurant_search.flat());

      } catch (error) {
        console.error("Error fetching restaurants:", error);
      } finally {
        setIsMapLoading(false);
      }
    }, 500), // 500ms delay
    []
  );

// ############### CALCULATING RADIUS

const EARTH_RADIUS  = 6378137

const deltaLat = (meters: number) => {
  // Takes in d and finds the distance change based on the Earth Radius
  const latRaw = meters/EARTH_RADIUS * (180/Math.PI);
  // Rounding the value to 4 decimal places
  return Math.round(latRaw *10000)/10000;
}

const deltaLng = (new_lattitude: number, meters: number) => {
  const lngRaw = (meters/(EARTH_RADIUS * Math.cos(new_lattitude * Math.PI/180))) * (180/Math.PI);
  return Math.round(lngRaw * 10000)/10000
}

const horizontalLngDist = (a: number, b:number) =>{

  return Math.sqrt(a**2 - b**2);
}




const findCoordinates = (central_lat: number, central_lng: number, search_radius: number) => {
  // Diameter of the circle used to calculate North and South distances
  const diameter = 2*search_radius;
  // Change in lat value 
  const lat_change = deltaLat(diameter);
  // Distance to move horizontally for diagonal points (m)
  const lng_distance = Math.ceil(horizontalLngDist(diameter, search_radius));
  console.log("THIS IS THE LNG DISTANCE", lng_distance);
  // Lattitude change for diagonal points (moving up 1/2 the lat change)
  // const diag_lat_change = lat_change/2;

  const output = [];
  // Central point
  output.push({lat: central_lat, lng: central_lng, radius: search_radius });

  // North and South points
  output.push({lat:central_lat + lat_change, lng: central_lng, radius: search_radius});
  output.push({lat:central_lat - lat_change, lng: central_lng, radius: search_radius});
  
  // NE
  {
    const lat_NE = central_lat + lat_change/2;
    const lng_NE = central_lng + deltaLng(lat_NE, lng_distance);
    output.push({lat:lat_NE , lng: lng_NE, radius:search_radius });
  }

  // //SE
  {
    const lat_SE = central_lat - lat_change/2;
    const lng_SE = central_lng + deltaLng(lat_SE, lng_distance);
    output.push({lat: lat_SE, lng: lng_SE , radius: search_radius});
  }
  // //NW
  {
    const lat_NW = central_lat + lat_change/2;
    const lng_NW = central_lng - deltaLng(lat_NW, lng_distance);
    output.push({lat:lat_NW , lng: lng_NW , radius: search_radius});
  }
  // //SW
  {
    const lat_SW = central_lat - lat_change/2;
    const lng_SW = central_lng - deltaLng(lat_SW, lng_distance);
    output.push({lat: lat_SW, lng: lng_SW, radius: search_radius});
  }

  return output;
}





//##########################


  // console.log("This is the restaurants " ,  JSON.stringify(restaurants,null,2));

  // Update debounced radius when radius changes
  useEffect(() => {
    setDebouncedRadius(radius);
  }, [radius]);

  useEffect(() => {
    Meteor.subscribe('savedRestaurants');
  }, []);
  // Update restaurants when debounced radius changes
  useEffect(() => {
    if (userLocation && map) {
      debouncedFetchRestaurants(userLocation.lat, userLocation.lng, debouncedRadius);
    }
  }, [userLocation, map, debouncedRadius, debouncedFetchRestaurants]);


  useEffect(() => {
    const sorted = [...restaurants].sort((restaurant1, restaurant2) => {
      const rating1 = restaurant1.rating ?? 0;
      const rating2 = restaurant2.rating ?? 0;
      return rating2 - rating1;
    });
    setSortedRestaurants(sorted);
  }, [restaurants]);

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

  const saveRestaurant = (restaurant: Restaurant) => {
    const userId = Meteor.userId();
    if (!userId) {
      alert("You must be logged in to save restaurants");
      return;
    }

    const savedRestaurant: ISavedRestaurant = {
      userId: userId,
      name: restaurant.displayName?.text ?? "Unknown Name",
      location: restaurant.formattedAddress ?? "Unknown Location",
    };
    

    Meteor.call('savedRestaurants.save', savedRestaurant, (error: Meteor.Error | null) => {
      if (error) {
        alert(`Failed to save: ${error.reason || error.message || error}`);
        console.error('Error saving restaurant:', error);
      } else {
        alert('Restaurant saved successfully');
      }
    });
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
  const onLoadAutocomplete = (autocompleteInstance: google.maps.places.Autocomplete) => {
    setAutocomplete(autocompleteInstance);
  };

  // Function to save search term to database
  const saveSearchTerm = (term: string) => {
    if (term && term.trim() !== '') {
      setSearchSaved(true);
      Meteor.call('searchHistory.save', term, (error: any, result: any) => {
        if (error) {
          console.error('Error saving search term:', error);
        } else {
          console.log('Search term saved successfully:', term, result);
          Meteor.subscribe('searchHistory');
        }
        setTimeout(() => setSearchSaved(false), 500);
      });
    }
  };

  const onPlaceChanged = () => {
    if (autocomplete) {
      const place = autocomplete.getPlace();
      if (place.geometry?.location) {
        const newLocation = {
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
        };
        setUserLocation(newLocation);
        if (map) {
          map.panTo(newLocation);
        }

        // Save the search term to the database
        const searchTerm = place.name || place.formatted_address;
        if (searchTerm) {
          setSearchValue(searchTerm);
          saveSearchTerm(searchTerm);
        }
      }
    }
  };

  // Handle when user types in the search input
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  // Handle if user presses Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue && searchValue.trim() !== '') {
      saveSearchTerm(searchValue);
    }
  };

  // Normalize cuisine type from Google Places API
  const normalizeCuisineType = (type: string): string => {
    const baseType = type.replace("_restaurant", "");
    return baseType.charAt(0).toUpperCase() + baseType.slice(1);
  };

const filterRestaurantsByCuisine = (restaurants: Restaurant[], cuisine: string): Restaurant[] => {
  if (cuisine === 'All') return restaurants;

  return restaurants.filter((restaurant) =>
    restaurant.types?.some(
      (type) =>
        type.includes("restaurant") &&
        normalizeCuisineType(type) === cuisine
    )
  );
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
  async function fetchRestaurants(latitude: number, longitude: number, searchRadius: number = radius): Promise<Restaurant[]> {
    const API_KEY = "AIzaSyAGR1fMiA0HwSF5h5zlv6oyL2JpoegvYuM";
    const URL = "https://places.googleapis.com/v1/places:searchNearby";
    const payload = {
      includedTypes: ["restaurant"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude, longitude },
          radius: searchRadius,
        },
      },
    };
    const headers = {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": API_KEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.types",
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
  const handleDiceRoll = (cuisine: string) => {
    setHighlightedCuisine(cuisine);
  };

  // Add this function to check if a restaurant matches the highlighted cuisine
  const isRestaurantHighlighted = (restaurant: Restaurant) => {
    if (!highlightedCuisine) return false;
    
    // Convert both the highlighted cuisine and restaurant types to lowercase for comparison
    const normalizedHighlightedCuisine = highlightedCuisine.toLowerCase();
    
    return restaurant.types?.some(type => {
      // Only check restaurant types
      if (!type.includes('restaurant')) return false;
      
      // Normalize the type by removing '_restaurant' and converting to lowercase
      const normalizedType = type.replace('_restaurant', '').toLowerCase();
      
      // Check if the normalized type matches the highlighted cuisine
      return normalizedType === normalizedHighlightedCuisine;
    }) ?? false;
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

            {/* Restore cuisine filtering for map markers */}
            {filterRestaurantsByCuisine(restaurants, selectedCusine).map((restaurant, index) => {
              const isHovered = hoveredMarkerIndex === index;
              const isHighlighted = isRestaurantHighlighted(restaurant);
              const iconUrl = getCuisineIcon(restaurant.types) || "/images/default.png";

              return (
                <Marker
                  key={index}
                  position={{
                    lat: restaurant.location.latitude,
                    lng: restaurant.location.longitude,
                  }}
                  icon={{
                    url: iconUrl,
                    scaledSize: new window.google.maps.Size(
                      isHovered ? 50 : (isHighlighted ? 45 : 40),
                      isHovered ? 50 : (isHighlighted ? 45 : 40)
                    ),
                  }}
                  animation={isHighlighted ? google.maps.Animation.BOUNCE : undefined}
                  onMouseOver={() => setHoveredMarkerIndex(index)}
                  onMouseOut={() => setHoveredMarkerIndex(null)}
                  onClick={() => setSelectedMarkerIndex(index)}
                />
              );
            })}

          {selectedMarkerIndex !== null && restaurants[selectedMarkerIndex] && (
          <InfoWindow
          position={{
            lat: restaurants[selectedMarkerIndex].location.latitude,
            lng: restaurants[selectedMarkerIndex].location.longitude,
          }}
          onCloseClick={() => setSelectedMarkerIndex(null)}
        >
          <div style={{ maxWidth: "200px" }}>
            <h3 style={{ margin: "0" }}>{restaurants[selectedMarkerIndex].displayName?.text || "N/A"}</h3>
            <p style={{ margin: "0" }}>{restaurants[selectedMarkerIndex].formattedAddress || "N/A"}</p>
            <p style={{ margin: "0" }}>Rating: {restaurants[selectedMarkerIndex].rating ?? "N/A"}</p>
            <p style={{ margin: "0" }}>
              Cuisine:{" "}
              {restaurants[selectedMarkerIndex].types
                ?.filter((type) => type.includes("restaurant"))
                .map(normalizeCuisineType)
                .join(", ") || "N/A"}
            </p>
            <button
              onClick={() => saveRestaurant(restaurants[selectedMarkerIndex])}
              style={{
                marginTop: "8px",
                padding: "6px 12px",
                backgroundColor: "#6200ea",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Save
            </button>
          </div>
        </InfoWindow>
        
        )}
          </GoogleMap>
        )}

        <Box
          sx={{
            position: "absolute",
            top: "70px",
            left: "20px",
            bgcolor: "white",
            p: 1,
            borderRadius: 2,
            boxShadow: 3,
            zIndex: 1500,
            width: "300px",
          }}
        >
          <form onSubmit={handleSearchSubmit}>
            <Autocomplete
              onLoad={onLoadAutocomplete}
              onPlaceChanged={onPlaceChanged}
            >
              <TextField
                size="small"
                label="Search location"
                variant="outlined"
                fullWidth
                placeholder="Type a location"
                value={searchValue}
                onChange={handleSearchInputChange}
              />
            </Autocomplete>
          </form>
          {searchSaved && (
            <div className="mt-1 text-xs text-green-600">Search saved!</div>
          )}
        </Box>

        <div>
        <Box
            sx={{
              position: "absolute",
              top: "140px", 
              left: "20px",
              bgcolor: "white",
              p: 1,
              borderRadius: 2,
              boxShadow: 3,
              zIndex: 300,
              width: "200px",
            }}
          >
            <TextField
              select
              fullWidth
              label="Filter by Cuisine"
              size="small"
              value={selectedCusine}
              onChange={(e) => setSelectedCusine(e.target.value)}
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto',
                    },
                  },
                },
              }}
            >
              <MenuItem value="All">All</MenuItem>
              {availableCuisines.map((cuisine) => (
                <MenuItem key={cuisine} value={cuisine}>
                  {cuisine}
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </div>
        {userLocation && (
          <>

            {isMapLoading && (
              <div className="absolute top-4 right-4 flex items-center bg-white p-3 rounded-lg shadow-md z-[1001]">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500 mr-2"></div>
                <span className="text-sm font-medium">Updating restaurants...</span>
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
          {highlightedCuisine && (
            <button
              className="bg-[#F4E1D2] hover:bg-[#EED3BB] text-[#C47B4D] py-2 px-4 rounded shadow transition-colors"
              onClick={() => setHighlightedCuisine(null)}
            >
              Clear Highlight
            </button>
          )}
        </div>
        {isSidebarOpen && (
          <div className="absolute top-0 right-0 w-[300px] h-[calc(100vh-60px)] bg-white overflow-y-auto z-[999] p-5 shadow-md">
            <div className="mb-4">
              <h6 className="text-lg font-medium">
                Showing restaurants within {formatRadius(radius)}
              </h6>
              {highlightedCuisine && (
                <p className="text-sm text-[#C47B4D] font-medium">
                  Highlighting {highlightedCuisine} restaurants
                </p>
              )}
            </div>
            {sortedRestaurants.length > 0 ? (
              sortedRestaurants.map((restaurant, index) => (
                <div 
                  key={index} 
                  className={`mb-5 p-3 rounded-lg shadow-sm transition-all duration-300 ${
                    isRestaurantHighlighted(restaurant) 
                      ? 'bg-[#F4E1D2] border-2 border-[#C47B4D]' 
                      : 'bg-gray-50'
                  }`}
                >
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
          onClose={() => {
            setIsDicePopupOpen(false);
          }}
          availableCuisines={availableCuisines}
          onRoll={handleDiceRoll}
        />
      </div>
    </LoadScript>
  );
};






