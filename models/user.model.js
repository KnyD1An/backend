const db = require('../config/db');
const bcrypt = require("bcrypt");
const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: {
        type: String,
        lowercase: true,
        required: [true, "Email can't be empty"],
        match: [
            /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
            "Email format is not correct",
        ],
        unique: true,
    },
    password: {
        type: String,
        required: [true, "Password is required"],
    },

    name: {
        type: String,
        trim: true
    },
    avatar: {
        type: String,
        default: null
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notifications: {
            type: Boolean,
            default: true
        },
        defaultView: {
            type: String,
            enum: ['list', 'calendar', 'kanban'],
            default: 'list'
        }
    },
    lastLogin: {
        type: Date
    }
}, { timestamps: true });

// Used while encrypting user-entered password
userSchema.pre("save", async function() {
    var user = this;
    if (!user.isModified("password")) {
        return;
    }
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(user.password, salt);
        user.password = hash;
        } catch (err) {
        throw err;
    }
});
// Used during login to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    } catch (error) {
        }
};

// Method to create a sanitized user object without sensitive data
userSchema.methods.toJSON = function() {
    const user = this.toObject();
    delete user.password;
    return user;
};
const UserModel = db.model('user', userSchema);
module.exports = UserModel;