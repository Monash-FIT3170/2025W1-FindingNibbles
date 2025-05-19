import React, { useState } from 'react';
import { Link as RouterLink} from "react-router-dom";
import {
    ListItem,
    ListItemButton,
  } from "@mui/material";



export const SearchHistory = () => {
    //state for storing the stuff the user searched for
  const [history, setHistory] = useState([
    'Pizza',
    'Butter Chicken',
    'Burger',
    'Fried Rice',
  ]);

  //function to remove an item from search history
  const handleRemoveItem = (item: string) => {
    setHistory(history.filter((entry) => entry !== item));
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-[Comic_Sans_MS]">
      {/* Sidebar */}
      <div className="w-full md:w-[240px] bg-[#d5a16e] flex flex-col p-5 shadow-md">
        {/* profile button to link to profile page */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/profile"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              borderRadius: .5,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#c68c53',
              },
            }}
          >
            Profile
          </ListItemButton>
        </ListItem>

        {/* meal planner button to link to meal planner page */}
        <ListItem disablePadding sx={{ mb: 0.5 }}>
          <ListItemButton
            component={RouterLink}
            to="/meal-planner"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              borderRadius: .5,
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#c68c53',
              },
            }}
          >
            Meal Planner
          </ListItemButton>
        </ListItem>

        {/* search history button to link to search history page */}
        <ListItem disablePadding>
          <ListItemButton
            component={RouterLink}
            to="/search-history"
            sx={{
              color: 'white',
              fontWeight: 'bold',
              borderRadius: .5,
              backgroundColor: '#b87b45',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: '#a86f3c',
              },
            }}
          >
            Search History
          </ListItemButton>
        </ListItem>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-1 items-center p-6">
        <h1 className="text-2xl font-bold mb-6">Search History</h1>
        {/* display each item from history */}
        <div className="flex flex-col gap-4 w-full max-w-md">
          {history.map((item) => (
            <div
              key={item}
              className="flex justify-between items-center border-2 border-[#b87b45] rounded-full px-4 py-2 text-center text-base text-black"
            >
              <span>{item}</span>
              {/* delete history entry button */}
              <button
                onClick={() => handleRemoveItem(item)}
                className="text-black font-bold hover:text-[#b87b45]"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
