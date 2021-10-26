const jwt = require('jsonwebtoken');
const config = require('config');
const jwtSecret = config.get('jwtSecret');

const authMid = (req, res, next) => {
  const token = req.get('x-auth-token');
  // Check if token egsists
  if (!token) {
    return res.status(401).json({ msg: 'Access denied' });
  }
  try {
    // Veryfi the token
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded.user;
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};

module.exports = authMid;
