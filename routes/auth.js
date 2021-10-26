const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/UserModel');
const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');
const authMid = require('../middleware/authMid');


// @route   PUT api/users
// @desc    Log in a user and get token
// @access  Public
router.post('/', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if(!user) return res.status(400).json({ errors: [{ msg: 'Wrong email or password' }]});
        if(!user.isConfirmed) return res.status(401).json({ errors: [{ msg: 'Your accound need confirmation. Check your email account.'}]});

        // Passwort decrypting
        const isMatch = await bcrypt.compare(req.body.password, user.password);
        if(!isMatch) return res.status(400).json({ errors: [{ msg: 'Wrong email or password' }]});
        
        // Sending a token
        const payload = {
            user: {
                _id: user._id
            }
        }
        jwt.sign(payload, jwtSecret, 
            { expiresIn: 3600 }, 
            (err, token) => {
            if(err) throw err;
            return res.json( { token });
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }
});

router.get('/', authMid, async (req, res) => {
    try {
        const user = await User.findOne({ _id: req.user._id}, { password: 0 });

        res.json(user);

    } catch (err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }

});


module.exports = router;