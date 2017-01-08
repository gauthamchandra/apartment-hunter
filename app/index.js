var rootRelativeRequire = require('rfr')
  , PromiseUtil = rootRelativeRequire('app/promise_util')
  , CraigslistPostModel = rootRelativeRequire('app/providers/craigslist/craigslist_post_model')
  , PersistenceProvider = rootRelativeRequire('app/providers/persistence_provider')
  , ApartmentSearch = rootRelativeRequire('app/apartment_search')
  , SlackMessageBuilder = rootRelativeRequire('app/notifiers/slack_message_builder')
  , SlackNotifier = rootRelativeRequire('app/notifiers/slack_notifier')
  , env = rootRelativeRequire('env.json');

var apartmentSearch = new ApartmentSearch(true)
  , persistenceProvider = new PersistenceProvider()
  , job = null
  , fetchedPosts;

new PromiseUtil().inSeries(
    apartmentSearch.search,
    (posts) => {
      fetchedPosts = posts;

      log('Connecting to the DB');
      return this.persistenceProvider.connect();
    },
    () => {
      log('Connected');
      log('Saving relevant post results to the db');
      return this.persistenceProvider.createOrUpdateAll(fetchedPosts);
    },
    () => {
      log('Retrieving posts updated in the last 5 minutes');

      var now = Date.now();
      var FIVE_MIN_AGO = new Date(now.getTime() - (1000 * 60 * 5));
      CraigslistPostModel.where('updatedAt').gt(FIVE_MIN_AGO).then(models => {
        log('Posts updated within the last 5 min:', posts.length);
      });
    },
    () => {
      log('Disconnecting from DB');
      return this.persistenceProvider.disconnect();
    })
.catch(error => {
  console.error('Encountered an error during main program execution:', error);
});
