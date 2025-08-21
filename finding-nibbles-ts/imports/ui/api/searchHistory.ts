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

export const SearchHistory = new Mongo.Collection<ISearchHistory>('searchHistory');

// Prevent duplicate recent searches
if (Meteor.isServer) {
  Meteor.startup(() => {
    SearchHistory.rawCollection().createIndex({ userId: 1, searchTerm: 1 }
      // , { unique: true }
    )
      .then(() => console.log('Search history index created'))
      .catch(err => console.error('Error creating search history index:', err));
  });
}

// Define methods for working with search history
Meteor.methods({
  async 'searchHistory.save'(searchTerm: string) {
    check(searchTerm, String);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to save search history');
    }

    try {
      // Upsert to handle the case where this search already exists
      const insertedId = await SearchHistory.insertAsync(
        { userId: this.userId,
           searchTerm,
          timestamp: new Date() 
        });
        
        return {insertedId}

        // { 
        //   $set: { 
        //     userId: this.userId, 
        //     searchTerm, 
        //     timestamp: new Date() 
        //   } 
        // }
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
      await SearchHistory.removeAsync({ userId: this.userId, searchTerm });
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