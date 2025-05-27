import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Plans } from "../api/Plans";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { Meteor } from "meteor/meteor";
import { TextField, Button, IconButton, Select, MenuItem , FormControl, InputLabel } from "@mui/material";


export const PlanDetails = () => {
  const { planId } = useParams();

  // Subscribe to plans
  const isReady = useTracker(() => {
    const handle = Meteor.subscribe("plans");
    return handle.ready();
  }, []);

    // Only fetch the plan when the subscription is ready
  const plan = useTracker(() => {
    if (!isReady) return null;
    return Plans.findOne(planId);
  }, [isReady, planId]);

  // State for edit mode and fields
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(plan?.title || "");
  const [restaurants, setRestaurants] = useState(plan?.restaurants || []);
  const [startIdx, setStartIdx] = useState(0);
  const [endIdx, setEndIdx] = useState(restaurants.length > 0 ? restaurants.length - 1 : 0);
  const [middleOrder, setMiddleOrder] = useState<number[]>([]);

  // Update local state when plan changes (on first load)
  // React.useEffect(() => {
  //   if (plan) {
  //     setTitle(plan.title);
  //     setRestaurants(plan.restaurants);
  //     setStartIdx(0);
  //     setEndIdx(plan.restaurants.length > 0 ? plan.restaurants.length - 1 : 0);
  //   }
  // }, [plan]);
  React.useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setRestaurants(plan.restaurants);
      setStartIdx(0);
      setEndIdx(plan.restaurants.length - 1);
      const middle = plan.restaurants
        .map((_, idx) => idx)
        .filter(idx => idx !== 0 && idx !== plan.restaurants.length - 1);
      setMiddleOrder(middle);
    }
  }, [plan]);


  if (!isReady) return <div>Loading...</div>;
  if (!plan) return <div>Plan not found.</div>;

  const first = restaurants[startIdx];
  const last = restaurants[endIdx]

    // Save handler (implement Meteor method as needed)
const handleSave = () => {
  // if (!planId) return;

  // // Get the selected start and end restaurants
  // const start = restaurants[startIdx];
  // const end = restaurants[endIdx];

  // // Get the middle restaurants (excluding start and end)
  // const middle = restaurants.filter(
  //   (r, idx) => idx !== startIdx && idx !== endIdx
  // );

  // // Build the new order: start, ...middle, end
  // let reordered;
  // if (startIdx === endIdx) {
  //   reordered = [start];
  // } else {
  //   reordered = [start, ...middle, end];
  // }

  // Meteor.call("plans.updatePlan", planId, title, reordered, (err) => {
  //   if (err) {
  //     alert("Failed to save: " + err.reason);
  //   } else {
  //     setIsEditing(false);
  //   }
  // });
    const reordered = [
      restaurants[startIdx],
      ...middleOrder.map(idx => restaurants[idx]),
      ...(startIdx !== endIdx ? [restaurants[endIdx]] : [])
    ];

    Meteor.call("plans.updatePlan", planId, title, reordered, (err) => {
      if (err) alert("Failed to save: " + err.reason);
      else setIsEditing(false);
    });
};

  // Cancel handler
  const handleCancel = () => {
    setTitle(plan.title);
    setRestaurants(plan.restaurants);
    setIsEditing(false);
  };


const moveMiddleUp = (indexInOrder: number) => {
  if (indexInOrder === 0) return;
  setMiddleOrder(prev => {
    const newOrder = [...prev];
    [newOrder[indexInOrder - 1], newOrder[indexInOrder]] = [newOrder[indexInOrder], newOrder[indexInOrder - 1]];
    return newOrder;
  });
};

const moveMiddleDown = (indexInOrder: number) => {
  setMiddleOrder(prev => {
    if (indexInOrder === prev.length - 1) return prev;
    const newOrder = [...prev];
    [newOrder[indexInOrder], newOrder[indexInOrder + 1]] = [newOrder[indexInOrder + 1], newOrder[indexInOrder]];
    return newOrder;
  });
};


  return (
    <div
    style={{
    maxWidth: 600,
    margin: "40px auto",
    // background: isEditing ? "#fffbe6" : "#fff",
    background: "#fff",
    borderRadius: 16,
    padding: 32,
    border: isEditing ? "2px solid #c17030" : "none",
    transition: "background 0.2s, border 0.2s"
    }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 style={{ fontFamily: "Comic Sans MS, cursive, sans-serif", color: "#c17030" }}>
          {isEditing ? "Editing" : "Plan Details"}
          </h2>
        {isEditing ? (
          <span>
            <IconButton onClick={handleSave} color="primary">
              <SaveIcon />
            </IconButton>
            <IconButton onClick={handleCancel} color="error">
              <CloseIcon />
            </IconButton>
          </span>
        ) : (
        <IconButton onClick={() => setIsEditing(true)}>
          <EditIcon />
        </IconButton>
        )}
      </div>
      <form>
        <div style={{ display: "flex", flexDirection: "column", gap: 24}}>
          <TextField
            label="Plan Name"
            value={title}
            onChange={e => setTitle(e.target.value)}
            fullWidth
            InputProps={{ readOnly: !isEditing }}
            style={{ margin: 0 }} // to override default margin settings
          />
          <FormControl fullWidth style={{ margin: 0 }}>
            <InputLabel id="start-label">Starting Point</InputLabel>
            <Select
              label="Starting Point"
              value={startIdx}
              onChange={e => setStartIdx(Number(e.target.value))}
              fullWidth
              disabled={!isEditing}
            >
              {restaurants.map((r, idx) => (
                <MenuItem key={idx} value={idx}>
                  {r?.displayName?.text || r?.name || "Unnamed Restaurant"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth style={{ margin: 0 }}>
            <InputLabel id="end-label">Destination</InputLabel>
            <Select
              label="Destination"
              value={endIdx}
              onChange={e => setEndIdx(Number(e.target.value))}
              fullWidth
              disabled={!isEditing}
            >
              {restaurants.map((r, idx) => (
                <MenuItem key={idx} value={idx}>
                  {r.displayName?.text || r.name || "Unnamed Restaurant"}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <div>
            <div style={{ fontWeight: "bold", marginBottom: 4 }}>Restaurants</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {/* Start */}
              <div>{restaurants[startIdx]?.name} (Start)</div>

              {/* Middle */}
              {middleOrder.map((idx, i) => {
                const r = restaurants[idx];
                return (
                  <div key={`${i}-${idx}`} style={{ display: "flex", alignItems: "center", gap: 8, padding: 8, background: "#f7f7f7", borderRadius: 6 }}>
                    <span style={{ flex: 1 }}>
                      {r?.displayName?.text || r?.name || "Unnamed Restaurant"}
                    </span>
                    {isEditing && (
                      <>
                        <Button size="small" onClick={() => moveMiddleUp(i)} disabled={i === 0}>↑</Button>
                        <Button size="small" onClick={() => moveMiddleDown(i)} disabled={i === middleOrder.length - 1}>↓</Button>
                      </>
                    )}
                  </div>
                );
              })}

              {/* End */}
              {startIdx !== endIdx && (
                <div>{restaurants[endIdx]?.name} (End)</div>
              )}

            </div>
          </div>

        </div>
      </form>
    </div>
  );
};