const ToDoModel = require("../models/todo.model");
const UserModel = require("../models/user.model");

class ToDoService {
    static async createToDo(todoData) {
        const createToDo = new ToDoModel(todoData);
        return await createToDo.save();
    }

    static async getUserToDoList(userId, filters = {}) {
        let query = { 
            $or: [
                { userId },
                { sharedWith: userId }
            ]
        };
        // Apply filters if provided
        if (filters.completed !== undefined) {
            query.completed = filters.completed;
        }
        
        if (filters.category) {
            query.category = filters.category;
        }
        
        if (filters.priority) {
            query.priority = filters.priority;
        }
        
        if (filters.dueDateFrom && filters.dueDateTo) {
            query.dueDate = {
                $gte: new Date(filters.dueDateFrom),
                $lte: new Date(filters.dueDateTo)
            };
        } else if (filters.dueDateFrom) {
            query.dueDate = { $gte: new Date(filters.dueDateFrom) };
        } else if (filters.dueDateTo) {
            query.dueDate = { $lte: new Date(filters.dueDateTo) };
        }
        // Apply sorting
        const sortOptions = {};
        if (filters.sortBy) {
            sortOptions[filters.sortBy] = filters.sortOrder === 'desc' ? -1 : 1;
        } else {
            // Default sort by creation date (newest first)
            sortOptions.createdAt = -1;
        }
        const todoList = await ToDoModel.find(query)
            .sort(sortOptions)
            .populate('sharedWith', 'email')
            .exec();
            
        return todoList;
            }

                static async getToDo(id) {
        return await ToDoModel.findById(id)
            .populate('sharedWith', 'email')
            .exec();
    }
    static async updateToDo(id, updateData) {
        return await ToDoModel.findByIdAndUpdate(
            id, 
            updateData, 
            { new: true }
        ).populate('sharedWith', 'email');
    }
    static async deleteToDo(id) {
        return await ToDoModel.findByIdAndDelete({ _id: id });
    }
    static async searchToDos(userId, searchText) {
        const query = {
            $or: [
                { userId },
                { sharedWith: userId }
            ],
            $text: { $search: searchText }
        };
        return await ToDoModel.find(query)
            .sort({ score: { $meta: "textScore" } })
            .populate('sharedWith', 'email')
            .exec();
    }
    static async shareToDo(todoId, ownerUserId, targetEmail) {
        // Find the user to share with
        const targetUser = await UserModel.findOne({ email: targetEmail });
        if (!targetUser) {
            throw new Error('User not found');
        }
        // Make sure the requesting user owns the todo
        const todo = await ToDoModel.findOne({ _id: todoId, userId: ownerUserId });
        if (!todo) {
            throw new Error('Todo not found or you do not have permission');
        }
        // Check if already shared with this user
        if (todo.sharedWith.includes(targetUser._id)) {
            throw new Error('Todo already shared with this user');
        }
        // Add the user to the sharedWith array
        todo.sharedWith.push(targetUser._id);
        return await todo.save();
    }
    static async unshareTask(todoId, ownerUserId, targetUserId) {
        const todo = await ToDoModel.findOne({ _id: todoId, userId: ownerUserId });
        if (!todo) {
            throw new Error('Todo not found or you do not have permission');
        }
        // Remove the user from sharedWith array
        todo.sharedWith = todo.sharedWith.filter(id => id.toString() !== targetUserId.toString());
        return await todo.save();
    }
    static async getCategories(userId) {
        // Get all unique categories for a user's todos
        return await ToDoModel.distinct('category', { 
            $or: [
                { userId },
                { sharedWith: userId }
            ]
        });
    }
    static async getTags(userId) {
        // Get all unique tags for a user's todos
        const todos = await ToDoModel.find({ 
            $or: [
                { userId },
                { sharedWith: userId }
            ]
        }, 'tags');
        // Extract and flatten the tags arrays
        let allTags = [];
        todos.forEach(todo => {
            if (todo.tags && todo.tags.length > 0) {
                allTags = [...allTags, ...todo.tags];
            }
        });
        // Return unique tags
        return [...new Set(allTags)];
    }
}
module.exports = ToDoService;