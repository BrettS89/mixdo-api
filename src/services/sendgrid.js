const sgMail = require('@sendgrid/mail');
const key = require('../config').sendgridKey;

sgMail.setApiKey(key);

exports.sendMessage = (user, subject, message) => {
  const msg = {
    to: user,
    from: 'Mixdo <brett@mixdo.io>',
    subject,
    text: 'Hi there from mixdo',
    html: `<strong>${message} </strong>
    <br>
    <br>
    Catch up with all of your actiity in mixdo!
    `,
  };
  sgMail.send(msg);
};
