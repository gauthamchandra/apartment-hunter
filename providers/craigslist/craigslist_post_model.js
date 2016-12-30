const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// define db schema
const CraigslistPostSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: String,
  link: {
    type: String,
    unique: true,
    required: true
  },
  latitude: Number,
  longitude: Number,
  markedSeen: Boolean,
  lastUpdated: {
    type: Date,
    required: true
  }
}, {
  strict: true
});

// compile the schema and encapsulate it into a Model type
var CraigslistPostModel = mongoose.model('CraigslistPost', CraigslistPostSchema);

module.exports = CraigslistPostModel;
