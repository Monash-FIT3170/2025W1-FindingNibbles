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
  image?: string; // base64 image string
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

  useEffect(() => {
    // Step 1: Build initial structure immediately
    const initialCities: CityDishes[] = Object.keys(dishesData).map((city) => ({
      city,
      dishes: dishesData[city].map((dishName) => ({ name: dishName }))
    }));

    setCityDishes(initialCities);

    // Step 2: Fetch images asynchronously
    const fetchImages = async () => {
      for (let cityIndex = 0; cityIndex < initialCities.length; cityIndex++) {
        const cityObj = initialCities[cityIndex];

        for (
          let dishIndex = 0;
          dishIndex < cityObj.dishes.length;
          dishIndex++
        ) {
          const dish = cityObj.dishes[dishIndex];

          try {
            const response = await fetch(
              "https://router.huggingface.co/together/v1/images/generations",
              {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${Meteor.settings.public?.HuggingFaceAccessToken}`,
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  prompt: `A high quality photo of ${dish.name}, famous dish from ${cityObj.city}`,
                  response_format: "base64",
                  model: "black-forest-labs/FLUX.1-dev"
                })
              }
            );

            const result = await response.json();
            console.log("Full API result:", result);

            // Update the specific dish image in state
            setCityDishes((prev) => {
              const newState = [...prev];
              newState[cityIndex].dishes[dishIndex].image =
                "data:image/png;base64,${base64Image}";
              return newState;
            });
          } catch (err) {
            console.error(`Error generating image for ${dish.name}:`, err);
          }
        }
      }
    };

    fetchImages();
  }, []);

  // Saved Restaurants useEffect
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
                    {dish.image ? (
                      <img
                        src={`data:image/png;base64,${dish.image}`}
                        alt={dish.name}
                        style={{
                          width: "150px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px"
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "150px",
                          height: "150px",
                          backgroundColor: "#eee",
                          borderRadius: "8px",
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center"
                        }}
                      >
                        Loading...
                      </div>
                    )}
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
