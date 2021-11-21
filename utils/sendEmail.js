const nodemailer = require('nodemailer');
const config = require('config');

const sendEmail = async (options) => {
  // Create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: config.get('emailData.SMTP_HOST'),
    secureConnection: false,                  // TLS requires secureConnection to be false
    port: config.get('emailData.SMTP_PORT'),
    tls: {
      ciphers: 'SSLv3',
    },
    auth: {
      user: config.get('emailData.SMTP_EMAIL'), //  User
      pass: config.get('emailData.SMTP_PASSWORD'), // Password
    },
  });

  // Email object
  const message = {
    from: '"www.crudtemplate.rest" <aleksander.gorecki1980@outlook.com>', // sender address (who sends)
    to: options.receiverEmail,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  const info = await transporter.sendMail(message);
  console.log('Message sent: ' + info.response);
  console.log('Message sent: %s', info.messageId);
};

module.exports = sendEmail;
