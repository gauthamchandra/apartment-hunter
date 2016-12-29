class CraigslistFeed {
  /**
   * @param items {Array<CraigslistPost>} - the craigslist posts
   * @param transitInfoProvider {TransitInfoProvider} an instance of the transit info provider
   * */
  constructor(items, transitInfoProvider) {
    this._items = items || [];
    this._transitInfoProvider = transitInfoProvider;

    if (!this._transitInfoProvider) {
      throw new Error('a TransitInfoProvider instance must be provided!');
    }
  }

  dedup() {
    var dedupMap = {};
    this._items.forEach(post => {
      if ((dedupMap[post.title] && dedupMap[post.title].date < post.date) ||
          !dedupMap[post.title]) {
        dedup[post.title] = post;  
      }
    });

    var items = []; 
    for (key in dedupMap) {
       if (dedupMap.hasOwnProperty(key)) {
         items.push(dedupMap[key]);
       }
    }

    return items;
  }

  sortByPrice() {
    return this._items.sort((post1, post2) => {
      var price1 = parseInt(post1.price.replace('$', ''), 10)
        , price2 = parseInt(post2.price.replace('$', ''), 10);

      if (price1 > price2) {
        return 1;
      }
      else if (price1 < price2) {
        return -1;
      }

      return 0;
    });
  }

  getPosts() {
    return this._items;
  }

  getTransitTimesTo(address) {
    return new Promise((resolve, reject) => {
      if (this._items.length === 0) {
        resolve(this._items);
        return;
      }

      // grab the latitude and longitude for said address. 
      this._transitInfoProvider.getLatLng(address)
        .then(latlng => {
          // query transit times for each post
          let transitTimePromises = [];

          this._items.forEach(post => {
            var promise = this._transitInfoProvider.getTransitTime(latlng, post.location)
              .then(transitTime => {
                post.transitTime = transitTime;
              });

            transitTimePromises.push(promise);
          });

          Promise.all(transitTimePromises)
            .then(transitTimes => {
              resolve(transitTimes);
            }).catch(error => reject(error));
        }).catch(error => {
          reject(error);
        });
    });
  }
}

module.exports = CraigslistFeed;
