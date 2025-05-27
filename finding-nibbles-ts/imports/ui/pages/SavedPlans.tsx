import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Plans } from "../api/Plans";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Meteor } from "meteor/meteor";
import { Link as RouterLink } from "react-router-dom";

export const SavedPlans = () => {
  const plans = useTracker(() => {
    Meteor.subscribe("plans");
    return Plans.find({}).fetch();
  }, []);

  // Helper to get restaurant name
  const getRestaurantName = (r: any) =>
    r?.displayName?.text || r?.name || "Unnamed Restaurant";

    const handleDelete = (planId: string) => {
    if (window.confirm("Are you sure you want to delete this plan?")) {
      Meteor.call("plans.remove", planId, (err: any) => {
        if (err) {
          alert("Failed to delete plan: " + err.reason);
        }
      });
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "40px auto", background: "#fff", borderRadius: 16, padding: 32, minHeight: 500 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h2 style={{ fontFamily: "Comic Sans MS, cursive, sans-serif", color: "#c17030", fontSize: 32, margin: 0 }}>
          Saved Plans
        </h2>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          style={{
            background: "#c17030",
            color: "#fff",
            fontWeight: "bold",
            borderRadius: 8,
            fontFamily: "Comic Sans MS, cursive, sans-serif",
            fontSize: 18,
            padding: "8px 24px"
          }}
        >
          Create New Plan
        </Button>
      </div>
      <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
        <thead>
          <tr style={{ background: "#f5e6dc" }}>
            <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Plan Name</th>
            <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Starting Point</th>
            <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Destination</th>
            <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Destinations</th>
            <th style={{ textAlign: "center", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}></th>
          </tr>
        </thead>
        <tbody>
          {plans.length === 0 && (
            <tr>
              <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#c17030", fontSize: 18 }}>
                No plans saved yet.
              </td>
            </tr>
          )}
          {plans.map((plan) => {
            const first = plan.restaurants?.[0];
            const last = plan.restaurants?.[plan.restaurants.length - 1];
            return (
              <tr key={plan._id} style={{ borderBottom: "1px solid #eee" }}>
                <td style={{ padding: "16px 12px", fontSize: 18, fontFamily: "Comic Sans MS, cursive, sans-serif" }}>
                  {plan.title}
                </td>
                <td style={{ padding: "16px 12px", fontSize: 16 }}>
                  {first ? getRestaurantName(first) : <span style={{ color: "#aaa" }}>N/A</span>}
                </td>
                <td style={{ padding: "16px 12px", fontSize: 16 }}>
                  {last ? getRestaurantName(last) : <span style={{ color: "#aaa" }}>N/A</span>}
                </td>
                <td style={{ padding: "16px 12px", fontSize: 16 }}>
                  {plan.restaurants && plan.restaurants.length > 0 ? (
                    <ul style={{ margin: 0, paddingLeft: 20 }}>
                      {plan.restaurants.map((r, idx) => (
                        <li key={idx} style={{ marginBottom: 4 }}>
                          {getRestaurantName(r)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span style={{ color: "#aaa" }}>No destinations</span>
                  )}
                </td>
                <td style={{ textAlign: "center", padding: "16px 12px", whiteSpace: "nowrap" }}>
                  <Button
                    component={RouterLink}
                    to={`/plans/${plan._id}`}
                    variant="outlined"
                    style={{
                      borderColor: "#c17030",
                      color: "#c17030",
                      fontWeight: "bold",
                      borderRadius: 8,
                      fontFamily: "Comic Sans MS, cursive, sans-serif",
                      minWidth: 0,
                      padding: "6px 10px",
                      marginRight: 8
                    }}
                  >
                    <VisibilityIcon />
                  </Button>
                  <Button
                    variant="outlined"
                    style={{
                      borderColor: "#c17030",
                      color: "#c17030",
                      fontWeight: "bold",
                      borderRadius: 8,
                      fontFamily: "Comic Sans MS, cursive, sans-serif",
                      minWidth: 0,
                      padding: "6px 10px"
                    }}
                    onClick={() => handleDelete(plan._id)}
                  >
                    <DeleteIcon />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};