import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Meteor } from 'meteor/meteor';

import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Paper
} from '@mui/material';

import '../styling/auth.css';



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
    <Container maxWidth="sm" className="auth-container">
      <Paper elevation={3} className="auth-paper">
        <Typography variant="h5" component="h1" gutterBottom className="auth-title">
          Login
        </Typography>
        <Box display="flex" flexDirection="column" gap={2} className="auth-form">
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
            className="auth-input auth-username"
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
            className="auth-input auth-password"
          />
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <label>
              <input type="checkbox" id="checkbox"/>
              Remember me
            </label>
            <a href="#" className="forgot-password">Forgot password?</a>
          </Box>
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
            className="auth-button"
          >
            Login
          </Button>
          <Typography variant="body2" align="center" className="register-link">
            Don't have an account? <a href="Register">Register</a>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};
