import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

import {
  TextField,
  Button,
  Typography,
  Box,
} from '@mui/material';

export const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (username && password) {
      try {
        console.log('Attempting login...');

        await new Promise<void>((resolve, reject) => {
          Meteor.loginWithPassword(username, password, (error) => {
            if (error) {
              reject(error);
            } else {
              resolve();
            }
          });
        });

        console.log('Login successful');
        navigate('/');
      } catch (error: any) {
        console.error('Login failed:', error.reason || error.message);
        alert(`Login failed: ${error.reason || 'Unknown error'}`);
      }
    } else {
      alert('Please enter both username and password'); //implement error popup later
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[url('/images/login.png')] bg-cover bg-center flex items-center justify-center p-5 font-[Segoe UI]">
      <div className="backdrop-blur-md bg-white/5 p-8 text-center w-full max-w-xl border border-white/50 shadow-[0_8px_24px_rgba(0,0,0,0.5)] rounded-xl transition-transform duration-300 hover:scale-110">
        <Typography variant="h5" component="h1" gutterBottom className="text-black font-bold text-[28px] font-[Segoe UI]">
          Login
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            className="backdrop-blur-lg bg-white/10 rounded-lg"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            className="backdrop-blur-lg bg-white/10 rounded-lg"
          />
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <label className="text-white text-sm">
              <input type="checkbox" id="checkbox" className="mr-2" />
              Remember me
            </label>
            <a href="#" className="text-sm text-blue-600 hover:underline">Forgot password?</a>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
            className="w-full"
          >
            Login
          </Button>
          <Typography variant="body2" align="center" className="text-white">
            Don't have an account? <a href="Register" className="text-blue-400 hover:underline">Register</a>
          </Typography>
        </Box>
      </div>
    </div>
  );
};