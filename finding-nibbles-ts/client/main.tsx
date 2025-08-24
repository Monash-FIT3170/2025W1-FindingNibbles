import React from 'react';
import { createRoot } from 'react-dom/client';
import { Meteor } from 'meteor/meteor';
import { App } from '/imports/ui/App';
import '/imports/ui/api/searchHistory';
import '../imports/ui/api/SavedRestaurants';
import { SavedRestaurantsCollection } from '../imports/ui/api/SavedRestaurants';

// Expose to window for debugging
(window as any).SavedRestaurantsCollection = SavedRestaurantsCollection;

Meteor.startup(() => {
  const container = document.getElementById('react-target');
  const root = createRoot(container!);
  root.render(<App />);
});
