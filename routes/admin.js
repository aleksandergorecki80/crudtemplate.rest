const express = require('express');
const router = express.Router();
const User = require('../models/UserModel');
const authMid = require('../middleware/authMid');
const isAdmin = require('../middleware/isAdmin');


// @route   GET api/admin
// @desc    Get a list of users
// @access  Private, admin only
router.get('/users', authMid, isAdmin, async (req, res) => {

    try {
        const users = await User.find({ _id: { $ne: req.user._id } });
        if(!users){
            res.status(400).json({ msg: 'Users not found' });
        }
        res.send(users)
    } catch(err) {
        console.error(err.message);
        return res.status(500).send('Server error');
    }   
}); 

// @route   DELETE api/admin/:user_id
// @desc    Delete a selected user
// @access  Private, admin only
router.delete('/users/:user_id', authMid, isAdmin, async (req, res) => {
    try {
        
        const result = await User.deleteOne({ _id: req.params.user_id });

        if(result.deletedCount === 0){
            res.status(400).json({ msg: 'Users not found' });
        }

        res.status(200).json({ msg: 'User deleted' });
    } catch(err) {
        console.log(err.message);
        return res.status(500).send('Server error');
    }
});

// @route   PUT api/admin/users/block/:user_id
// @desc    Block a selected user
// @access  Private, admin only
router.put('/users/block/:user_id', authMid, isAdmin, async (req, res) => {
    try {
        const editedUser = await User.findOne({ _id: req.params.user_id }, { isBlocked: 1 });
        const result = await User.updateOne({ _id: req.params.user_id }, {$set: {isBlocked: !editedUser.isBlocked} });
        const message = (() => {
            if (editedUser.isBlocked === true && result["acknowledged"] === true) return 'User unblocked.'
            if (editedUser.isBlocked === false && result["acknowledged"] === true) return 'User blocked.'
        })();
        if (result["modifiedCount"] !== 0) {
            res.status(200).json({result, message});
            }       
    } catch (err) {
        console.log(err.message);
        return res.status(500).send('Server error'); 
    }
});

// @route   PUT api/admin/users/edit/:user_id
// @desc    Block a selected user
// @access  Private, admin only
router.put('/users/edit/:users_id', authMid, isAdmin, async (req, res) => {
    try {
        const result = await User.updateOne({ _id: req.params.users_id }, { $set: { status: req.body.status }});
        if(result["modifiedCount"] !== 0) {
            return res.status(200).json({ result, message: "User data updated."});
        }
            return res.status(400).json({ result, message: "Nothing has been changed"});
    } catch (err) {
        console.log(err.message);
        return res.status(500).send('Server error'); 
    }
}); 

module.exports = router;