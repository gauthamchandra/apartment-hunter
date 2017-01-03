var env = require('./env.json')
  , Promise = global.Promise
  , PromiseUtil = require('./promise_util.js')
  , CraigslistQueryBuilder = require('./providers/craigslist/craigslist_query_builder.js')
  , CraigslistProvider = require('./providers/craigslist/craigslist_provider.js')
  , TransitInfoProvider = require('./providers/google/transit_info_provider.js')
  , PersistenceProvider = require('./providers/persistence_provider.js');

/**
 * A wrapper around the Console
 * */  
var loggingEnabled = false;

function log() {
  if (loggingEnabled) {
    console.log.apply(this, arguments);
  }
};

function logError() {
  if (loggingEnabled) {
    console.error.apply(this, arguments);
  }
}

class ApartmentSearch {
  constructor(verbose = true) {
    loggingEnabled = verbose;

    this.query = null;
    this.persistenceProvider = new PersistenceProvider();
  }

  _readQueryFromFile() {
    this.query = new CraigslistQueryBuilder()
      .readFromFile('query.json')
      .build();
  }

  _saveToDb(posts) {
    log('Connecting to the DB');

    return new PromiseUtil().inSeries(
        this.persistenceProvider.connect,
        () => {
          log('Connected');
          log('Saving relevant post results to the db');
          this.persistenceProvider.createOrUpdateAll(posts);
        });
  }

  search() {
    var craigslistFeed = null;

    return new PromiseUtil().inSeries(
        () => {
          log('Constructing craigslist query from file...');
          this._readQueryFromFile();

          log('Constructing TransitInfoProvider...');
          var transitInfoProvider = new TransitInfoProvider(env.GOOGLE_MAPS_API_KEY);

          log('Querying Craigslist Feed for data...');
          return new CraigslistProvider(this.query, transitInfoProvider).fetchFeed();
        },
        (feed) => {
          craigslistFeed = feed;

          log('Finding out the transit times for each of the posts');
          return feed.getTransitTimesTo(env.work_address);
        },
        () => {
          var posts = craigslistFeed.getPosts();

          log('Sorting results by price');
          craigslistFeed.sortByPrice();

          log('Filtering out transit times > 45 minutes');
          posts = craigslistFeed.getPosts()
            .filter(post => {
              return post.transitTime / 60 < 45 ||
                post.transitTime === null;
            });

          return this._saveToDb(posts);
        },
        this.persistenceProvider.getAllPosts).then(() => {
          log('Disconnecting from DB');
          this.persistenceProvider.disconnect();
        }).catch((error) => {
          logError('Encountered error', error);
        });
  }
}

module.exports = ApartmentSearch;
