var PromiseUtil = require('./promise_util.js')
  , CraigslistPostModel = require('./providers/craigslist/craigslist_post_model.js')
  , PersistenceProvider = require('./providers/persistence_provider.js')
  , ApartmentSearch = require('./apartment_search.js')
  , SlackMessageBuilder = require('./notifiers/slack_message_builder.js')
  , SlackNotifier = require('./notifiers/slack_notifier.js')
  , env = require('./env.json');

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
      log('Disconnecting from DB');
      return this.persistenceProvider.disconnect();
    })
.catch(error => {
  console.error('Encountered an error during main program execution:', error);
});
