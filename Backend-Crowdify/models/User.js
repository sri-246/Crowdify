// User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    },
    speed: Number,
    altitudeAccuracy: Number,
    accuracy: Number,
    heading: Number
  },
  pushToken: String,
  receivedMessages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }] // New field to store received messages
});

// Define a 2dsphere index on the location field
userSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('User', userSchema);
