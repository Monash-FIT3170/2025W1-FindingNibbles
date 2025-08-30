import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { MOCK_DATA } from './config';
import '../imports/ui/api/user.methods.ts';
import '../imports/ui/api/aiSuggestion.ts';
import '../imports/ui/api/generateImage.ts';
import '../imports/ui/api/searchHistory.ts';
import '../imports/ui/api/SavedRestaurants';
import '../imports/ui/api/Plans';
import '../imports/ui/api/meals.ts';
import "/imports/ui/api/savedDishes";

Meteor.startup(async () => {
  // Debug: Check if settings are loaded
  console.log('=== SERVER STARTUP ===');
  console.log('Meteor.settings.public:', Meteor.settings.public);
  console.log('Google API Key from settings:', Meteor.settings.public?.googlePlacesApiKey ? 'FOUND' : 'NOT FOUND');

  // Create seed user if it doesn't exist
  if (!(await Accounts.findUserByUsername(MOCK_DATA.SEED_USERNAME))) {
    await Accounts.createUser({
      username: MOCK_DATA.SEED_USERNAME,
      password: MOCK_DATA.SEED_PASSWORD,
      profile: {
        name: 'Test User',
        preferences: ['Vegetarian'],
      },
    });
    console.log('Seed user created');
  } else {
    console.log('Seed user already exists');
  }
});