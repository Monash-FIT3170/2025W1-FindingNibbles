import React, { useState, ChangeEvent, FormEvent } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
} from '@mui/material';
import { Accounts } from 'meteor/accounts-base';
import { useNavigate } from 'react-router-dom';

import '../styling/auth.css';

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

        Accounts.createUser({ username, email, password }, (err) => {
            if (err) {
                alert(`Registration failed: ${err}`);
            } else {
                console.log('User registered and logged in!');
                navigate('/'); 
            }
        });
    };

    return (
        <Container maxWidth="sm" className="auth-container" sx={{ mb: 5 }}>
            <Paper elevation={3} className="auth-paper">
                <Typography variant="h5" className="auth-title">
                    Welcome to Finding Nibbles!
                </Typography><br></br>

                <Box component="form" onSubmit={handleSubmit} className="auth-input" display="flex" flexDirection="column" gap={2}>
                    <TextField 
                        label="Username"
                        name="username"
                        placeholder="Enter your username"
                        value={formData.username}
                        onChange={handleChange}
                        fullWidth
                        required
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
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        className="auth-button"
                    >
                        Register
                    </Button>
                </Box>
            </Paper>
        </Container>
    );
};
