var querystring = require('querystring');

class CraigslistQueryBuilder {
  constructor() {
    this.options = { format: 'rss' };
  }

  setLocation(loc) {
    this.location = loc;
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

  bundleDuplicates() {
    this.options.bundleDuplicates = 1;
    return this;
  }

  build() {
    return `http:\/\/${this.location}.craigslist.org/search/aap?${querystring.stringify(this.options)}`;
  }
}

module.exports = CraigslistQueryBuilder;
