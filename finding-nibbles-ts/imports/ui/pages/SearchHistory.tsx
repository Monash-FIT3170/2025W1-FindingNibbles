import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor'; 
import { SearchHistory as SearchHistoryCollection, ISearchHistory } from '../../api/searchHistory';
import {Tracker} from 'meteor/tracker';


export const SearchHistory = () => {
  const [history, setHistory] = useState<ISearchHistory[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);






  // useEffect(() => {
  //   // Set up the subscription
  //   const subscription = Meteor.subscribe('searchHistory');
    
  //   // Function to update history data
  //   const updateHistory = () => {
  //     if (subscription.ready()) {
  //       const historyItems = SearchHistoryCollection.find({}, { sort: { timestamp: -1 } }).fetch();
  //       setHistory(historyItems);
  //       setHistoryLoading(false);
  //     }
  //   };
    
  //   // Initial update
  //   updateHistory();
    
  //   // Set up an interval to check for changes
  //   const intervalId = setInterval(updateHistory, 500);
    
  //   // Clean up on unmount
  //   return () => {
  //     subscription.stop();
  //     clearInterval(intervalId);
  //   };
  // }, []);


  useEffect(()=> {
    // Start the subscription
    const subscription = Meteor.subscribe('searchHistory');

    // Set up a reactive computation

    const computation = Tracker.autorun(()=>{

      const items = SearchHistoryCollection
      .find({},{sort: {timestamp: -1}})
      .fetch();

      setHistory(items);
      setHistoryLoading(!subscription.ready());
    });

    // Cleanup
    return() => {
      // Stop the autorun
      computation.stop();
      subscription.stop();
    };
  },[]);


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
    <div className="flex min-h-screen pt-20">
      <div className="flex-1 bg-[#fdfaf7] px-6 pb-6" style={{ fontFamily: '"Comic Sans MS", cursive, sans-serif' }}>
        <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-[#4b2e19] mb-8">Search History</h1>
        
        {/* Loading State */}
        {historyLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C47B4D]"></div>
          </div>
        ) : (
          /* Search History Items */
          <div className="space-y-4">
            {history.length > 0 ? (
              history.map((item: ISearchHistory) => (
                <div
                  key={item._id}
                  className="flex justify-between items-center bg-white border border-[#e2cfc3] rounded-xl px-6 py-4 shadow-sm hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex flex-col">
                    <span className="text-[#4b2e19] font-medium text-lg">
                      {item.searchTerm}
                    </span>
                    <span className="text-[#7a5c43] text-sm">
                      {new Date(item.timestamp).toLocaleDateString()} at {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  
                  {/* Delete Button */}
                  <button
                    onClick={() => handleRemoveItem(item.searchTerm)}
                    className="text-[#7a5c43] hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-all duration-200 text-xl font-bold"
                    aria-label="Remove search item"
                  >
                    ×
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="bg-[#fff9f4] border border-[#e2cfc3] rounded-2xl p-8">
                  <p className="text-[#7a5c43] text-lg">No search history found</p>
                  <p className="text-[#7a5c43] text-sm mt-2">Your search terms will appear here as you use the app</p>
                </div>
              </div>
            )}
          </div>
        )}
        </div>
      </div>
    </div>
  );
};
