var rootRelativeRequire = require('rfr')
  , es6BindAll = require('es6bindall')
  , log = require('npmlog')
  , Promise = global.Promise
  , PromiseUtil = rootRelativeRequire('app/promise_util')
  , CraigslistQueryBuilder = rootRelativeRequire('app/providers/craigslist/craigslist_query_builder')
  , CraigslistProvider = rootRelativeRequire('app/providers/craigslist/craigslist_provider')
  , TransitInfoProvider = rootRelativeRequire('app/providers/google/transit_info_provider')
  , TAG = 'ApartmentSearch';

class ApartmentSearch {
  constructor() {
    this.query = null;

    es6BindAll(this, ['_readQueryFromFile', 'search']);
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
          log.info(TAG, 'Constructing craigslist query from file...');
          this._readQueryFromFile();

          log.info(TAG, 'Constructing TransitInfoProvider...');
          var transitInfoProvider = new TransitInfoProvider(process.env.GOOGLE_MAPS_API_KEY);

          log.info(TAG, 'Querying Craigslist Feed for data...');
          return new CraigslistProvider(this.query, transitInfoProvider).fetchFeed();
        },
        (feed) => {
          craigslistFeed = feed;

          log.info(TAG, 'Finding out the transit times for each of the posts');
          return feed.getTransitTimesTo(process.env.WORK_ADDRESS);
        },
        () => {
          var posts = craigslistFeed.getPosts();

          log.info(TAG, 'Filtering out transit times > 45 minutes');
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
