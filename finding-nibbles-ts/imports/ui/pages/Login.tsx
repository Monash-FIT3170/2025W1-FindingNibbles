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
      alert('Please enter both username and password');
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper elevation={3} sx={{ padding: 4, marginTop: 8 }}>
        <Typography variant="h5" component="h1" gutterBottom>
          Login
        </Typography>
        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
            required
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleLogin}
            fullWidth
          >
            Login
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};
