import React from "react";
import { Modal, Box as MuiBox, Typography } from "@mui/material";

interface Restaurant {
  displayName?: { text: string };
}

interface Plan {
  title: string;
  restaurants: Restaurant[];
}

interface AddToPlanModalProps {
  open: boolean;
  onClose: () => void;
  isCreatingPlan: boolean;
  setIsCreatingPlan: (val: boolean) => void;
  newPlanTitle: string;
  setNewPlanTitle: (val: string) => void;
  handlePlanTitleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handlePlanTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreatePlan: () => void;
  userPlans: Plan[];
  selectedRestaurant: Restaurant | null;
  handleAddToPlan: (planIdx: number) => void;
  addingToPlanId: number | null;
}

export const AddToPlanModal: React.FC<AddToPlanModalProps> = ({
  open,
  onClose,
  isCreatingPlan,
  setIsCreatingPlan,
  newPlanTitle,
  setNewPlanTitle,
  handlePlanTitleSubmit,
  handlePlanTitleChange,
  handleCreatePlan,
  userPlans,
  selectedRestaurant,
  handleAddToPlan,
  addingToPlanId,
}) => (
  <Modal
    open={open}
    onClose={onClose}
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

      {/* Create Plan Form */}
      {isCreatingPlan ? (
        <form onSubmit={handlePlanTitleSubmit} style={{ width: "100%" }}>
          <input
            autoFocus
            type="text"
            value={newPlanTitle}
            onChange={handlePlanTitleChange}
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
              Create
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
      ) : (
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
          Create New Plan
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
