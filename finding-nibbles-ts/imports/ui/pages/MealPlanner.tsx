import { Sidebar } from '../components/layouts/Sidebar.tsx';
import React from 'react';

export const MealPlanner = () => {
  return (
    <div className="flex min-h-screen font-[Comic_Sans_MS]">
      <Sidebar />
      <div className="flex flex-col flex-1 items-center p-6">
        <h2 className="text-2xl font-bold mb-4">Meal Planner</h2>
        {/* content */}
      </div>
    </div>
  );
};
