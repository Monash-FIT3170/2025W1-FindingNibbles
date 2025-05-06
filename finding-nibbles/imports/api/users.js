import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

Meteor.methods({
  'users.register'(username, email, password) {
    // Check if the user already exists
    const existingUser = Meteor.users.findOne({
      $or: [{ username }, { email }]
    });
    if (existingUser) {
      throw new Meteor.Error("User already exists");
    }

    // Create the user using the Accounts package
    const userId = Accounts.createUser({ username, email, password });

    // Return the user ID if successful
    return userId;
  }
});
