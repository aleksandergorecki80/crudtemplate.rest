const express = require('express');
const User = require('../models/UserModel');
const router = express.Router();
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');
const emailData = config.get('emailData');
const host = config.get('host');
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs');
const authMid = require('../middleware/authMid');

// @route   POST api/resetpassword
// @desc    Get a link to reset a password
// @access  Private
router.post('/', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(400).json({
        message: 'User not found!',
      });
    }

    // Generating JSON Web Token
    const payload = {
      user: {
        _id: user._id,
      },
    };

    jwt.sign(payload, jwtSecret, { expiresIn: 3600 }, (err, token) => {
      if (err) throw err;

      // Sending an email to reset password
      const url = `${host}/resetpassword/${token}`;
      const output = `
                    <p>Link to reset your password:</p>
                    <p>Please click the link: <a href="${url}">${url}</a> to reset your password.</p>
                `;
      // async..await is not allowed in global scope, must use a wrapper
      async function main() {
        // create reusable transporter object using the default SMTP transport
        let transporter = nodemailer.createTransport({
          host: 'smtp.live.com',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: emailData.mailUser,
            pass: emailData.mailPassword,
          },
        });

        // send mail with defined transport object
        let info = await transporter.sendMail({
          from: `www.aleksander-gorecki.com ${emailData.mailUser}`, // sender address
          to: 'a.gorecki1980@gmail.com', // list of receivers
          subject: 'New info from www.grocerystore.com', // Subject line
          text: 'Hello world?', // plain text body
          html: output, // html body
        });
        console.log('Message sent: %s', info.messageId);
      }
      main().catch(console.error);
      const userData = {
        email: user.email,
      };
      return res.json({
        user: userData,
        message: 'Check your email to reset your password.',
      });
    });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

// @route   GET api/resetpassword/:token
// @desc    Confirm token and get user email
// @access  Private
router.get('/:token', async (req, res) => {
  try {
    const decoded = jwt.verify(req.params.token, jwtSecret);
    const user = await User.findOne(
      { _id: decoded.user._id },
      { email: 1, _id: 0 }
    );
    if (!user) {
      return res.status(400).json({ message: 'User not found|' });
    }
    res.status(200).json({ user });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

// @route   PUT api/resetpassword/set
// @desc    Confirm token and get user email
// @access  Private
router.put('/set', authMid, async (req, res) => {
  try {
    // Encrypting the password
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash(req.body.password, salt);

    const result = await User.updateOne(
      { _id: req.user._id },
      { $set: { password } }
    );

    if (result.modifiedCount === 0) {
      return res.status(401).json({ msg: 'Access denied' });
    }
    res.status(200).json({ message: 'New pasword created', result });
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server error');
  }
});

module.exports = router;
