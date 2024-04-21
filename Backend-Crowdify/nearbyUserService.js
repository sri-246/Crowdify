// nearbyUserService.js

const User = require('./models/User');

// Function to calculate nearby users
async function calculateNearbyUsers(latitude, longitude, radius) {
  try {
    const nearbyUsers = await User.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
    });
    console.log('Nearby users:', nearbyUsers);
    return nearbyUsers;
  } catch (error) {
    console.error('Error calculating nearby users:', error);
    return [];
  }
}

module.exports = { calculateNearbyUsers };
