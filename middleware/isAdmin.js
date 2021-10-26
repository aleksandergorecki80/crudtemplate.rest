const User = require('../models/UserModel');

const isAdmin = async (req, res, next) => {
  try {
    const user = await User.findOne({ _id: req.user._id });
    if (user.status !== 'Admin') {
      return res.status(401).json({ msg: 'Access denied' });
    }
    req.user = user;
    next();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

module.exports = isAdmin;
