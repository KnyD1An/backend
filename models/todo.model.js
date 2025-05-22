const db = require('../config/db');
const UserModel = require("./user.model");
const mongoose = require('mongoose');
const { Schema } = mongoose;

const toDoSchema = new Schema({
    userId:{
        type: Schema.Types.ObjectId,
        ref: UserModel.modelName,
        required: true
    },
    title: {
        type: String,


        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        default: null
    },
    category: {
        type: String,
        default: 'General'
    },
    priority: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        default: 'Medium'
    },
    completed: {
        type: Boolean,
        default: false
    },
    sharedWith: [{
        type: Schema.Types.ObjectId,
        ref: UserModel.modelName
    }],
    tags: [{
        type: String
    }]
},{timestamps:true});
// Create indexes for search functionality
toDoSchema.index({ title: 'text', description: 'text', category: 'text', tags: 'text' });
const ToDoModel = db.model('todo',toDoSchema);
module.exports = ToDoModel;