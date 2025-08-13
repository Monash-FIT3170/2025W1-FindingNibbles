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

export interface CustomUser  {
  profile?: CustomUserProfile;
  emails?: { address: string }[];
}

export interface RegisterFormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}
