import React, { useState } from 'react';
import {Sidebar} from '../components/layouts/Sidebar';


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
      <Sidebar />

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
