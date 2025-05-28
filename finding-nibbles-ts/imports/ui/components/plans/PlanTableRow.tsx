import React from "react";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { Link as RouterLink } from "react-router-dom";
import { Meteor } from "meteor/meteor";

const getRestaurantName = (r: any) =>
    r?.displayName?.text || r?.name || "Unnamed Restaurant";

export const PlanTableRow = ({ plan }: { plan: any }) => { 
    const first = plan.restaurants?.[0];
    const last = plan.restaurants?.[plan.restaurants.length - 1];

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
        <tr style={{ borderBottom: "1px solid #eee" }}>
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
                {plan.restaurants?.length ?? 0}
            </td>
            <td style={{ textAlign: "center", padding: "16px 12px", whiteSpace: "nowrap" }}>
                <Button
                    component={RouterLink}
                    to={`/travel-plans/${plan._id}`}
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
};