import React from "react";
import "./../../styles/forms.css";


const FormField = ({ label, type, name, placeholder, value, onChange }) => {
  return (
    <div className="form-field">
      <label htmlFor={name} className="form-label">
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="form-input"
      />
    </div>
  );
};

export default FormField;