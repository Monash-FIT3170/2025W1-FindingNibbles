import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Define the interface for search history documents
export interface ISearchHistory {
  _id?: string;
  userId: string;
  searchTerm: string;
  timestamp: Date;
}

function normalizeTerm(s: string) {
  return s.trim().replace(/\s+/g, ' ');
}

export const SearchHistory = new Mongo.Collection<ISearchHistory>('searchHistory');

if (Meteor.isServer) {
  Meteor.startup(async () => {
    try {
      await SearchHistory.rawCollection().createIndex(
        { userId: 1, searchTerm: 1 },
        { unique: true, name: 'userId_1_searchTerm_1' } 
      );
      // Optional: for sort performance
      await SearchHistory.rawCollection().createIndex(
        { userId: 1, timestamp: -1 },
        { name: 'userId_1_timestamp_-1' }
      );
    } catch (err: any) {

      console.error('Error ensuring search history indexes:', err);
    }
  });
}


// Define methods for working with search history
Meteor.methods({

  async 'searchHistory.save'(searchTerm: string) {
  check(searchTerm, String);
  if (!this.userId) throw new Meteor.Error('not-authorized');

  const t = searchTerm.trim().replace(/\s+/g, ' ');
  const now = new Date();

  try {
    await SearchHistory.rawCollection().updateOne(
      { userId: this.userId, searchTerm: t },
      {
        $setOnInsert: { userId: this.userId, searchTerm: t, createdAt: now },
        $set: { timestamp: now } 
      },
      { upsert: true }
    );
    return { ok: 1 };
  } catch (error) {
    console.error('Error saving search history:', error);
    throw new Meteor.Error('db-error', 'Failed to save search term');
  }
},

async 'searchHistory.remove'(searchTerm: string) {
    check(searchTerm, String);
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to remove search history');
    }

    try {
      const result = await SearchHistory.rawCollection().deleteOne({
        userId: this.userId,
        searchTerm: normalizeTerm(searchTerm),
      });
      return { deletedCount: result.deletedCount ?? 0 };
    } catch (error) {
      console.error('Error removing search history:', error);
      throw new Meteor.Error('db-error', 'Failed to remove search term');
    }
  }

});





if (Meteor.isServer) {
  Meteor.publish('searchHistory', function() {
    if (!this.userId) {
      return this.ready();
    }
    
    return SearchHistory.find(
      { userId: this.userId },
      { sort: { timestamp: -1 } }
    );
  });
}