import { Accounts } from 'meteor/accounts-base';
import { Meteor } from 'meteor/meteor';

Meteor.methods({
  'users.register'(email, password, username) {
    if (!email || !password || !username) {
      throw new Meteor.Error('400', 'All fields are required.');
    }

    // Check if the email is valid
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Meteor.Error('400', 'Invalid email address.');
    }

    // Check if the password is strong enough
    if (password.length < 6) {
      throw new Meteor.Error('400', 'Password must be at least 6 characters long.');
    }

    // Create the user
    const userId = Accounts.createUser({
      email,
      password,
      username,
    });

    return userId;
  },
});