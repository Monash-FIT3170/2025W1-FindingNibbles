import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
  Typography,
  TextField,
  Button,
  Box,
} from '@mui/material';
import { Accounts } from 'meteor/accounts-base';
import { useNavigate } from 'react-router-dom';
import { RegisterFormData } from '../types/User';

export const Register = () => {
  const [formData, setFormData] = useState<RegisterFormData>({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const { username, email, password, confirmPassword } = formData;

    if (!username || !email || !password || !confirmPassword) {
      alert('Please fill out all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    Accounts.createUser({
      username,
      email,
      password,
      profile: {
        name: username, 
        preferences: [], 
      }
    }, (err) => {
      if (err) {
        alert(`Registration failed: ${err}`);
      } else {
        console.log('User registered and logged in!');
        navigate('/');
      }
    });

  };

  return (
    <div className="min-h-screen w-screen bg-[url('/images/login.png')] bg-cover bg-center flex items-center justify-center p-5 font-[Segoe UI]">
      <div className="backdrop-blur-md bg-white/5 p-8 text-center w-full max-w-xl border border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-xl transition-transform duration-300 hover:scale-110">
        <Typography variant="h5" className="text-black font-bold text-[28px] font-[Segoe UI]">
          Welcome to Finding Nibbles!
        </Typography><br></br>

        <Box component="form" onSubmit={handleSubmit} display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Username"
            name="username"
            placeholder="Enter your username"
            value={formData.username}
            onChange={handleChange}
            fullWidth
            required
            className="backdrop-blur-lg bg-white/10 rounded-lg"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
            required
            className="backdrop-blur-lg bg-white/10 rounded-lg"
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
            required
            className="backdrop-blur-lg bg-white/10 rounded-lg"
          />
          <TextField
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
            fullWidth
            required
            className="backdrop-blur-lg bg-white/10 rounded-lg"
          />
          <Button type="submit" variant="contained" className="w-full">Register</Button>
        </Box>
      </div>
    </div>
  );
};