const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const { calculateNearbyUsers } = require('./nearbyUserService');
const { sendNotification } = require('./notificationService');
const User = require('./models/User');
const Message = require('./models/Message');
const ChatMessage = require('./models/ChatMessage');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server);

const MONGODB_URI = 'mongodb+srv://kamalnath123:2kx0jjefOTT0RCAX@portfolio.hbkryah.mongodb.net/Details?retryWrites=true&w=majority&appName=CrowdifyUser';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB Atlas:', error);
  });

const userSockets = {};

io.on('connection', (socket) => {
  console.log('User connected');

  // Register user socket ID
  socket.on('register', (email) => {
    userSockets[email] = socket.id;
  });

  // Handle incoming chat messages
  socket.on('chatmessage', async (msg) => {
    try {
      const message = new ChatMessage({
        sender: msg.sender,
        recipient: msg.recipient,
        content: msg.content,
      });
      await message.save();
      io.emit('chatmessage', message);
    } catch (error) {
      console.error('Error saving message data:', error);
    }
  });

  // Handle location request
  socket.on('locationrequest', (request) => {
    const recipientSocketId = userSockets[request.recipient];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('locationrequest', request);
    }
  });

  // Handle location response
  socket.on('locationresponse', (response) => {
    const recipientSocketId = userSockets[response.recipient];
    if (recipientSocketId) {
      io.to(recipientSocketId).emit('locationresponse', response);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    for (const email in userSockets) {
      if (userSockets[email] === socket.id) {
        delete userSockets[email];
        break;
      }
    }
    console.log('User disconnected');
  });
});

server.listen(4000, () => {
  console.log(`Socket.io server is running on port 4000`);
});

app.post('/api/user', async (req, res) => {
  console.log('Received request:', req.body);
  try {
    const { username, email, profile, location, pushToken } = req.body;
    let user = await User.findOne({ email });
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
    const { email, latitude, longitude } = req.body;
    let user = await User.findOne({ email });
    if (user) {
      user.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
      await user.save();
      res.status(201).json({ message: 'User data saved successfully' });
    } else {
      console.log("User not found")
      res.status(201).json({ message: 'Not saved' });
    }
  } catch (error) {
    console.error('Error saving user data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/message', async (req, res) => {
  console.log('Received message request:', req.body);
  try {
    const { sender, content, imageUri, audioUri, latitude, longitude } = req.body;

    // Find the user by email to get the user ID
    const user = await User.findOne({ email: sender });
    if (!user) {
      return res.status(404).json({ error: 'Sender not found' });
    }

    const message = new Message({
      Sender: user._id,
      Content: content,
      ImageUri: imageUri,
      AudioUri: audioUri,
      latitude: latitude,
      longitude: longitude,
    });

    await message.save();

    const radius = 2000;
    const nearbyUsers = await calculateNearbyUsers(latitude, longitude, radius);
    const filteredNearbyUsers = nearbyUsers.filter(user => user.email !== sender);

    for (const user of filteredNearbyUsers) {
      await User.findByIdAndUpdate(user._id, {
        $push: { receivedMessages: message._id }
      });
    }

    filteredNearbyUsers.forEach(async (user) => {
      console.log("Message", message);
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
    console.log("Received fetch message request for:", req.params.email);
    const email = req.params.email;

    // Find the user by email and populate the receivedMessages
    const user = await User.findOne({ email }).populate({
      path: 'receivedMessages',
      populate: {
        path: 'Sender',  // Populate the Sender field inside each Message
        model: 'User',
        select: 'username email profile'  // Specify fields to select, if necessary
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const receivedMessages = user.receivedMessages;
    res.status(200).json({ receivedMessages });
  } catch (error) {
    console.error('Error fetching received messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.get('/api/chatmessages/:sender/:recipient', async (req, res) => {
  try {
    const { sender, recipient } = req.params;
    const messages = await ChatMessage.find({
      $or: [
        { sender, recipient },
        { sender: recipient, recipient: sender }
      ]
    }).sort({ createdAt: 1 });
    console.log(messages);
    res.json(messages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/api/accept', async (req, res) => {
  try {
    const { senderEmail, acceptorEmail } = req.body;
    console.log("mass");
    const sender = await User.findOne({ email: senderEmail });
    const acceptor = await User.findOne({ email: acceptorEmail });
    if (!sender || !acceptor) {
      return res.status(404).json({ error: 'Sender or acceptor not found' });
    }
    const Truee = sender.chatParticipants.some(participant => participant.equals(acceptor._id));
    if (Truee) {
      res.status(200).json({ message: 'Accepted,User already in' });
    } else {
      sender.chatParticipants.push(acceptor._id);
      await sender.save();
      acceptor.chatParticipants.push(sender._id);
      await acceptor.save();
      res.status(200).json({ message: 'Chat request accepted successfully' });
    }
  } catch (error) {
    console.error('Error accepting chat request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/chats/:email', async (req, res) => {
  try {
    const userEmail = req.params.email;
    const user = await User.findOne({ email: userEmail }).populate('chatParticipants');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
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