import React, { useEffect } from 'react';
import { Link as RouterLink} from "react-router-dom";
import {
    ListItem,
    ListItemButton,
  } from "@mui/material";
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { SearchHistory as SearchHistoryCollection, ISearchHistory } from '/imports/ui/api/searchHistory';



export const SearchHistory = () => {
  const { history, historyLoading } = useTracker(() => {
    const handle = Meteor.subscribe('searchHistory');
    const loading = !handle.ready();
    
    // Get the search history documents
    const historyItems = SearchHistoryCollection.find({}, { sort: { timestamp: -1 } }).fetch();
    
    return {
      history: historyItems,
      historyLoading: loading,
    };
  }, []);

  // Function to remove an item from search history
  const handleRemoveItem = (searchTerm: string) => {
    Meteor.call('searchHistory.remove', searchTerm, (error: any) => {
      if (error) {
        console.error('Error removing search history item:', error);
      }
    });
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
        {/* display loading state */}
        {historyLoading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#b87b45]"></div>
          </div>
        ) : (
          /* display each item from history */
          <div className="flex flex-col gap-4 w-full max-w-md">
            {history.length > 0 ? (
              history.map((item: ISearchHistory) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center border-2 border-[#b87b45] rounded-full px-4 py-2 text-center text-base text-black"
                >
                  <span>{item.searchTerm}</span>
                  {/* delete history entry button */}
                  <button
                    onClick={() => handleRemoveItem(item.searchTerm)}
                    className="text-black font-bold hover:text-[#b87b45]"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500">No search history found</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
