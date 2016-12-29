var querystring = require('querystring')
  , CraigslistQuery = require('./craigslist_query.js');

class CraigslistQueryBuilder {
  constructor() {
    this.options = { format: 'rss' };
  }

  setLocation(loc) {
    this.location = loc;
    return this;
  }

  setExclusionFilters(exclusionStrings) {
    this.exclusionFilters = exclusionStrings;
    return this;
  }

  setMinimumPrice(price) {
    if (typeof price === 'number' &&
        price >= 0) {
      this.options.min_price = price;
    }
    return this;
  }

  setMaximumPrice(price) {
    if (typeof price === 'number' &&
        price >= 0) {
      this.options.max_price = price;
    }

    return this;
  }

  setMinimumBedrooms(num) {
    this.options.bedrooms = num;
    return this;
  }

  setMinimumBathrooms(num) {
    this.options.bathrooms = num;
    return this;
  }

  filterToPostsWithImages() {
    this.options.hasPic = 1;
    this.options.availabilityMode = 0;
    return this;
  }

  filterToApartments() {
    this.options.housing_type = 1;
    return this;
  }

  /**
   * Used to specify a search radius
   *
   * @param zipcode - the specified center of the search radius
   * @param miles - the number of miles
   * */
  within(zipcode, miles) {
    if (typeof zipcode === 'number' &&
        typeof miles === 'number') {
      this.options.postal = zipcode;
      this.options.search_distance = miles;
    }

    return this;
  }

  bundleDuplicates() {
    this.options.bundleDuplicates = 1;
    return this;
  }

  build() {
    let queryUrl = `http:\/\/${this.location}.craigslist.org/search/aap?${querystring.stringify(this.options)}`;
    return new CraigslistQuery(queryUrl, this.exclusionFilters);
  }
}

module.exports = CraigslistQueryBuilder;
