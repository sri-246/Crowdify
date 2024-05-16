// models/ChatMessage.js

const mongoose = require('mongoose');

const chatmessageSchema = new mongoose.Schema({
  sender:String,
  recipient:String,
  content:String,
  createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model('ChatMessage', chatmessageSchema);
