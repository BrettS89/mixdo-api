const { Expo }= require('expo-server-sdk');
const expo = new Expo();

exports.send = async (pushToken, message) => {

  const notification = {
    to: pushToken,
    sound: 'default',
    body: message,
    data: { withSome: 'data' },
  };

  try {
    await expo.sendPushNotificationsAsync(notification);
  }
  catch(e) {
    console.log(e);
  }
  
};