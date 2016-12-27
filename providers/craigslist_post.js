class CraigslistPost {
  constructor(feedElement) {
    this.guid = feedElement.guid;
    this.title = feedElement.title;
    this.summary = feedElement.summary;
    this.link = feedElement.link;
    this.date = new Date(feedElement.date);
  }

  setLocation(latitude, longitude) {
    this.latitude = latitude;
    this.longitude = longitude;
  }
}

module.exports = CraigslistPost;
