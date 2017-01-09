// load all env variables needed by the app
require('dotenv').config();

const rootRelativeRequire = require('rfr')
    , PromiseUtil = rootRelativeRequire('app/promise_util')
    , S3Provider = rootRelativeRequire('app/providers/s3_provider')
    , SearchAndNotifyJob = rootRelativeRequire('app/search_and_notify_job')
    , log = require('npmlog')
    , TAG = 'main';

const EnvironmentType = {
  LOCAL: 'dev',
  HOSTED: 'hosted'
};

new PromiseUtil().inSeries(
    () => {
      log.info(TAG, 'Reading environment type...');

      if (process.env.APP_ENV !== EnvironmentType.LOCAL) {
        log.info(TAG, 'Non local env detected. Pulling Search Query config down from S3');

        const s3Provider = new S3Provider(
            process.env.S3_ACCESS_KEY,
            process.env.S3_SECRET,
            process.env.S3_REGION);

        return s3Provider.downloadFile(process.env.S3_BUCKET, 'query.json', 'query.json');
      }

      log.info(TAG, 'Local environment detected. Assuming query file is here locally');
      return Promise.resolve();
    },
    () => {
      log.info(TAG, 'Kicking off search job every 6 hours');

      //TODO: This should be an ENV var
      new SearchAndNotifyJob(360).run();
    })
.catch(error => {
  log.error(TAG, 'Encountered an error during main program execution:', error);
});
