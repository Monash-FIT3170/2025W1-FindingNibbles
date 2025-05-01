import React from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
} from '@mui/material';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';

const bunnyIcon = './images/bunnyIcon.png';

export const NavBar = () => {
    const navigate = useNavigate();
    const isLoggedIn = useTracker(() => !!Meteor.userId(), []);

    const handleLogout = () => {
        Meteor.logout(() => {
            navigate('/login');
        });
    };

    return (
        <AppBar
            position="static"
            elevation={0}
            sx={{
                backgroundColor: '#C47B4D',
                fontFamily: '"Comic Sans MS", cursive, sans-serif',
            }}
        >
            <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                {/* Logo and Title */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton component={RouterLink} to="/" edge="start">
                        <img
                            src={bunnyIcon}
                            alt="Bunny Icon"
                            style={{
                                width: '32px',
                                height: '32px',
                                objectFit: 'contain',
                            }}
                        />
                    </IconButton>
                    <Typography
                        variant="h6"
                        component={RouterLink}
                        to="/"
                        sx={{
                            textDecoration: 'none',
                            color: '#ffffff',
                            fontWeight: 'bold',
                            fontSize: '1.25rem',
                        }}
                    >
                        Finding Nibbles
                    </Typography>
                </Box>

                {/* Right-Side Navigation Buttons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {!isLoggedIn ? (
                        <>
                            <Button
                                component={RouterLink}
                                to="/login"
                                sx={{
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { color: '#FDF2E3' },
                                }}
                            >
                                Login
                            </Button>
                            <Button
                                component={RouterLink}
                                to="/register"
                                sx={{
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { color: '#FDF2E3' },
                                }}
                            >
                                Register
                            </Button>
                        </>
                    ) : (
                        <>
                            <Button
                                component={RouterLink}
                                to="/map"
                                sx={{
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { color: '#FDF2E3' },
                                }}
                            >
                                Map
                            </Button>
                            <Button
                                onClick={handleLogout}
                                sx={{
                                    color: 'white',
                                    textTransform: 'none',
                                    '&:hover': { color: '#FDF2E3' },
                                }}
                            >
                                Logout
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};
