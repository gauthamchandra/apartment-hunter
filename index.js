'use strict';

var CraigslistQueryBuilder = require('./providers/craigslist_query_builder.js')
  , CraigslistProvider = require('./providers/craigslist_provider.js');

var query = new CraigslistQueryBuilder()
  .setLocation('newyork')
  .setMinimumBedrooms(1)
  .filterToPostsWithImages()
  .filterToApartments()
  .bundleDuplicates()
  .setExclusionFilters(['roommates'])
  .build();

console.log('Fetching data using query:', query); 

new CraigslistProvider(query)
  .fetchFeed()
  .then(posts => {
    console.log(posts);
  });
