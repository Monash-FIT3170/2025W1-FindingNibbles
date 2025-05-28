import React from "react";
import { PlanTableRow } from "./PlanTableRow";

export const PlanTable = ({ plans }: { plans: any[] }) => (
  <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: 0 }}>
    <thead>
      <tr style={{ background: "#f5e6dc" }}>
        <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Plan Name</th>
        <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Starting Point</th>
        <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}>Destination</th>
        <th style={{ textAlign: "left", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}># of Restaurants</th>
        <th style={{ textAlign: "center", padding: "16px 12px", fontSize: 20, color: "#c17030", fontFamily: "Comic Sans MS, cursive, sans-serif" }}></th>
      </tr>
    </thead>
    <tbody>
      {plans.length === 0 ? (
        <tr>
          <td colSpan={5} style={{ textAlign: "center", padding: 32, color: "#c17030", fontSize: 18 }}>
            No plans saved yet.
          </td>
        </tr>
      ) : (
        plans.map(plan => <PlanTableRow key={plan._id} plan={plan} />)
      )}
    </tbody>
  </table>
);