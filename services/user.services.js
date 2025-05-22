const UserModel = require("../models/user.model");
const jwt = require("jsonwebtoken");

class UserServices {
    static async registerUser(userData) {
        try {
            const createUser = new UserModel(userData);
            return await createUser.save();
        } catch (err) {
            throw err;
        }
    }
    static async getUserByEmail(email) {
        try {
            return await UserModel.findOne({ email });
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    static async getUserById(id) {
        try {
            return await UserModel.findById(id);
        } catch (err) {
            console.log(err);
            throw err;
        }
    }
    static async checkUser(email) {
        try {
            return await UserModel.findOne({ email });
        } catch (error) {
            throw error;
        }
    }

    static async updateUser(userId, updateData) {
        try {
            return await UserModel.findByIdAndUpdate(
                userId,
                updateData,
                { new: true, runValidators: true }
            );
        } catch (error) {
            throw error;
        }
    }
    static async generateAccessToken(tokenData, JWTSecret_Key = "secret", JWT_EXPIRE = "1h") {
        return jwt.sign(tokenData, JWTSecret_Key, { expiresIn: JWT_EXPIRE });
    }
    static async verifyToken(token, JWTSecret_Key = "secret") {
        try {
            return jwt.verify(token, JWTSecret_Key);
        } catch (error) {
            throw error;
        }
    }
    static async deleteUser(userId) {
        try {
            return await UserModel.findByIdAndDelete(userId);
        } catch (error) {
            throw error;
        }
    }
}
