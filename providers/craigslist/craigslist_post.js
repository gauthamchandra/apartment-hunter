class CraigslistPost {
  constructor(feedElement) {
    this.guid = feedElement.guid;
    this.title = feedElement.title;
    this.summary = feedElement.summary;
    this.link = feedElement.link;
    this.date = new Date(feedElement.date);

    // make sure to save the meta attributes
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
}

module.exports = CraigslistPost;
