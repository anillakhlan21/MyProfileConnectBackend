const jwt = require('jsonwebtoken');

// Middleware function to verify and decode JWT token
const verifyToken = (req, res, next) => {
  // Get the token from the request headers or query parameters
  const token = (req.headers.authorization).split(' ')[1];

  // Check if the token exists
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    // Verify the token using the secret key
    const decoded = jwt.verify(token, process.env.JWT_PRIVATE_KEY);

    // Attach the decoded payload to the request object for further use
    req.user = decoded;

    // Proceed to the next middleware or route handler
    next();
  } catch (error) {
    // Handle verification errors
    return res.status(403).json({ message: 'Invalid token' });
  }
};

module.exports = verifyToken;
