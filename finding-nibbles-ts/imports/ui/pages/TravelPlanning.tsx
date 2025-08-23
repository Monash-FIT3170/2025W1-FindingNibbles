// imports/ui/TravelPlanning.tsx
import React, { useEffect, useState } from "react";
import dishesDataJson from "../../data/famous_dishes_by_city.json";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { DishesJSON } from "../api/dishtypes"; // interface { [city: string]: string[] }
import {
  SavedRestaurantsCollection,
  ISavedRestaurant
} from "../api/SavedRestaurants";

interface Dish {
  name: string;
  image?: string; // path to local image
  imageLoaded?: boolean; // track if image exists
}

interface CityDishes {
  city: string;
  dishes: Dish[];
}

export const TravelPlanning = () => {
  const [cityDishes, setCityDishes] = useState<CityDishes[]>([]);
  const [restaurants, setRestaurants] = useState<ISavedRestaurant[]>([]);
  const [restaurantsLoading, setRestaurantsLoading] = useState(true);

  const dishesData: DishesJSON = dishesDataJson;

  // Helper function to convert dish name to filename format
  const dishNameToFilename = (dishName: string): string => {
    return dishName
      .replace(/[^a-zA-Z0-9\s\-_]/g, "") // Remove special characters except spaces, hyphens, underscores
      .replace(/\s+/g, "_") // Replace spaces with underscores
      .replace(/[()]/g, ""); // Remove parentheses
  };

  // Helper function to get image path
  const getImagePath = (cityName: string, dishName: string): string => {
    const filename = dishNameToFilename(dishName);
    return `/images/dishes/${cityName}/${filename}.png`;
  };

  // Function to check if image exists
  const checkImageExists = async (imagePath: string): Promise<boolean> => {
    try {
      const response = await fetch(imagePath, { method: "HEAD" });
      return response.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    // Step 1: Build initial structure with image paths
    const initialCities: CityDishes[] = Object.keys(dishesData).map((city) => ({
      city,
      dishes: dishesData[city].map((dishName) => ({
        name: dishName,
        image: getImagePath(city, dishName),
        imageLoaded: false
      }))
    }));

    setCityDishes(initialCities);

    // Step 2: Check which images exist asynchronously
    const checkImages = async () => {
      for (let cityIndex = 0; cityIndex < initialCities.length; cityIndex++) {
        const cityObj = initialCities[cityIndex];

        for (
          let dishIndex = 0;
          dishIndex < cityObj.dishes.length;
          dishIndex++
        ) {
          const dish = cityObj.dishes[dishIndex];

          if (dish.image) {
            const imageExists = await checkImageExists(dish.image);

            // Update the specific dish image loaded status in state
            setCityDishes((prev) => {
              const newState = [...prev];
              newState[cityIndex].dishes[dishIndex].imageLoaded = imageExists;
              if (!imageExists) {
                // If image doesn't exist, clear the image path
                newState[cityIndex].dishes[dishIndex].image = undefined;
              }
              return newState;
            });
          }

          // Small delay to avoid overwhelming the server with requests
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    };

    checkImages();
  }, []);

  // Saved Restaurants useEffect (unchanged)
  useEffect(() => {
    let subscription: Meteor.SubscriptionHandle | null = null;

    const computation = Tracker.autorun(() => {
      if (Meteor.loggingIn()) {
        setRestaurantsLoading(true);
        return;
      }

      const user = Meteor.user();

      if (!user) {
        setRestaurants([]);
        setRestaurantsLoading(false);
        return;
      }

      setRestaurantsLoading(true);

      if (subscription) {
        subscription.stop();
      }

      subscription = Meteor.subscribe("savedRestaurants");

      const dataComputation = Tracker.autorun(() => {
        if (subscription?.ready()) {
          const saved = SavedRestaurantsCollection.find(
            {},
            { sort: { createdAt: -1 } }
          ).fetch();
          setRestaurants(saved);
          setRestaurantsLoading(false);
        }
      });

      return () => dataComputation.stop();
    });

    return () => {
      computation.stop();
      if (subscription) {
        subscription.stop();
      }
    };
  }, []);

  const handleRemove = (placeId: string) => {
    Meteor.call("savedRestaurants.remove", placeId, (error: any) => {
      if (error) {
        alert(`Failed to remove: ${error.reason || error.message || error}`);
      }
    });
  };

  return (
    <div
      style={{
        backgroundColor: "#f5deb3", // Peach background color
        minHeight: "100vh",
        padding: "1rem",
        paddingTop: "80px", // Add top padding to account for navbar
        width: "100%",
        boxSizing: "border-box"
      }}
    >
      {/* Famous for Food Places Section */}
      <div style={{ marginBottom: "3rem" }}>
        {/* Heading - Fixed styling */}
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
            marginBottom: "1.5rem",
            marginTop: "0", // Remove default top margin
            display: "block", // Ensure it's displayed as block
            width: "100%"
          }}
        >
          Famous for Food Places
        </h2>

        {/* Horizontal scroll container */}
        <div
          className="travel-planning-container"
          style={{
            display: "flex",
            overflowX: "auto",
            overflowY: "visible", // ensure vertical content is visible
            whiteSpace: "nowrap",
            paddingBottom: "1rem",
            marginBottom: "2rem",
            width: "100%"
          }}
        >
          {cityDishes.map((cityObj) => (
            <div
              key={cityObj.city}
              style={{
                display: "inline-block",
                width: "300px",
                marginRight: "1rem",
                verticalAlign: "top",
                border: "1px solid #ccc",
                borderRadius: "8px",
                padding: "0.5rem",
                flexShrink: 0, // Prevent shrinking in flex container
                backgroundColor: "white"
              }}
            >
              <h3
                style={{
                  textAlign: "center",
                  marginTop: "0",
                  marginBottom: "1rem"
                }}
              >
                {cityObj.city}
              </h3>
              <div
                style={{
                  display: "flex",
                  overflowX: "auto",
                  scrollBehavior: "smooth"
                }}
              >
                {cityObj.dishes.map((dish, idx) => (
                  <div
                    key={idx}
                    style={{
                      minWidth: "150px",
                      marginRight: "0.5rem",
                      textAlign: "center",
                      flexShrink: 0
                    }}
                  >
                    {dish.image && dish.imageLoaded !== false ? (
                      <img
                        src={dish.image}
                        alt={dish.name}
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                        onError={(e) => {
                          // Handle image load error by showing placeholder
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          const placeholder =
                            target.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}

                    {/* Placeholder div - shown when image doesn't exist or is loading */}
                    <div
                      style={{
                        width: "150px",
                        height: "150px",
                        backgroundColor: "#eee",
                        borderRadius: "8px",
                        display:
                          dish.image && dish.imageLoaded !== false
                            ? "none"
                            : "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        flexDirection: "column",
                        color: "#666",
                        fontSize: "0.8rem",
                        textAlign: "center",
                        padding: "0.5rem",
                        boxSizing: "border-box"
                      }}
                    >
                      {dish.imageLoaded === false ? (
                        <>
                          <div style={{ marginBottom: "0.5rem" }}>📷</div>
                          <div>No image</div>
                          <div>available</div>
                        </>
                      ) : (
                        "Checking..."
                      )}
                    </div>

                    <p
                      style={{
                        marginTop: "0.5rem",
                        fontSize: "0.9rem"
                      }}
                    >
                      {dish.name}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Your Saved Restaurants Section */}
      <div style={{ marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
            marginBottom: "1.5rem",
            marginTop: "0",
            display: "block",
            width: "100%"
          }}
        >
          Your Saved Restaurants
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%"
          }}
        >
          {restaurantsLoading ? (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                padding: "2rem"
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "32px",
                  border: "3px solid #f3f3f3",
                  borderTop: "3px solid #b87b45",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}
              />
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                width: "100%",
                maxWidth: "600px"
              }}
            >
              {restaurants.length > 0 ? (
                restaurants.map((restaurant) => (
                  <div
                    key={restaurant._id}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      border: "2px solid #b87b45",
                      borderRadius: "12px",
                      padding: "1rem",
                      backgroundColor: "white",
                      boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem"
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.125rem",
                          fontWeight: "600",
                          margin: "0"
                        }}
                      >
                        {restaurant.name}
                      </h3>
                      <button
                        onClick={() => handleRemove(restaurant.placeId)}
                        style={{
                          color: "black",
                          fontWeight: "bold",
                          fontSize: "1.5rem",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "0",
                          lineHeight: "1"
                        }}
                        onMouseOver={(e) => (e.target.style.color = "#b87b45")}
                        onMouseOut={(e) => (e.target.style.color = "black")}
                      >
                        ×
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#374151",
                        margin: "0 0 0.25rem 0"
                      }}
                    >
                      {restaurant.location}
                    </p>
                    {restaurant.rating !== undefined &&
                      restaurant.rating !== null && (
                        <p
                          style={{
                            fontSize: "0.875rem",
                            color: "#374151",
                            margin: "0 0 0.25rem 0"
                          }}
                        >
                          Rating: {restaurant.rating}
                        </p>
                      )}
                    {restaurant.cuisine && restaurant.cuisine.length > 0 && (
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#374151",
                          margin: "0"
                        }}
                      >
                        Cuisine: {restaurant.cuisine.join(", ")}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p
                  style={{
                    textAlign: "center",
                    color: "#6B7280",
                    fontSize: "1rem",
                    fontStyle: "italic"
                  }}
                >
                  No saved restaurants found
                </p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Your Dishes Wishlist Section */}
      <div style={{ marginBottom: "3rem" }}>
        <h2
          style={{
            fontSize: "2rem",
            fontWeight: "bold",
            color: "#333",
            textAlign: "center",
            marginBottom: "1.5rem",
            marginTop: "0",
            display: "block",
            width: "100%"
          }}
        >
          Your Dishes Wishlist
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            width: "100%"
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              border: "2px dashed #b87b45",
              borderRadius: "12px",
              padding: "3rem 2rem",
              textAlign: "center",
              maxWidth: "600px",
              width: "100%"
            }}
          >
            <p
              style={{
                color: "#6B7280",
                fontSize: "1.125rem",
                fontStyle: "italic",
                margin: "0"
              }}
            >
              Coming soon! This is where you'll be able to save and organize
              your favorite dishes to try.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
