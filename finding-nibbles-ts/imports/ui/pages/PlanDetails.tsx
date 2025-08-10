import React, { useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useTracker } from "meteor/react-meteor-data";
import { Plans } from "../api/Plans";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import { Meteor } from "meteor/meteor";
import { TextField, Button, IconButton } from "@mui/material";
import { LoadScript, Autocomplete } from "@react-google-maps/api";

export const PlanDetails = () => {
  const { planId } = useParams();

  const isReady = useTracker(() => {
    const handle = Meteor.subscribe("plans");
    return handle.ready();
  }, []);

  const plan = useTracker(() => {
    if (!isReady) return null;
    return Plans.findOne(planId);
  }, [isReady, planId]);

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(plan?.title || "");
  const [restaurants, setRestaurants] = useState(plan?.restaurants || []);
  const [startSearchValue, setStartSearchValue] = useState(plan?.startingPoint || "");
  const [destSearchValue, setDestSearchValue] = useState(plan?.destination || "");
  const [tripStartDate, setTripStartDate] = useState<string>(
    plan?.tripStartDate ? new Date(plan.tripStartDate).toISOString().split("T")[0] : ""
  );
  const startAutocompleteRef = useRef<any>(null);
  const destAutocompleteRef = useRef<any>(null);

  React.useEffect(() => {
    if (plan) {
      setTitle(plan.title);
      setRestaurants(plan.restaurants);
      setStartSearchValue(plan.startingPoint || "");
      setDestSearchValue(plan.destination || "");
      setTripStartDate(plan.tripStartDate ? new Date(plan.tripStartDate).toISOString().split("T")[0] : "");
    }
  }, [plan]);

  if (!isReady) return <div>Loading...</div>;
  if (!plan) return <div>Plan not found.</div>;

  const handleSave = () => {
    Meteor.call(
      "plans.updatePlan",
      planId,
      title,
      restaurants,
      startSearchValue,
      destSearchValue,
      tripStartDate ? new Date(tripStartDate) : undefined,
      (err: any) => {
        if (err) alert("Failed to save: " + err.reason);
        else setIsEditing(false);
      }
    );
  };

  const handleCancel = () => {
    setTitle(plan.title);
    setRestaurants(plan.restaurants);
    setStartSearchValue(plan.startingPoint || "");
    setDestSearchValue(plan.destination || "");
    setTripStartDate(plan.tripStartDate ? new Date(plan.tripStartDate).toISOString().split("T")[0] : "");
    setIsEditing(false);
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setRestaurants(prev => {
      const newArr = [...prev];
      [newArr[idx - 1], newArr[idx]] = [newArr[idx], newArr[idx - 1]];
      return newArr;
    });
  };

  const moveDown = (idx: number) => {
    if (idx === restaurants.length - 1) return;
    setRestaurants(prev => {
      const newArr = [...prev];
      [newArr[idx], newArr[idx + 1]] = [newArr[idx + 1], newArr[idx]];
      return newArr;
    });
  };

  const onLoadStartAutocomplete = (autocomplete: any) => {
    startAutocompleteRef.current = autocomplete;
  };
  const onLoadDestAutocomplete = (autocomplete: any) => {
    destAutocompleteRef.current = autocomplete;
  };

  const onPlaceChangedStart = () => {
    if (startAutocompleteRef.current) {
      const place = startAutocompleteRef.current.getPlace();
      setStartSearchValue(place.formatted_address || place.name || "");
    }
  };
  const onPlaceChangedDest = () => {
    if (destAutocompleteRef.current) {
      const place = destAutocompleteRef.current.getPlace();
      setDestSearchValue(place.formatted_address || place.name || "");
    }
  };

  return (
    <LoadScript googleMapsApiKey={import.meta.env.GooglePlacesMapsAPI} libraries={["places"]}>
      <div
        style={{
          maxWidth: 600,
          margin: "40px auto",
          background: "#fff",
          borderRadius: 16,
          padding: 32,
          border: isEditing ? "2px solid #c17030" : "none",
          transition: "background 0.2s, border 0.2s"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h2 style={{ fontFamily: "Comic Sans MS, cursive, sans-serif", color: "#c17030", paddingBottom: 15 }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <TextField
              label="Plan Name"
              value={title}
              onChange={e => setTitle(e.target.value)}
              fullWidth
              InputProps={{ readOnly: !isEditing }}
              style={{ margin: 0 }}
            />
            {/* Start Date Field */}
            <TextField
              label="Start Date"
              type="date"
              value={tripStartDate}
              onChange={e => setTripStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: !isEditing }}
              style={{ margin: 0 }}
            />
            {/* Starting Point Autocomplete */}
            <Autocomplete
              onLoad={onLoadStartAutocomplete}
              onPlaceChanged={onPlaceChangedStart}
            >
              <TextField
                size="small"
                label="Starting Point"
                variant="outlined"
                fullWidth
                placeholder="Type a location"
                value={startSearchValue}
                onChange={e => setStartSearchValue(e.target.value)}
                InputProps={{ readOnly: !isEditing }}
              />
            </Autocomplete>

            <div>
              <div style={{ fontWeight: "bold", marginBottom: 4 }}>Restaurants</div>
              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                padding: "12px 0"
              }}>
                {(restaurants == null || restaurants.length === 0) ? (
                  <div
                    style={{
                      padding: "24px 18px",
                      background: "#f7f7f7",
                      borderRadius: 10,
                      border: "1px solid #e0e0e0",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
                      color: "#888",
                      textAlign: "center",
                      fontStyle: "italic",
                      fontSize: 18
                    }}
                  >
                    No restaurants added yet.
                  </div>
                ) : (
                  restaurants.map((r, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "14px 18px",
                        background: "#f7f7f7",
                        borderRadius: 10,
                        border: "1px solid #e0e0e0",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.04)"
                      }}
                    >
                      <span style={{ flex: 1 }}>
                        {r?.displayName?.text || r?.name || "Unnamed Restaurant"}
                        {idx === 0 && " (Start)"}
                        {idx === restaurants.length - 1 && " (End)"}
                      </span>
                      {isEditing && (
                        <>
                          <Button
                            size="small"
                            onClick={() => moveUp(idx)}
                            disabled={idx === 0}
                            sx={{ minWidth: 32, fontWeight: "bold" }}
                          >
                            ↑
                          </Button>
                          <Button
                            size="small"
                            onClick={() => moveDown(idx)}
                            disabled={idx === restaurants.length - 1}
                            sx={{ minWidth: 32, fontWeight: "bold" }}
                          >
                            ↓
                          </Button>
                        </>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
            {/* Destination Autocomplete */}
            <Autocomplete
              onLoad={onLoadDestAutocomplete}
              onPlaceChanged={onPlaceChangedDest}
            >
              <TextField
                size="small"
                label="Final Destination"
                variant="outlined"
                fullWidth
                placeholder="Type a location"
                value={destSearchValue}
                onChange={e => setDestSearchValue(e.target.value)}
                InputProps={{ readOnly: !isEditing }}
              />
            </Autocomplete>
          </div>
        </form>
      </div>
    </LoadScript>
  );
};