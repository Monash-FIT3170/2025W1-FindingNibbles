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

  async 'users.uploadProfileImage'(fileData: { name: string; type: string; size: number; data: string }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'User must be logged in to upload profile image');
    }

    try {
      const { name, type, size, data } = fileData;
      
      if (!data) {
        throw new Meteor.Error('no-file', 'No file data provided');
      }

      // Validate file type
      if (!type.startsWith('image/')) {
        throw new Meteor.Error('invalid-file-type', 'File must be an image');
      }

      // Validate file size (max 5MB)
      if (size > 5 * 1024 * 1024) {
        throw new Meteor.Error('file-too-large', 'File size must be less than 5MB');
      }

      // Create data URL from base64 data
      const dataUrl = `data:${type};base64,${data}`;

      // Update user profile with the new image
      await Meteor.users.updateAsync(this.userId, {
        $set: {
          'profile.profileImage': dataUrl,
        },
      });

      return { success: true, message: 'Profile image updated successfully' };
    } catch (error: any) {
      console.error('Profile image upload failed:', error);
      throw new Meteor.Error('upload-failed', error.message);
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


  //method for updating macro goals
  async 'users.updateMacroGoals'(macroGoals: { protein: number; fat: number; carbs: number }) {
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'User must be logged in to update macro goals');
    }

    const { protein, fat, carbs } = macroGoals;

    if (protein < 0 || fat < 0 || carbs < 0) {
      throw new Meteor.Error('invalid-goal', 'Macro goals must be non-negative');
    }

    try {
      await Meteor.users.updateAsync(this.userId, {
        $set: {
          'profile.macroGoals': macroGoals,
        },
      });
    } catch (error: any) {
      console.error('Update macro goals failed:', error);
      throw new Meteor.Error('update-failed', error.message);
    }
  }
});