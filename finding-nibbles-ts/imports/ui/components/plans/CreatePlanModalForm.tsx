import React, { useState } from "react";
import { Meteor } from "meteor/meteor";

interface Restaurant {
    displayName?: { text: string };
    [key: string]: any;
}

interface CreatePlanModalFormProps {
    setIsCreatingPlan: (val: boolean) => void;
    selectedRestaurant: Restaurant | null;
}

export const CreatePlanModalForm: React.FC<CreatePlanModalFormProps> = ({
    setIsCreatingPlan,
    selectedRestaurant,
}) => {
    const [planTitle, setPlanTitle] = useState("");

    const handleCreatePlanAndAddRestaurant = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!planTitle.trim()) return;

        try {
            // Insert the new plan and get its ID
            const planId = await Meteor.callAsync('plans.insert', planTitle.trim());

            // If a restaurant is selected, add it to the new plan
            if (selectedRestaurant && planId) {
                await Meteor.callAsync('plans.addRestaurant', planId, selectedRestaurant);
            }

            setIsCreatingPlan(false);
        } catch (err: any) {
            alert(err.reason || err.message || err);
        }
    };

    return (
        <form onSubmit={handleCreatePlanAndAddRestaurant} style={{ width: "100%" }}>
            <input
                autoFocus
                type="text"
                value={planTitle}
                onChange={e => setPlanTitle(e.target.value)}
                placeholder="Enter plan title"
                style={{
                    width: "100%",
                    padding: "8px",
                    marginBottom: "12px",
                    borderRadius: "4px",
                    border: "1px solid #ccc"
                }}
            />
            <div style={{ display: "flex", gap: 8 }}>
                <button
                    type="submit"
                    style={{
                        backgroundColor: "#C47B4D",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "8px 16px",
                        cursor: "pointer"
                    }}
                >
                    Create + Add
                </button>
                <button
                    type="button"
                    onClick={() => setIsCreatingPlan(false)}
                    style={{
                        backgroundColor: "#aaa",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        padding: "8px 16px",
                        cursor: "pointer"
                    }}
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};