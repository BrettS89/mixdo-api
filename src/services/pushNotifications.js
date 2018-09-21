const { Expo }= require('expo-server-sdk');
const expo = new Expo();

exports.send = (pushToken, message) => {

  const notification = {
    to: pushToken,
    sound: 'default',
    body: message,
    data: { withSome: 'data' },
  };

  expo.sendPushNotificationsAsync(notification);
};