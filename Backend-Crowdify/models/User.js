// User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  location: {
    speed: Number,
    altitudeAccuracy: Number,
    latitude: Number,
    longitude: Number,
    accuracy: Number,
    heading: Number
  }
});

userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
