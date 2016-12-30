const Promise = global.Promise
    , PromiseUtil = require('../promise_util.js')
    , mongoose = require('mongoose')
    , HOST = 'localhost' // will eventually configured via ENV var 
    , DB_NAME = 'apartment_search'
    , dbConnection = mongoose.connection
    , CraigslistPostModel = require('./craigslist/craigslist_post_model.js');

// make sure Mongoose uses standard promises.
mongoose.Promise = global.Promise;

var isConnected = false;

/**
 * Simple class to persist the post data to MongoDB
 * */
class PersistenceProvider {
  constructor() {
    this.promiseUtil = new PromiseUtil();
  }

  connect() {
    return new Promise((resolve, reject) => {
      mongoose.connect(`mongodb:\/\/${HOST}/${DB_NAME}`)
        .then(() => {
          isConnected = true;
          resolve();
        }).catch(error => {
          reject(error);
        });
    });
  }

  disconnect() {
    mongoose.disconnect();
    isConnected = false;
  }

  isConnected() {
    return isConnected;
  }

  /**
   * @param posts {CraigslistPost}
   * */
  createOrUpdateAll(posts) {
    console.log('Saving Posts: ', posts.length);


    return new Promise((resolve, reject) => {
      let savePromises = [];

      posts.forEach(post => {
        savePromises.push(post.getModel().save());
      });

      Promise.all(savePromises)
        .then(() => {
          resolve();
        }).catch(error => {
          reject(error);
        });;
    });
  }

  getAllPosts() {
    console.log('Retrieving from DB:');

    return new Promise((resolve, reject) => {
      CraigslistPostModel
        .find({}).then(postModels => {
          resolve(postModels);
        }).catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = PersistenceProvider;
