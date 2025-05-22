const UserServices = require('../services/user.services');
exports.register = async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Email and password are required' });
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ status: false, message: 'Invalid email format' });
        }
        
        // Validate password strength (at least 6 characters)
        if (password.length < 6) {
            return res.status(400).json({ 
                status: false, 
                message: 'Password must be at least 6 characters long' 
            });
        }
        
        const duplicate = await UserServices.getUserByEmail(email);
        if (duplicate) {
            return res.status(409).json({ 
                status: false, 
                message: `User with email ${email} already exists` 
            });
        }
        
        const userData = { email, password };
        if (name) userData.name = name;
        
        const user = await UserServices.registerUser(userData);
        
        // Generate token after registration
        const tokenData = { _id: user._id, email: user.email };
        const token = await UserServices.generateAccessToken(tokenData, "secret", "1h");
        
        res.status(201).json({ 
            status: true, 
            message: 'User registered successfully',
            token,
            userId: user._id
        });
    } catch (err) {
        console.log("---> err -->", err);
        res.status(500).json({ status: false, message: 'Failed to register user' });
    }
};
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ status: false, message: 'Email and password are required' });
        }
        
        let user = await UserServices.checkUser(email);
        if (!user) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }
        const isPasswordCorrect = await user.comparePassword(password);
        if (!isPasswordCorrect) {
            return res.status(401).json({ status: false, message: 'Invalid email or password' });
        }
        // Creating token
        const tokenData = { _id: user._id, email: user.email };
        const token = await UserServices.generateAccessToken(tokenData, "secret", "1h");
        res.status(200).json({ 
            status: true, 
            message: "Login successful", 
            token,
            userId: user._id
        });
    } catch (error) {
        console.log(error, 'err---->');
        res.status(500).json({ status: false, message: 'Failed to login' });
    }
};
exports.getProfile = async (req, res, next) => {
    try {
        // req.user is set by the auth middleware
        const user = req.user;
        
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        
        // Return user data (excluding password)
        res.status(200).json({
            status: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name || '',
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        console.log(error, 'err---->');
        res.status(500).json({ status: false, message: 'Failed to get user profile' });
    }
};
exports.updateProfile = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { name, email } = req.body;
        
        // Create update object with only provided fields
        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (email !== undefined) {
            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ status: false, message: 'Invalid email format' });
            }
            
            // Check if email is already in use by another user
            const existingUser = await UserServices.getUserByEmail(email);
            if (existingUser && existingUser._id.toString() !== userId.toString()) {
                return res.status(409).json({ status: false, message: 'Email already in use' });
            }
            
            updateData.email = email;
        }
        
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ status: false, message: 'No update data provided' });
        }
        
        const updatedUser = await UserServices.updateUser(userId, updateData);
        
        if (!updatedUser) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        
        res.status(200).json({
            status: true,
            message: 'Profile updated successfully',
            user: {
                id: updatedUser._id,
                email: updatedUser.email,
                name: updatedUser.name || '',
                createdAt: updatedUser.createdAt
            }
        });
    } catch (error) {
        console.log(error, 'err---->');
        res.status(500).json({ status: false, message: 'Failed to update profile' });
    }
};
exports.changePassword = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { currentPassword, newPassword } = req.body;
        
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ 
                status: false, 
                message: 'Current password and new password are required' 
            });
        }
        
        // Validate new password strength
        if (newPassword.length < 6) {
            return res.status(400).json({ 
                status: false, 
                message: 'New password must be at least 6 characters long' 
            });
        }
        
        // Get user with password field
        const user = await UserServices.getUserById(userId);
        if (!user) {
            return res.status(404).json({ status: false, message: 'User not found' });
        }
        
        // Verify current password
        const isPasswordCorrect = await user.comparePassword(currentPassword);
        if (!isPasswordCorrect) {
            return res.status(401).json({ status: false, message: 'Current password is incorrect' });
        }
        
        // Update password
        user.password = newPassword;
        await user.save();
        
        res.status(200).json({
            status: true,
            message: 'Password changed successfully'
        });
    } catch (error) {
        console.log(error, 'err---->');
        res.status(500).json({ status: false, message: 'Failed to change password' });
    }
};