export interface CustomUserProfile {
    name?: string;
    preferences?: string[];
  }
  
  export interface CustomUser extends Meteor.User {
    profile?: CustomUserProfile;
    emails?: { address: string }[];
  }
  