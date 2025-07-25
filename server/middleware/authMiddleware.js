const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Debug: Log incoming headers
  console.log('Auth Header:', authHeader);
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  const token = authHeader.split(' ')[1];
  
  try {
    // Debug: Verify secret matches
    console.log('Verifying with SECRET:', process.env.JWT_SECRET);
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Debug: Log decoded token
    console.log('Decoded Token:', decoded);
    
    // Attach full user data to request
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
    
    next();
  } catch (err) {
    console.error('JWT Verification Error:', err.message);
    return res.status(403).json({ message: "Forbidden: Invalid token" });
  }
};

module.exports = authMiddleware;