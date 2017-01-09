const rootRelativeRequire = require('rfr')
    , scheduler = require('node-schedule')
    , es6BindAll = require('es6bindall')
    , PromiseUtil = rootRelativeRequire('app/promise_util')
    , CraigslistPostModel = rootRelativeRequire('app/providers/craigslist/craigslist_post_model')
    , PersistenceProvider = rootRelativeRequire('app/providers/persistence_provider')
    , ApartmentSearch = rootRelativeRequire('app/apartment_search')
    , SlackMessageBuilder = rootRelativeRequire('app/notifiers/slack_message_builder')
    , SlackNotifier = rootRelativeRequire('app/notifiers/slack_notifier')
    , log = require('npmlog')
    , TAG = 'SearchAndNotifyJob';

/**
 * Abstraction to encapsulate the scheduled job that runs every
 * so often to initiate the search and notify the user of the results via Slack
 * */
class SearchAndNotifyJob {
  constructor(pollIntervalInMinutes) {
    this.pollingInterval = pollIntervalInMinutes;
    this.job = null;

    es6BindAll(this, ['operation']);
  }

  operation() {
    log.info(TAG, 'Starting Operation...');

    var apartmentSearch = new ApartmentSearch()
      , persistenceProvider = new PersistenceProvider()
      , fetchedPosts;

    new PromiseUtil().inSeries(
        apartmentSearch.search,
        (posts) => {
          fetchedPosts = posts;

          log.verbose(TAG, 'Connecting to the DB');
          return persistenceProvider.connect();
        },
        () => {
          log.verbose(TAG, 'Connected');
          log.info(TAG, 'Saving relevant post results to the db');
          return persistenceProvider.createOrUpdateAll(fetchedPosts);
        },
        () => {
          log.info(TAG, `Retrieving posts updated in the last ${this.pollingInterval} minutes`);

          const now = Date.now();
          const ONE_INTERVAL_AGO = new Date(now - (1000 * 60 * this.pollingInterval));
          return CraigslistPostModel.where('updatedAt').gt(ONE_INTERVAL_AGO).exec();
        },
        (posts) => {
          log.info(TAG, 'Sending new/updated posts to Slack...');

          let slackNotifier = new SlackNotifier({
            webhook_url: process.env.SLACK_WEBHOOK_URL
          });

          let msg = '';

          log.verbose(TAG, 'Sorting by price first before sending...');
          posts.sort((post1, post2) => {
            if (post1.price > post2.price) {
              return 1;
            }
            else if (post1.price < post2.price) {
              return -1;
            }

            return 0;
          }).forEach(post => {
            msg += new SlackMessageBuilder()
              .addBoldText('Title:')
              .addNormalText(` ${post.title}`)
              .addNewLine()
              .addBoldText('Price:')
              .addNormalText(` ${post.price}`)
              .addNewLine()
              .addBoldText('Link:')
              .addNormalText(` ${post.link}`)
              .build();
          });

          slackNotifier.sendMessage(msg);

          log.verbose(TAG, 'Disconnecting from DB');
          return persistenceProvider.disconnect();
        },
        () => {
          log.info(TAG, 'Operation complete!');
        })
    .catch(error => {
      log.error(TAG, 'Encountered an error during job execution:', error);

      // cancel the job
      this.job.cancel();
    });
  }

  run() {
    this.job = scheduler.scheduleJob(`*/${this.pollingInterval} * * * *`, this.operation);
  }
}

module.exports = SearchAndNotifyJob;
