import { Meteor } from "meteor/meteor";

export interface CustomUserProfile {
  name?: string;
  preferences?: string[];
  calorieGoal?: number;
  macroGoals?: {
    protein: number;
    fat: number;
    carbs: number;
  };
  profileImage?: string;
}

export interface CustomUser  {
  profile?: CustomUserProfile;
  emails?: { address: string; verified: boolean }[];
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
