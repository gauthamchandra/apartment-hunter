'use strict';

var env = require('./env.json')
  , Promise = global.Promise
  , CraigslistQueryBuilder = require('./providers/craigslist/craigslist_query_builder.js')
  , CraigslistProvider = require('./providers/craigslist/craigslist_provider.js')
  , TransitInfoProvider = require('./providers/google/transit_info_provider.js');

console.log('Building query for craigslist query');
var query = new CraigslistQueryBuilder()
  .readFromFile('query.json')
  .build();

console.log('Constructing the TransitInfoProvider');
var transitInfoProvider = new TransitInfoProvider(env.GOOGLE_MAPS_API_KEY);

console.log('Querying Craigslist Feed for data');
new CraigslistProvider(query, transitInfoProvider)
  .fetchFeed()
  .then(feed => {
    console.log('Finding out the transit times for each of the posts');

    feed.getTransitTimesTo(env.work_address)
      .then(() => {
        var posts = feed.getPosts();

        console.log('Filtering out transit times > 45 minutes');

        feed.sortByPrice();
        feed.getPosts()
          .filter(post => {
            return post.transitTime / 60 < 45 || post.transitTime === null;
          }).map(post => {
            console.log({
              title: post.title,
              price: post.price
            });
          });
      });
  });
