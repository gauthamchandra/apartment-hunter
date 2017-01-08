const Promise = global.Promise
    , PromiseUtil = require('../promise_util.js')
    , mongoose = require('mongoose')
    , HOST = 'localhost' // will eventually configured via ENV var 
    , DB_NAME = 'apartment_search'
    , dbConnection = mongoose.connection
    , CraigslistPostModel = require('./craigslist/craigslist_post_model.js');

// make sure Mongoose uses standard promises.
mongoose.Promise = global.Promise;

/**
 * @see Connection#readyState
 * */
const MongooseConnectionState = {
  DISCONNECTED: 0,
  CONNECTED: 1,
  CONNECTING: 2,
  DISCONNECTING: 3
};

/**
 * Simple class to persist the post data to MongoDB
 * */
class PersistenceProvider {
  constructor() {
    this.promiseUtil = new PromiseUtil();
  }

  connect() {
    return new Promise((resolve, reject) => {
      if (this.isConnected()) {
        resolve();
        return;
      }

      mongoose.connect(`mongodb:\/\/${HOST}/${DB_NAME}`)
        .then(() => {
          resolve();
        }).catch(error => {
          reject(error);
        });
    });
  }

  disconnect() {
    if (!this.isConnected() && !this.isConnecting()) {
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      mongoose.disconnect()
        .then(() => {
          resolve();
        }).catch(error => {
          reject(error);
        });
    });
  }

  isConnected() {
    return mongoose.connection.readyState == MongooseConnectionState.CONNECTED;
  }

  isConnecting() {
    return mongoose.connection.readyState == MongooseConnectionState.CONNECTED;
  }

  /**
   * @param posts {CraigslistPost}
   * */
  createOrUpdateAll(posts) {
    return new Promise((resolve, reject) => {
      let savePromises = [];

      posts.forEach(post => {
        // in case its an update, it shouldn't update the _id that is added when we
        // construct the model object (trying to do otherwise results in ImmutableField error)
        var updateObj = post.getModel().toObject();
        delete updateObj._id;

        var promise = CraigslistPostModel.findOneAndUpdate(
            { link: post.link },
            updateObj,
            { upsert: true, new: true })
        .exec();

        savePromises.push(promise);
      });

      Promise.all(savePromises)
        .then(() => {
          resolve(posts);
        }).catch(error => {
          reject(error);
        });;
    });
  }

  getAllPosts() {
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
