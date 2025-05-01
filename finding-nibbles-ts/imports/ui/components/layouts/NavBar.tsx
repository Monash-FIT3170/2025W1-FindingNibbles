import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
    AppBar,
    Toolbar,
    Typography,
    Box,
    Button,
    IconButton,
} from '@mui/material';

const bunnyIcon = './images/bunnyIcon.png';

export const NavBar = () => {
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <IconButton component={RouterLink} to="/" edge="start" >
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

                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        component={RouterLink}
                        to="/login"
                        sx={{
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': {
                                color: '#FDF2E3',
                            },
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
                            '&:hover': {
                                color: '#FDF2E3',
                            },
                        }}
                    >
                        Register
                    </Button>
                    <Button
                        component={RouterLink}
                        to="/map"
                        sx={{
                            color: 'white',
                            textTransform: 'none',
                            '&:hover': {
                                color: '#FDF2E3',
                            },
                        }}
                    >
                        Map
                    </Button>
                </Box>
            </Toolbar>
        </AppBar>
    );
};
