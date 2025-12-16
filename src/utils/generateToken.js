const jwt = require('jsonwebtoken');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role }, // Payload (data stored in token)
    process.env.JWT_SECRET, // Secret key from .env
    { expiresIn: process.env.JWT_EXPIRE } // Token expires in 7 days
  );
};

module.exports = generateToken;
