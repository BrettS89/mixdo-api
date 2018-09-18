const Mixpanel = require('mixpanel');
const key = require('../config').mixpanelToken;

const mixpanel = Mixpanel.init(key, {
  protocol: 'https'
});

exports.track = (event, id) => {
  mixpanel.track(event, {
    distinct_id: id,
  });
}