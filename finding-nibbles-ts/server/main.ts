import { Meteor } from 'meteor/meteor';
import { Accounts } from 'meteor/accounts-base';
import { MOCK_DATA } from './config';
import 'dotenv/config';
import '../imports/ui/api/user.methods.ts';
import '../imports/ui/api/aiSuggestion.ts';
import '../imports/ui/api/searchHistory.ts';
import '../imports/ui/api/SavedRestaurants';
import '../imports/ui/api/Plans';


Meteor.startup(async () => {
  if (!(await Accounts.findUserByUsername(MOCK_DATA.SEED_USERNAME))) {
    await Accounts.createUser({
      username: MOCK_DATA.SEED_USERNAME,
      password: MOCK_DATA.SEED_PASSWORD,
      profile: {
        name: 'Test User',
        preferences: ['Vegetarian'],
      },
    });
  }
});
