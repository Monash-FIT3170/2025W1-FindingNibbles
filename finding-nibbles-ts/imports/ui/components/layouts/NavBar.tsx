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
import type { CustomUser } from "../../types/User";

const bunnyIcon = "./images/bunnyIcon.png";

export const NavBar = () => {
  const navigate = useNavigate();
  const isLoggedIn = useTracker(() => !!Meteor.userId(), []);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showTravelPlanSub, setShowTravelPlanSub] = useState(false);
  const user = useTracker(() => Meteor.user() as CustomUser | null, []);
  const userName = user?.profile?.name || "User";

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
          className="w-64 h-full bg-[#d5a16e] flex flex-col p-4"
          role="presentation"
          onKeyDown={toggleDrawer(false)}
        >
          {/* Profile Section */}
          <div className="flex flex-col items-center mb-4">
            <Button
              component={RouterLink}
              to="/profile"
              variant="text"
              className="p-0 min-w-0"
            >
              <img
                src="/images/default-profile-pic.png"
                alt="Profile"
                className="w-[75px] h-[75px] rounded-full border-2 border-[#C47B4D]"
              />
            </Button>
            <span className="mt-2 text-white text-base font-bold font-[Comic_Sans_MS,cursive,sans-serif]">
              {userName}
            </span>
          </div>

          {/* Navigation List */}
          <List className="space-y-1">
            {[
              { label: "Map", path: "/map" },
              { label: "AI Suggestion", path: "/ai-suggestion" },
              { label: "Travel Plan", path: "/travel-plans" },
              { label: "Meal Plan", path: "/meal-planner" },
              { label: "Profile", path: "/profile" },
            ].map((item) => (
              <ListItem key={item.path} disablePadding>
                <ListItemButton component={RouterLink} to={item.path}>
                  <ListItemText
                    primary={
                      <span className="text-white font-bold text-base hover:text-[#a95f30] transition-colors">
                        {item.label}
                      </span>
                    }
                  />
                </ListItemButton>
              </ListItem>
            ))}
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText
                  primary={
                    <span className="text-white font-bold text-base hover:text-[#a95f30] transition-colors">
                      Logout
                    </span>
                  }
                />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Drawer>

      </>
  );
};
