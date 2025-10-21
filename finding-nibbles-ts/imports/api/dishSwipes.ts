import { Mongo } from 'meteor/mongo';

export interface IDishSwipe {
  _id?: string;
  userId: string;
  name: string;
  liked: boolean;
  createdAt: Date;
}

export const DishSwipes = new Mongo.Collection<IDishSwipe>('dishSwipes');


