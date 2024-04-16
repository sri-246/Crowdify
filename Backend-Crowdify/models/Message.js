// Define MongoDB schema and model for messages
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    Sender: String,
    Content: String,
    ImageUri: String,
    latitude: Number,
    longitude:Number,
  });

messageSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Message', messageSchema);