// Server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors'); 

//const { sendNotification } = require('./notificationService'); // Import notification sending function
const { calculateNearbyUsers } = require('./nearbyUserService'); // Import nearby user calculation function
const { sendNotification } = require('./notificationService');
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
    const { username, email, location, pushToken } = req.body;

    // Check if the user already exists in the database
    let user = await User.findOne({ email });

    // If the user exists, update their location
    if (user) {
      user.location = {
        type: 'Point',
        coordinates: [location.coords.longitude, location.coords.latitude],
        speed: location.coords.speed,
        altitudeAccuracy: location.coords.altitudeAccuracy,
        accuracy: location.coords.accuracy,
        heading: location.coords.heading
      };
      await user.save();
      const id = user._id;
      res.status(201).json({ message: 'User data saved successfully', id });
    } else {
      // If the user doesn't exist, create a new user with the provided data
      user = new User({
        username,
        email,
        location: {
          type: 'Point',
          coordinates: [location.coords.longitude, location.coords.latitude],
          speed: location.coords.speed,
          altitudeAccuracy: location.coords.altitudeAccuracy,
          accuracy: location.coords.accuracy,
          heading: location.coords.heading
        },
        pushToken
      });
      await user.save();
      const id = user._id;
      res.status(201).json({ message: 'User data saved successfully', id });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/user/location', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    const { email,latitude,longitude } = req.body;

    //Check if the user already exists in the database
    let user = await User.findOne({ email });

    //If the user exists, update their location
    if (user) {
      user.location = {
        type: 'Point',
        coordinates: [longitude,latitude],
      };
      await user.save();
      res.status(201).json({ message: 'User data saved successfully' });
    }else{
      console.log("User not found")
        res.status(201).json({ message: ' Not saved ' });
    }
  }
   catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
  
});

// Message creation route
app.post('/api/message', async (req, res) => {
  console.log('Received message request:', req.body);
  try {
    const { sender, content, imageUri, latitude, longitude } = req.body;

    // Save message data to MongoDB
    const message = new Message({
      Sender: sender,
      Content: content,
      ImageUri: imageUri,
      latitude: latitude,
      longitude: longitude,
    });
    await message.save();

    // Calculate nearby users
    const radius = 2000; // Define your radius in meters
    const nearbyUsers = await calculateNearbyUsers(latitude, longitude, radius);
    const filteredNearbyUsers = nearbyUsers.filter(user => user.email !== sender);

    // Send notifications to filtered nearby users
    for (const user of filteredNearbyUsers) {
      await User.findByIdAndUpdate(user._id, {
        $push: { receivedMessages: message._id }
      });
    }

    filteredNearbyUsers.forEach(async (user) => {
    console.log("Message",message)
    await sendNotification(user, message);

     });

    res.status(201).json({ message: 'Message data saved successfully' });
  } catch (error) {
    console.error('Error saving message data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/fetchmessage/:email', async (req, res) => {
  try {
    // Get the email from request parameters
    console.log("got it")
    console.log(req.params.email)
    const email = req.params.email;

    // Find the user by email and populate the receivedMessages field
    const user = await User.findOne({ email }).populate('receivedMessages');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract the received messages from the user object
    const receivedMessages = user.receivedMessages;


    // Return the received messages
    res.status(200).json({ receivedMessages });
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
