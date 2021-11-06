const nodemailer = require("nodemailer");
const config = require('config');

const sendEmail = async (options) => {
  // Create reusable transporter object using the default SMTP transport
  const  transporter = nodemailer.createTransport({
    host: config.get('emailData.SMTP_HOST'),
    port: config.get('emailData.SMTP_PORT'),
    auth: {
      user: config.get('emailData.SMTP_EMAIL'), //  User
      pass: config.get('emailData.SMTP_PASSWORD'), // Password
    },
  });

  // Email object
  const message = {
    from: `${config.get('emailData.FROM_EMAIL')} <${config.get('emailData.FROM_NAME')}>`,
    to: options.receiverEmail,
    subject: options.subject,
    text: options.text,
    html: options.html
  };

  // Sending email
  const info = await transporter.sendMail(message);

  console.log("Message sent: %s", info.messageId);
}

module.exports = sendEmail;