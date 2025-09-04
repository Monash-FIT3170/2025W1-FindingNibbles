import React from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Plans } from "../../api/Plans";
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
    <div className="flex min-h-screen pt-20 bg-[#fdfaf7]">
      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pb-12">
       <div className="bg-white border border-[#e2cfc3] rounded-2xl shadow-md p-6 sm:p-8">
         <div className="flex items-center justify-between mb-8">
           <div>
             <h2 className="text-3xl font-bold text-[#4b2e19] mb-1">Saved Plans</h2>
             <p className="text-sm text-[#7a5c43]">Create, review, and manage your travel food plans</p>
           </div>
           <Button
             variant="contained"
             startIcon={<AddIcon />}
             className="!bg-[#b87b45] hover:!bg-[#a36e3d] !text-white !font-semibold !rounded-xl !px-5 !py-2"
             onClick={handleCreateNewPlan}
           >
             Create New Plan
           </Button>
         </div>
         <div className="overflow-x-auto">
           <PlanTable plans={plans} />
         </div>
       </div>
     </div>
    </div>
  );
};