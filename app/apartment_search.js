var rootRelativeRequire = require('rfr')
  , env = rootRelativeRequire('env.json')
  , Promise = global.Promise
  , PromiseUtil = rootRelativeRequire('app/promise_util')
  , CraigslistQueryBuilder = rootRelativeRequire('app/providers/craigslist/craigslist_query_builder')
  , CraigslistProvider = rootRelativeRequire('app/providers/craigslist/craigslist_provider')
  , TransitInfoProvider = rootRelativeRequire('app/providers/google/transit_info_provider');

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
  }

  _readQueryFromFile() {
    this.query = new CraigslistQueryBuilder()
      .readFromFile('query.json')
      .build();
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

          return Promise.resolve(posts);
        });
  }
}

module.exports = ApartmentSearch;
