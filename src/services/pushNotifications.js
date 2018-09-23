const { Expo } = require('expo-server-sdk');
const expo = new Expo();

exports.send = async (pushToken, message) => {
  console.log(pushToken);

  const notification = {
    to: pushToken,
    sound: 'default',
    body: message,
    data: { withSome: 'data' },
  };

  try {
    const res = await expo.sendPushNotificationsAsync(notification);
    console.log(res);
  }
  catch(e) {
    console.log(e);
  }
  
};
