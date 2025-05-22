const jwt = require('jsonwebtoken');
const UserModel = require('../models/user.model');

const JWT_SECRET = 'secret'; // In production, use environment variable

const verifyToken = async (req, res, next) => {
    try {
        // Get the token from the Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ status: false, message: 'Access denied. No token provided.' });
        }

        const token = authHeader.split(' ')[1];
        if (!token) {
            return res.status(401).json({ status: false, message: 'Access denied. No token provided.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // Find the user
        const user = await UserModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid token. User not found.' });
        }

        // Attach the user to the request object
        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ status: false, message: 'Invalid token.' });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ status: false, message: 'Token expired.' });
        }
        res.status(500).json({ status: false, message: 'Internal server error.' });
    }
};

module.exports = { verifyToken };