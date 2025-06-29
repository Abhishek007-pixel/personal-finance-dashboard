const jwt = require('jsonwebtoken');

// Replace this with your real secret key from env later
const JWT_SECRET = 'your_jwt_secret_key';

const authMiddleware = (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Check if Authorization header exists and starts with "Bearer "
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);
            req.user = decoded; // attach user data to request object
            next();
        } catch (error) {
            console.error('❌ Invalid token:', error);
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
    } else {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }
};

module.exports = authMiddleware;
