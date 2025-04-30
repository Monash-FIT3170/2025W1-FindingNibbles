import React, { ChangeEvent } from "react";

interface FormFieldProps {
  label: string;
  type: string;
  name: string;
  placeholder: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onClear?: () => void; // Making onClear optional
}

export const FormField = ({ label, type, name, placeholder, value, onChange, onClear }: FormFieldProps) => {
    return (
      <div className="flex flex-col items-start relative mb-4">
        <label htmlFor={name} className="text-[#c17030] font-bold text-sm mb-1 capitalize">
          {label}
        </label>
        <div className="w-full">
          <input
            type={type}
            id={name}
            name={name}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full p-2.5 border-2 border-[#c17030] rounded-lg text-sm text-[#c17030] outline-none transition-all focus:border-[#c17030] focus:shadow-[0_0_10px_rgba(193,112,48,0.5)]"
          />
        </div>
      </div>
    );
  };

