var CraigslistPostModel = require('./craigslist_post_model');

class CraigslistPost {
  constructor(feedElement) {
    this.title = feedElement.title;
    this.summary = feedElement.summary;
    this.link = feedElement.link;
    this.date = new Date(feedElement.date);

    // make sure to save the meta attributes
    // really only used for checking the feed update time
    this.meta = feedElement.meta;

    // will be set later
    this.transitTime = null;
    this.price = null;
  }

  setLocation(latitude, longitude) {
    this.location = {
      lat: latitude,
      lng: longitude
    };
  }

  setBody(body) {
    this.summary = body;
  }

  getBody() {
    return this.summary;
  }

  getOriginalQuery() {
    return this.meta.link;
  }

  /**
   * Returns a mongoose model object with the required data
   * to persist to the database.
   *
   * @return {Mongoose.Model}
   * */
  getModel() {
    return new CraigslistPostModel({
      searchQuery: this.getOriginalQuery(),
      title: this.title,
      body: this.getBody(),
      price: this.price,
      link: this.link,
      latitude: this.location.lat,
      longitude: this.location.lng,
      markedSeen: false,
      postLastUpdated: this.date
    });
  }
}

module.exports = CraigslistPost;
