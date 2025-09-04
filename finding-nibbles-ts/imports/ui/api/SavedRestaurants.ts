import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';

export interface ISavedRestaurant {
  _id?: string;
  userId: string;
  placeId: string;
  name: string;
  location: string;
  latitude?: number;
  longitude?: number;
  rating?: number | null;
  cuisine?: string[];
  createdAt?: Date;
}

export const SavedRestaurantsCollection =
  new Mongo.Collection<ISavedRestaurant>('savedRestaurants');

if (Meteor.isServer) {
  Meteor.startup(async () => {
    const raw = SavedRestaurantsCollection.rawCollection();
    try {
      // Drop the wrong index if it exists
      try { await raw.dropIndex('userId_1_name_1'); } catch (_) {}

      // Correct unique key: one per (userId, placeId)
      await raw.createIndex(
        { userId: 1, placeId: 1 },
        {
          unique: true,
          name: 'userId_1_placeId_1',

          partialFilterExpression: { placeId: { $type: 'string' } }
        }
      );


      await raw.createIndex(
        { userId: 1, createdAt: -1 },
        { name: 'userId_1_createdAt_-1' }
      );
    } catch (e) {
      console.error('SavedRestaurants index setup error:', e);
    }
  });

  Meteor.methods({
    // NOTE: not an arrow function; we need `this.userId`
    async 'savedRestaurants.save'(restaurant: Partial<ISavedRestaurant>) {
      // Validate payload: do NOT require userId; allow rating null
      check(restaurant, {
        placeId: String,
        name: String,
        location: String,
        latitude: Match.Optional(Number),
        longitude: Match.Optional(Number),
        rating: Match.Optional(Match.OneOf(Number, null)),
        cuisine: Match.Optional([String]),
      });

      const userId = this.userId;
      if (!userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to save restaurants');
      }

      const placeId = restaurant.placeId?.trim();
      if (!placeId) {
        throw new Meteor.Error('invalid-arg', 'placeId is required');
      }

      const now = new Date();
      const update = {
        $setOnInsert: { userId, placeId, createdAt: now },
        $set: {
          name: restaurant.name!.trim(),
          location: restaurant.location!.trim(),
          latitude: restaurant.latitude,
          longitude: restaurant.longitude,
          rating: restaurant.rating ?? null,
          cuisine: restaurant.cuisine ?? [],
        },
      };

      try {
        const res = await SavedRestaurantsCollection
          .rawCollection()
          .updateOne({ userId, placeId }, update, { upsert: true });

        // Return _id for convenience
        if (res.upsertedId) {
          return (res.upsertedId as any)._id ?? res.upsertedId;
        }
        const doc = await SavedRestaurantsCollection.findOneAsync(
          { userId, placeId },
          { fields: { _id: 1 } }
        );
        return doc?._id;
      } catch (e: any) {
        console.error('[savedRestaurants.save]', e);
        if (e?.code === 11000) {
          throw new Meteor.Error('duplicate-entry', 'You already saved this restaurant');
        }
        if (e instanceof Meteor.Error) throw e;
        throw new Meteor.Error('server-error', e?.message || 'Unexpected server error');
      }
    },

    async 'savedRestaurants.remove'(placeId: string ) {
      check(placeId, String);

      const userId = this.userId;
      if (!userId) {
        throw new Meteor.Error('not-authorized');
      }

      const removed = await SavedRestaurantsCollection.removeAsync({ userId, placeId: placeId.trim() });
      if (removed === 0) {
        throw new Meteor.Error('not-found', 'Restaurant not found');
      }
      return removed;
    }
  });


  Meteor.publish('savedRestaurants', function () {
    if (!this.userId) {
      return this.ready();
    }
    return SavedRestaurantsCollection.find(
      { userId: this.userId },
      { sort: { createdAt: -1 } }
    );
  });
}
