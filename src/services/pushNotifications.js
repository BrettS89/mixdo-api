const { Expo } = require('expo-server-sdk');
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

exports.sendBatch = async (pushTokens, message) => {
  const messages = pushTokens.map(token => {
    return {
      to: token,
      sound: 'default',
      body: message,
      data: { withSome: 'data' },
    }
  });
  let chunks = expo.chunkPushNotifications(messages);
  try {
    chunks.forEach(async chunk => {
      let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
    });
  }
  catch(e) {
    console.log('pushError', e);
  }
};
