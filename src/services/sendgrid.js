const sgMail = require('@sendgrid/mail');
const key = require('../config').sendgridKey;

sgMail.setApiKey(key);

exports.sendMessage = (user, subject) => {
  const msg = {
    to: user,
    from: 'Mixdo <brett@mixdo.io>',
    subject,
    text: 'hi there',
    html: '<strong>ayooo</strong>',
  };
  sgMail.send(msg);
};