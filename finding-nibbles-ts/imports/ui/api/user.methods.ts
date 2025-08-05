import { Meteor } from 'meteor/meteor';

Meteor.methods({
  async 'users.updateProfile'({ name, email, preferences }: { name: string; email: string; preferences: string[] }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'User must be logged in to update profile');
    }

    try {
      await Meteor.users.updateAsync(this.userId, {
        $set: {
          'profile.name': name,
          'profile.preferences': preferences,
          // 'emails.0.address': email, dont update emails as of noww
        },
      });
    } catch (error: any) {
      console.error('Update failed:', error);
      throw new Meteor.Error('update-failed', error.message);
    }
  },

  //method for updating calorie goal
  async 'users.updateCalorieGoal'(calorieGoal: number) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'User must be logged in to update calorie goal');
    }

    if (calorieGoal < 0) {
      throw new Meteor.Error('invalid-goal', 'Calorie goal must be a positive number');
    }

    try {
      await Meteor.users.updateAsync(this.userId, {
        $set: { 'profile.calorieGoal': calorieGoal },
      });
    } catch (error: any) {
      console.error('Update calorie goal failed:', error);
      throw new Meteor.Error('update-failed', error.message);
    }
  },
});