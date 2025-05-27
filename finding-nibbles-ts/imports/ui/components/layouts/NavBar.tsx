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
  Collapse,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import { useTracker } from "meteor/react-meteor-data";
import { Meteor } from "meteor/meteor";

const bunnyIcon = "./images/bunnyIcon.png";

export const NavBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = useTracker(() => !!Meteor.userId(), []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showTravelPlanSub, setShowTravelPlanSub] = useState(false);

  const handleLogout = () => {
    Meteor.logout(() => {
      navigate("/login");
    });
  };

  const toggleDrawer = (open: boolean) => () => {
    setIsDrawerOpen(open);
    if (!open) setShowTravelPlanSub(false);
  };

  // Handle main nav button clicks
  const handleNavClick = (button: string) => () => {
    if (button === "travel-plan") {
      setShowTravelPlanSub((prev) => !prev);
    } else {
      setShowTravelPlanSub(false);
      setIsDrawerOpen(false);
    }
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
                  <img
                    src="/images/default-profile-pic.png"
                    alt="Profile"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                    }}
                  />
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
            <Button
              component={RouterLink}
              to="/profile"
              variant="text"
            >
              <img
                src="/images/default-profile-pic.png"
                alt="Profile"
                style={{
                  width: 75,
                  height: 75,
                  borderRadius: "50%",
                  border: "2px solid #C47B4D",
                }}
              />
            </Button>
          </Typography>
          <List>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/map" onClick={handleNavClick("map")}>
                <ListItemText primary="Map" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/ai-suggestion" onClick={handleNavClick("ai-suggestion")}>
                <ListItemText primary="AI suggestion" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleNavClick("travel-plan")}>
                <ListItemText primary="Travel Plan" />
                {showTravelPlanSub ? <ExpandLess /> : <ExpandMore />}
              </ListItemButton>
            </ListItem>
            <Collapse in={showTravelPlanSub} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/travel-plan/view-saved" sx={{ pl: 4 }}>
                    <ListItemText primary="View Saved" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton component={RouterLink} to="/travel-plan/create-new" sx={{ pl: 4 }}>
                    <ListItemText primary="Create New" />
                  </ListItemButton>
                </ListItem>
              </List>
            </Collapse>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/meal-plan" onClick={handleNavClick("meal-plan")}>
                <ListItemText primary="Meal Plan" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={RouterLink} to="/profile" onClick={handleNavClick("profile")}>
                <ListItemText primary="Profile" />
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
    </>
  );
};
