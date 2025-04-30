import React, { useState, ChangeEvent, FormEvent } from "react";
import { FormField } from "../components/forms/FormField";

interface FormData {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

export const Register = () => {
    const [formData, setFormData] = useState<FormData>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
    };

    return (
        <div className="w-1/2 mx-auto mt-[50px] mb-0 p-5 bg-[#fdf2e3] rounded-[15px] shadow-md text-center font-['Comic_Sans_MS',cursive,sans-serif] animate-[fadeIn_0.5s_ease-in-out]">
            <h1 className="text-2xl text-[#c17030] mb-2.5">Welcome to Finding Nibbles!</h1>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                <FormField
                    label="Username"
                    type="text"
                    name="username"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={handleChange}
                />
                <FormField
                    label="Email"
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                />
                <FormField
                    label="Password"
                    type="password"
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                />
                <FormField
                    label="Confirm Password"
                    type="password"
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                />
                <button type="submit" className="py-3 px-5 bg-[#fbe4c4] text-[#c17030] border-none rounded-full text-base font-bold uppercase cursor-pointer transition-all shadow-md hover:bg-[#f9dcb5] hover:scale-105 active:bg-[#f7d4a6] active:scale-[0.98]">
                    Register
                </button>
            </form>
        </div>
    );
};
