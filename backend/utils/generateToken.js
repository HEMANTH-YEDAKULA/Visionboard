// utils/generateToken.js
const jwt = require('jsonwebtoken');

module.exports = function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};
