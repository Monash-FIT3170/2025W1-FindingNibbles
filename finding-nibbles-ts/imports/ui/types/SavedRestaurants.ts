import { Mongo } from 'meteor/mongo';

export interface SavedRestaurant {
  _id?: string;
  userId: string;
  name: string;
  address?: string;
  location: {
    lat: number;
    lng: number;
  };
  rating?: number;
  types?: string[];
  createdAt: Date;
}

export const SavedRestaurantsCollection = new Mongo.Collection<SavedRestaurant>('savedRestaurants');
