// Server.js

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); 

//const { sendNotification } = require('./notificationService'); // Import notification sending function
const { calculateNearbyUsers } = require('./nearbyUserService'); // Import nearby user calculation function
const { sendNotification } = require('./notificationService');
const User = require('./models/User'); // Import the User model
const Message = require('./models/Message');
const ChatMessage = require('./models/ChatMessage'); // Import the Message model

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);
io.use(cors())
const MONGODB_URI = 'mongodb+srv://kamalnath123:2kx0jjefOTT0RCAX@portfolio.hbkryah.mongodb.net/Details?retryWrites=true&w=majority&appName=CrowdifyUser'; // Update with your MongoDB URI

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

  io.on('connection', (socket) => {
    console.log('User connected');
  
    // Handle incoming chat messages
    socket.on('chatmessage', async (msg) => {
      try {
        // Save message data to MongoDB
        const message = new ChatMessage({
          sender: msg.sender,
          recipient:msg.recipient,
          content: msg.content,
        });
        await message.save();
  
        // Broadcast message to all clients
        io.emit('chatmessage', message);
      } catch (error) {
        console.error('Error saving message data:', error);
      }
    });
  
    // Handle disconnection
    socket.on('disconnect', () => {
      console.log('User disconnected');
    });
  });  
  server.listen(PORT, () => {
    console.log(`Express server and socket.io server are running on port ${PORT}`);
  });
  
// User registration route
app.post('/api/user', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    const { username, email,profile, location, pushToken } = req.body;

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
        profile,
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
    const { sender, content, imageUri,audioUri, latitude, longitude } = req.body;

    // Save message data to MongoDB
    const message = new Message({
      Sender: sender,
      Content: content,
      ImageUri: imageUri,
      AudioUri:audioUri,
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
//chat message
app.get('/api/chatmessages/:sender/:recipient', async (req, res) => {
  try {
    const { sender, recipient } = req.params;
    // Fetch chat messages for the specified sender and recipient
    const messages = await ChatMessage.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender } // Include messages sent in reverse order as well
      ]
    }).sort({ createdAt: 1 }); // Sort messages by createdAt timestamp
    console.log(messages)
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/accept', async (req, res) => {
  try {
    const { senderEmail, acceptorEmail } = req.body;
    console.log("mass")
    // Find the sender and acceptor users by email
    const sender = await User.findOne({ email: senderEmail });
    const acceptor = await User.findOne({ email: acceptorEmail });

    if (!sender || !acceptor) {
      return res.status(404).json({ error: 'Sender or acceptor not found' });
    }
    const Truee = sender.chatParticipants.some(participant => participant.equals(acceptor._id))//correct here
    // Add acceptor to the sender's chatParticipants list
    if(Truee){//complete
      res.status(200).json({ message: 'Accepted,User already in' });
    }
    else{
    sender.chatParticipants.push(acceptor._id);
    await sender.save();

    // Add sender to the acceptor's chatParticipants list
    acceptor.chatParticipants.push(sender._id);
    await acceptor.save();
    res.status(200).json({ message: 'Chat request accepted successfully' });
    }
    
  } catch (error) {
    console.error('Error accepting chat request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Fetch chat list route
app.get('/api/chats/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;

    // Find the user by email
    const user = await User.findOne({ email: userEmail }).populate('chatParticipants');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Extract the chat participants from the user object
    const chats = user.chatParticipants;

    res.status(200).json({ chats });
  } catch (error) {
    console.error('Error fetching chat list:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
