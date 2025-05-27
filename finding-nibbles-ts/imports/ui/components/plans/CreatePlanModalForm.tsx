import React from "react";

interface CreatePlanModalFormProps {
  newPlanTitle: string;
  handlePlanTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePlanTitleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setIsCreatingPlan: (val: boolean) => void;
}

export const CreatePlanModalForm: React.FC<CreatePlanModalFormProps> = ({
  newPlanTitle,
  handlePlanTitleChange,
  handlePlanTitleSubmit,
  setIsCreatingPlan,
}) => (
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
);

