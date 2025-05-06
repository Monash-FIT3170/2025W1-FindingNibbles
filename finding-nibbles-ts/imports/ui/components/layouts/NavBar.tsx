import React, { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

const bunnyIcon = "./images/bunnyIcon.png";

import DicePopup from "../popups/DicePopup";

export const NavBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = useTracker(() => !!Meteor.userId(), []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showDicePopup, setShowDicePopup] = useState(false);

  const handleLogout = () => {
    Meteor.logout(() => {
      navigate("/login");
    });
  };

  const toggleDrawer = (open: boolean) => () => {
    setIsDrawerOpen(open);
  };

  return (
    <>
      {/* AppBar */}
      <AppBar
        position="static"
        elevation={0}
        sx={{
          backgroundColor: "#C47B4D",
          fontFamily: '"Comic Sans MS", cursive, sans-serif',
        }}
      >
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {/* Logo and Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton component={RouterLink} to="/" edge="start">
              <img
                src={bunnyIcon}
                alt="Bunny Icon"
                style={{
                  width: "32px",
                  height: "32px",
                  objectFit: "contain",
                }}
              />
            </IconButton>
            <Typography
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: "none",
                color: "#ffffff",
                fontWeight: "bold",
                fontSize: "1.25rem",
              }}
            >
              Finding Nibbles
            </Typography>
          </Box>

          {/* Right-Side Navigation Buttons */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {!isLoggedIn ? (
              <>
                <Button
                  component={RouterLink}
                  to="/login"
                  sx={{
                    color: "white",
                    textTransform: "none",
                    "&:hover": { color: "#FDF2E3" },
                  }}
                >
                  Login
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  sx={{
                    color: "white",
                    textTransform: "none",
                    "&:hover": { color: "#FDF2E3" },
                  }}
                >
                  Register
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={toggleDrawer(true)}
                  sx={{
                    color: "white",
                    textTransform: "none",
                    "&:hover": { color: "#FDF2E3" },
                  }}
                >
                  Hi, user!
                </Button>
              </>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Drawer anchor="right" open={isDrawerOpen} onClose={toggleDrawer(false)}>
        <Box
          sx={{
            width: 250,
            backgroundColor: "#F4C7A1",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            padding: 2,
          }}
          role="presentation"
          onClick={toggleDrawer(false)}
          onKeyDown={toggleDrawer(false)}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: "bold",
              marginBottom: 2,
              textAlign: "center",
            }}
          >
            Hi, user!
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/map">
                <ListItemText primary="Map" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={() => setShowDicePopup(true)}>
                <ListItemText primary="Roll a dice" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/ai-suggestion">
                <ListItemText primary="AI suggestion" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/travel-plan">
                <ListItemText primary="Travel Plan" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/meal-plan">
                <ListItemText primary="Meal Plan" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>
      {showDicePopup && (
      <DicePopup open={showDicePopup} onClose={() => setShowDicePopup(false)} />
    )}
    </>
  );
};
