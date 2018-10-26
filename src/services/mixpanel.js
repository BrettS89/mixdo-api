const Mixpanel = require('mixpanel');
const key = require('../config').mixpanelToken;

const ourIds = ['5bc6b334af3fbc001376ff3e', '5bcd279bc0e7160013a6abf7'];

const mixpanel = Mixpanel.init(key, {
  protocol: 'https'
});

exports.track = (event, id) => {
  if(ourIds.indexOf(id) === -1) {
    mixpanel.track(event, {
      distinct_id: id,
    });
  }
};
