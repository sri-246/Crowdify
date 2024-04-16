// Server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); 

const User = require('./models/User'); // Import the User model
const Message = require('./models/Message'); // Import the Message model

const app = express();

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());

const MONGODB_URI = 'mongodb+srv://kamalnath123:2kx0jjefOTT0RCAX@portfolio.hbkryah.mongodb.net/Details?retryWrites=true&w=majority&appName=CrowdifyUser'; // Update with your MongoDB URI

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

// User registration route
app.post('/api/user', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    const { username, email, location } = req.body;

    // Save user data to MongoDB
    const user = new User({
      username,
      email,
      location: {
        speed: location.speed,
        altitudeAccuracy: location.altitudeAccuracy,
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        heading: location.heading
      }
    });
    await user.save();

    res.status(201).json({ message: 'User data saved successfully' });
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Message creation route
app.post('/api/message', async (req, res) => {
  console.log('Received message request:', req.body);
  try {
    const { sender, content, imageUri, latitude,longitude} = req.body;

    // Save message data to MongoDB
    const message = new Message({
      Sender: sender,
      Content: content,
      ImageUri: imageUri,
      latitude:latitude,
      longitude:longitude,
    });
    await message.save();

    res.status(201).json({ message: 'Message data saved successfully' });
  } catch (error) {
    console.error('Error saving message data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
