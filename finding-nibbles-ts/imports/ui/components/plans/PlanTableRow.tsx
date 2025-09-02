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
                    alert("Failed to delete plan: "  err.reason);
                }
            });
        }
    };

    return (
      <tr className="border-b">
        <td className="p-3 sm:p-4 text-base font-medium text-[#4b2e19]">
          {plan.title}
        </td>
        <td className="p-3 sm:p-4">
          {first ? getRestaurantName(first) : <span className="text-[#9ca3af]">N/A</span>}
        </td>
        <td className="p-3 sm:p-4">
          {last ? getRestaurantName(last) : <span className="text-[#9ca3af]">N/A</span>}
        </td>
        <td className="p-3 sm:p-4">{plan.restaurants?.length ?? 0}</td>
        <td className="p-3 sm:p-4 text-center whitespace-nowrap">
          <Button
            component={RouterLink}
            to={`/travel-plans/${plan._id}`}
            variant="outlined"
            className="!border-[#c17030] !text-[#c17030] !rounded-lg !min-w-0 !px-2 !py-1 !mr-2"
            title="View"
          >
            <VisibilityIcon fontSize="small" />
          </Button>
          <Button
            variant="outlined"
            className="!border-[#c17030] !text-[#c17030] !rounded-lg !min-w-0 !px-2 !py-1"
            onClick={() => handleDelete(plan._id)}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </Button>
        </td>
      </tr>
    );
};