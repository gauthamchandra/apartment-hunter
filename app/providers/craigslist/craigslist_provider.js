var fetch = require('node-fetch')
  , Promise = global.Promise
  , cheerio = require('cheerio')
  , feedparser = require('feedparser-promised')
  , CraigslistQuery = require('./craigslist_query')
  , CraigslistFeed = require('./craigslist_feed')
  , CraigslistPost = require('./craigslist_post');

const MAC_USER_AGENT = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/55.0.2883.95 Safari/537.36';

const fetchOptions = {
  headers: {
    // add a user agent as part of the spoofing
    'User-Agent': MAC_USER_AGENT,
    'Accept': 'text/html,application/xhtml+xml'
  },
  method: 'GET',
  redirect: 'follow', // follow redirects
  follow: 5           // max # of redirects to follow
};

class CraigslistProvider {
  /**
   * @param cquery {CraigslistQuery}
   * @param transitInfoProvider {TransitInfoProvider}
   * */
  constructor(cquery, transitInfoProvider) {
    if (!cquery || !(cquery instanceof CraigslistQuery)) {
      throw new Error('Need a valid query url to proceed!');
    }

    this._query = cquery.getQueryUrl();
    this._exclusionCriteria = cquery.getExclusionFilters();
    this._feedResults = [];
    this._promise = null;
    this._transitInfoProvider = transitInfoProvider;
  }

  /**
   * Fetches the root feed from Craigslist, parses it and then iterates through the individual
   * items, querying them along the way for more details 
   * */
  fetchFeed() {
    var promise = new Promise((resolve, reject) => {
      var postPromises = [];

      feedparser.parse(this._query)
        .then(items => {
          items.forEach(item => {
            postPromises.push(this.fetchPost(item.link, new CraigslistPost(item)));
          });

          Promise.all(postPromises)
            .then(posts => {
              // exclude any posts that meet the exclusion criteria
              resolve(new CraigslistFeed(
                    this.filterByExclusionCriteria(posts),
                    this._transitInfoProvider));
            }).catch(error => {
              reject(error);
            });
        });
    });

    return promise;
  }

  /**
   * Fetches the individual post information
   *
   * @param url - the url to request the page
   * @param post - the object to set the values on
   * */
  fetchPost(url, post) {
    var promise = new Promise((resolve, reject) => {

      fetch(url, fetchOptions)
        .then(response => {
          // get as html string
          return response.text();
        }).then(body => {
          // load html string into cut down jQuery implementation
          const $ = cheerio.load(body);
          let latitude = $('#map').attr('data-latitude');
          let longitude = $('#map').attr('data-longitude');
          let summary = $('#postingbody').text();
          let price = $('.price').text();
          
          post.setLocation(latitude, longitude);
          post.price = price;

          if (summary) {
            post.setBody(summary);
          }

          resolve(post);
        }).catch(error => {
          reject(error);
        });
    });

    return promise;
  }

  /**
   * Applies exclusion criteria and filters
   * the results. If no filters were specified,
   * then the original set is returned
   * */
  filterByExclusionCriteria(posts) {
    if (this._exclusionCriteria.length === 0) {
      return posts;
    }
    else {
      return posts.filter(post => {
        for (let i = 0; i < this._exclusionCriteria.length; i++) {
          var exclusionFilter = this._exclusionCriteria[i];

          if (post.getBody().indexOf(exclusionFilter) >= 0) {
            return false;
          }
        }

        return true;
      });
    }
  }
}

module.exports = CraigslistProvider;
