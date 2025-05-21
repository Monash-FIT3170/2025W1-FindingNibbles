import React, { useEffect, useState } from 'react';
import { Link as RouterLink} from "react-router-dom";
import {
    ListItem,
    ListItemButton,
  } from "@mui/material";
import { Meteor } from 'meteor/meteor';
import { SearchHistory as SearchHistoryCollection, ISearchHistory } from '/imports/ui/api/searchHistory';
import {Sidebar} from '../components/layouts/Sidebar';


export const SearchHistory = () => {
  const [history, setHistory] = useState<ISearchHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    // Set up the subscription
    const subscription = Meteor.subscribe('searchHistory');
    
    // Function to update history data
    const updateHistory = () => {
      if (subscription.ready()) {
        const historyItems = SearchHistoryCollection.find({}, { sort: { timestamp: -1 } }).fetch();
        setHistory(historyItems);
        setHistoryLoading(false);
      }
    };
    
    // Initial update
    updateHistory();
    
    // Set up an interval to check for changes
    const intervalId = setInterval(updateHistory, 500);
    
    // Clean up on unmount
    return () => {
      subscription.stop();
      clearInterval(intervalId);
    };
  }, []);

  // Function to remove an item from search history
  const handleRemoveItem = (searchTerm: string) => {
    Meteor.call('searchHistory.remove', searchTerm, (error: any) => {
      if (error) {
        console.error('Error removing search history item:', error);
      } else {
        // Update the local state to reflect the removal
        setHistory(prevHistory => 
          prevHistory.filter(item => item.searchTerm !== searchTerm)
        );
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen font-[Comic_Sans_MS]">
      {/* Sidebar */}
      <Sidebar />

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
