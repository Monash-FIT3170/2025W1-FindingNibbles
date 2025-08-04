export interface CustomUserProfile {
  name?: string;
  preferences?: string[];
  calorieGoal?: number;
}

export interface CustomUser extends Meteor.User {
  profile?: CustomUserProfile;
  emails?: { address: string }[];
}
