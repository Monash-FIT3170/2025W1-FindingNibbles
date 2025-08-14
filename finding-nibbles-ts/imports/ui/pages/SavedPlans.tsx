import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Plans } from "../api/Plans";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { PlanTable } from "../components/plans/PlanTable";
import { useNavigate } from "react-router-dom";
import { Meteor } from "meteor/meteor";

export const SavedPlans = () => {
  const navigate = useNavigate();

  const plans = useTracker(() => {
    Meteor.subscribe("plans");
    return Plans.find({}).fetch();
  }, []);

  const handleCreateNewPlan = async () => {
    try {
      // @ts-ignore: Meteor.callAsync is available in Meteor >=2.7
      await Meteor.callAsync(
        "plans.insert",
        "Untitled Plan",
        "",
        "",
        undefined
      );
      // No navigation after creation
    } catch (err: any) {
      alert("Failed to create plan: " + err.reason);
    }
  };

  return (
    <div style={{ paddingTop: "5rem", minHeight: "100vh", background: "#fdfaf7" }}>
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
          onClick={handleCreateNewPlan}
        >
          Create New Plan
        </Button>
      </div>
      <PlanTable plans={plans} />
      </div>
    </div>
  );
};