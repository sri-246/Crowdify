// routes/userRoutes.js

const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming your user model is defined in User.js

// Route for user registration
router.post('/register', async (req, res) => {
  try {
    const { username, email } = req.body;
    const newUser = await User.create({ username, email });
    res.status(201).json(newUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for user login
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Route for updating user location
router.put('/location/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { latitude, longitude } = req.body;
    const user = await User.findByIdAndUpdate(userId, { location: { type: 'Point', coordinates: [longitude, latitude] } }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
