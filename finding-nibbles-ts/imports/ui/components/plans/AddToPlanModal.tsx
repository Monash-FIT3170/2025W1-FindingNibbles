import React, { useState } from "react";
import { Modal, Box as MuiBox, Typography } from "@mui/material";
import { CreatePlanModalForm } from "./CreatePlanModalForm";
import { Meteor } from "meteor/meteor";

interface Restaurant {
    displayName?: { text: string };
    [key: string]: any;
}

interface Plan {
    _id?: string;
    title: string;
    restaurants: Restaurant[];
}

interface AddToPlanModalProps {
    open: boolean;
    onClose: () => void;
    userPlans: Plan[];
    selectedRestaurant: Restaurant | null;
}

export const AddToPlanModal: React.FC<AddToPlanModalProps> = ({
    open,
    onClose,
    userPlans,
    selectedRestaurant,
}) => {
    const [isCreatingPlan, setIsCreatingPlan] = useState(false);
    const [newPlanTitle, setNewPlanTitle] = useState("");
    const [addingToPlanId, setAddingToPlanId] = useState<number | null>(null);

    const handleCreatePlan = () => {
        setIsCreatingPlan(true);
        setNewPlanTitle("");
    };

    const handlePlanTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewPlanTitle(e.target.value);
    };

    const handlePlanTitleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (newPlanTitle.trim()) {
            Meteor.callAsync('plans.insert', newPlanTitle.trim())
                .then(() => setIsCreatingPlan(false))
                .catch((err: any) => {
                    alert(err.reason || err.message || err);
                });
        }
    };

    const handleAddToPlan = (planIdx: number) => {
        if (
            selectedRestaurant &&
            userPlans[planIdx] &&
            !userPlans[planIdx].restaurants.some(
                (r) => r.displayName?.text === selectedRestaurant.displayName?.text
            )
        ) {
            Meteor.callAsync('plans.addRestaurant', userPlans[planIdx]._id, selectedRestaurant)
                .then(() => {
                    setAddingToPlanId(planIdx);
                    setTimeout(() => setAddingToPlanId(null), 1000);
                })
                .catch((err: any) => {
                    alert(err.reason || err.message || err);
                });
        }
    };

    return (
        <Modal
            open={open}
            onClose={() => {
                onClose();
                setIsCreatingPlan(false);
            }}
            aria-labelledby="add-to-plan-modal-title"
            aria-describedby="add-to-plan-modal-description"
        >
            <MuiBox
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 400,
                    bgcolor: 'background.paper',
                    border: '2px solid #C47B4D',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    maxHeight: 500,
                    overflowY: 'auto'
                }}
            >
                <Typography id="add-to-plan-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
                    Travel Plans
                </Typography>

                {isCreatingPlan ? (
                    <CreatePlanModalForm
                        setIsCreatingPlan={setIsCreatingPlan}
                        selectedRestaurant={selectedRestaurant}
                    />) : (
                    <button
                        style={{
                            marginBottom: "16px",
                            padding: "10px 24px",
                            backgroundColor: "#C47B4D",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "16px"
                        }}
                        onClick={handleCreatePlan}
                    >
                        Create + Add to New Plan
                    </button>
                )}

                {/* List of Plans */}
                <div style={{ width: "100%" }}>
                    {userPlans.length === 0 && (
                        <Typography sx={{ color: "#888", mb: 2 }}>No plans yet.</Typography>
                    )}
                    {userPlans.map((plan, idx) => (
                        <MuiBox key={idx} sx={{ mb: 2, border: "1px solid #eee", borderRadius: 1, p: 1 }}>
                            <details>
                                <summary style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                    <span>{plan.title}</span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleAddToPlan(idx);
                                        }}
                                        disabled={
                                            selectedRestaurant === null ||
                                            plan.restaurants.some(
                                                (r) => selectedRestaurant !== null && r.displayName?.text === selectedRestaurant.displayName?.text
                                            )
                                        }
                                        style={{
                                            marginLeft: "8px",
                                            backgroundColor: addingToPlanId === idx ? "#aaa" : "#C47B4D",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "4px",
                                            padding: "4px 12px",
                                            cursor: addingToPlanId === idx ? "default" : "pointer"
                                        }}
                                    >
                                        {plan.restaurants.some(
                                            (r) => selectedRestaurant !== null && r.displayName?.text === selectedRestaurant.displayName?.text
                                        )
                                            ? "Added"
                                            : addingToPlanId === idx
                                                ? "Added"
                                                : "Add"}
                                    </button>
                                </summary>
                                {/* List restaurants in plan */}
                                {plan.restaurants.length > 0 ? (
                                    <ul style={{ marginTop: 8, marginBottom: 0, paddingLeft: 16 }}>
                                        {plan.restaurants.map((r, ridx) => (
                                            <li key={ridx}>{r?.displayName?.text || "N/A"}</li>
                                        ))}
                                    </ul>
                                ) : (
                                    <Typography sx={{ color: "#aaa", fontSize: 13, mt: 1 }}>No restaurants in this plan.</Typography>
                                )}
                            </details>
                        </MuiBox>
                    ))}
                </div>
            </MuiBox>
        </Modal>
    );
};