import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";

Meteor.methods({
  async "users.register"(username, email, password) {
    try {
      // Check if the user already exists
      const existingUser = await Meteor.users.findOneAsync({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        throw new Meteor.Error("user-exists", "User already exists");
      }

      // Accounts.createUser is NOT Promise-based and must be wrapped
      const createUserSync = Meteor.wrapAsync(Accounts.createUser);
      const userId = createUserSync({ username, email, password });

      return userId;
    } catch (e) {
      console.error("Registration error:", e);
      throw new Meteor.Error("registration-failed", e.reason || e.message);
    }
  }
});
