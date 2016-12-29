'use strict';

var env = require('./env.json')
  , Promise = global.Promise
  , CraigslistQueryBuilder = require('./providers/craigslist/craigslist_query_builder.js')
  , CraigslistProvider = require('./providers/craigslist/craigslist_provider.js')
  , TransitInfoProvider = require('./providers/google/transit_info_provider.js');

var query = new CraigslistQueryBuilder()
  .setLocation('newyork')
  .setMinimumBedrooms(1)
  .filterToPostsWithImages()
  .filterToApartments()
  .bundleDuplicates()
  .setExclusionFilters(['roommates'])
  .build();


var transitInfoProvider = new TransitInfoProvider(env.GOOGLE_MAPS_API_KEY);

Promise.all([
  transitInfoProvider.getLatLng('1600 Pennsylvania Ave NW, Washington, DC 20500'),
  transitInfoProvider.getLatLng('United Nations, New York, NY')
]).then(locations => {
  transitInfoProvider.getTransitTime(locations[0], locations[1])
    .then(value => {
      console.log('Value:', value);
    });
});
