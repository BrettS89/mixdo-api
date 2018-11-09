module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  FOLLOWED: 'FOLLOWED',
  TODO_LIKED: 'TODO_LIKED',
  TODO_ADDED: 'TODO_ADDED',
  TODO_COMMENT: 'TODO_COMMENT',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  bucket: process.env.BUCKET,
  mixpanelToken: process.env.MIXPANEL_TOKEN,
  mongoURI: process.env.MONGO_URI,
  sendgridKey: process.env.SENDGRID_API_KEY,
};
