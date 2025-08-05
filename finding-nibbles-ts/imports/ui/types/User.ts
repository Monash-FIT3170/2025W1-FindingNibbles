export interface CustomUserProfile {
  name?: string;
  preferences?: string[];
  calorieGoal?: number;
  macroGoals?: {
    protein: number;
    fat: number;
    carbs: number;
  };
}

export interface CustomUser extends Meteor.User {
  profile?: CustomUserProfile;
  emails?: { address: string }[];
}
