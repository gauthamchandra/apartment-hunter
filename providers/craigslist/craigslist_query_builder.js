var path = require('path')
  , querystring = require('querystring')
  , CraigslistQuery = require('./craigslist_query.js');

class CraigslistQueryBuilder {
  constructor() {
    this.options = { format: 'rss' };
  }

  /**
   * Convenience method to move the query configuration to a
   * json file
   * */
  readFromFile(pathRelativeToProjectRoot) {
    var projectRoot = path.dirname(require.main.filename);
    var json = require(`${projectRoot}/${pathRelativeToProjectRoot}`);

    if (typeof json.region === 'string') {
      this.setLocation(json.region);
    }
    if (typeof json.min_price === 'number') {
      this.setMinimumPrice(json.min_price);
    }
    if (typeof json.max_price === 'number') {
      this.setMaximumPrice(json.max_price);
    }
    if (typeof json.min_bedroms === 'number') {
      this.setMinimumBedrooms(json.min_bedrooms);
    }
    if (typeof json.min_bathrooms === 'number') {
      this.setMinimumBathrooms(json.min_bathrooms);
    }
    if (typeof json.search_postal_code === 'number' &&
        typeof json.search_radius === 'number') {
      this.within(json.search_postal_code, json.search_radius);
    }
    if (!!json.apartments_only) {
      this.filterToApartments();
    }
    if (!!json.bundle_duplicates) {
      this.bundleDuplicates();
    }
    if (!!json.posts_with_images_only) {
      this.filterToPostsWithImages();
    }
    if (json.exclude instanceof Array) {
      this.setExclusionFilters(json.exclude);
    }

    return this;
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
