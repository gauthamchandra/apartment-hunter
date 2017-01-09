const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CraigslistPostSchema = new Schema({
  // associate the post with a search query
  searchQuery: {
    type: String,
    required: true,
    index: true
  },
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
  price: {
    type: Number,
    required: true
  },
  latitude: Number,
  longitude: Number,
  markedSeen: Boolean,
  postLastUpdated: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// compile the schema and encapsulate it into a Model type
var CraigslistPostModel = mongoose.model('CraigslistPost', CraigslistPostSchema);

module.exports = CraigslistPostModel;
