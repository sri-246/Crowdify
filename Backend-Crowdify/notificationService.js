// notificationService.js

const { Expo } = require('expo-server-sdk');
const expo = new Expo();

const sendNotification = async (user, message) => {
    // Prepare the notification message
    const notification = {
      to: user.pushToken, // Assuming you have an expoPushToken field for each user
      sound: 'default',
      title: 'Hey Buddy!',
      body: `You have a new request from ${message.Sender}`,
      
    };
  
    // Send the notification
    try {
      const receipt = await expo.sendPushNotificationsAsync([notification]);
      console.log('Notification sent successfully to:', user.username);
      console.log('Receipt:', receipt);
    } catch (error) {
      console.error('Error sending notification to', user.username, error);
    }
};

module.exports = { sendNotification };
