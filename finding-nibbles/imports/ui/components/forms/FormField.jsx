import React from "react";
import "../../styles/forms.css"; 


export const FormField = ({ label, type, name, placeholder, value, onChange, onClear }) => {
    return (
      <div className="form-field">
        <label htmlFor={name} className="form-label">
          {label}
        </label>
        <div className="input-wrapper">
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
      </div>
    );
  };

