import { useTracker } from "meteor/react-meteor-data";
import { SavedRestaurantsCollection, SavedRestaurant } from "../types/SavedRestaurants";
import { Meteor } from "meteor/meteor";

export const SavedRestaurants = () => {
  // Subscribe and fetch saved restaurants for the current user
  const savedRestaurants = useTracker(() => {
    const handler = Meteor.subscribe("savedRestaurants.user");
    if (!handler.ready()) {
      return [];
    }
    const userId = Meteor.userId();
    if (!userId) return [];
    return SavedRestaurantsCollection.find({ userId }).fetch();
  }, []);

  const handleRemove = (restaurantId: string) => {
    Meteor.call("savedRestaurants.remove", restaurantId, (error: Meteor.Error | null) => {
      if (error) {
        alert("Failed to remove restaurant: " + error.message);
      }
    });
  };

  if (!Meteor.userId()) {
    return <p>Please log in to see your saved restaurants.</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Your Saved Restaurants</h2>
      {savedRestaurants.length === 0 && <p>No saved restaurants yet.</p>}
      <ul style={{ listStyle: "none", padding: 0 }}>
        {savedRestaurants.map((restaurant: SavedRestaurant) => (
          <li
            key={restaurant._id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "0.5rem",
              padding: "0.3rem 0.5rem",
              borderBottom: "1px solid #ccc",
            }}
          >
            <span>{restaurant.name}</span>
            <button
              onClick={() => restaurant._id && handleRemove(restaurant._id)}
              style={{
                background: "transparent",
                border: "none",
                color: "red",
                fontWeight: "bold",
                fontSize: "1.2rem",
                cursor: "pointer",
                lineHeight: 1,
              }}
              aria-label={`Remove ${restaurant.name}`}
              title={`Remove ${restaurant.name}`}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};
