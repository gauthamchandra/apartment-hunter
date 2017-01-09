// load all env variables needed by the app
require('dotenv').config();

const rootRelativeRequire = require('rfr')
    , PromiseUtil = rootRelativeRequire('app/promise_util')
    , CraigslistPostModel = rootRelativeRequire('app/providers/craigslist/craigslist_post_model')
    , PersistenceProvider = rootRelativeRequire('app/providers/persistence_provider')
    , ApartmentSearch = rootRelativeRequire('app/apartment_search')
    , SlackMessageBuilder = rootRelativeRequire('app/notifiers/slack_message_builder')
    , SlackNotifier = rootRelativeRequire('app/notifiers/slack_notifier')
    , env = rootRelativeRequire('env.json')
    , log = require('npmlog')
    , TAG = 'main';

var apartmentSearch = new ApartmentSearch()
  , persistenceProvider = new PersistenceProvider()
  , job = null
  , fetchedPosts;

new PromiseUtil().inSeries(
    apartmentSearch.search,
    (posts) => {
      fetchedPosts = posts;

      log.info(TAG, 'Connecting to the DB');
      return persistenceProvider.connect();
    },
    () => {
      log.info(TAG, 'Connected');
      log.info(TAG, 'Saving relevant post results to the db');
      return persistenceProvider.createOrUpdateAll(fetchedPosts);
    },
    () => {
      log.info(TAG, 'Retrieving posts updated in the last 5 minutes');

      const now = Date.now();
      var FIVE_MIN_AGO = new Date(now - (1000 * 60 * 5));
      return CraigslistPostModel.where('updatedAt').gt(FIVE_MIN_AGO).exec();
    },
    (posts) => {
      log.info(TAG, 'Number of posts updated within the last 5 minutes:', posts.length);

      log.info(TAG, 'Disconnecting from DB');
      return persistenceProvider.disconnect();
    })
.catch(error => {
  log.error(TAG, 'Encountered an error during main program execution:', error);
});
