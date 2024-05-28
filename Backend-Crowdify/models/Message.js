// Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    Sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    Content: String,
    ImageUri: String,
    AudioUri: String,
    latitude: Number,
    longitude:Number,
  });

messageSchema.index({ location: '2dsphere' });
module.exports = mongoose.model('Message', messageSchema);