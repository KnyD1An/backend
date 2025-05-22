const ToDoService = require('../services/todo.services');

exports.createToDo = async (req, res, next) => {
    try {
        const todoData = {
            userId: req.body.userId,
            title: req.body.title,
            description: req.body.description,
            dueDate: req.body.dueDate || null,
            category: req.body.category || 'General',
            priority: req.body.priority || 'Medium',
            tags: req.body.tags || []
        };
        let createdTodo = await ToDoService.createToDo(todoData);
        res.status(201).json({ status: true, success: createdTodo });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}

exports.getToDoList = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const filters = {
            completed: req.query.completed === 'true' ? true : (req.query.completed === 'false' ? false : undefined),
            category: req.query.category,
            priority: req.query.priority,
            dueDateFrom: req.query.dueDateFrom,
            dueDateTo: req.query.dueDateTo,
            sortBy: req.query.sortBy,
            sortOrder: req.query.sortOrder
        };
        let todoData = await ToDoService.getUserToDoList(userId, filters);
        res.json({ status: true, success: todoData });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}

exports.getToDo = async (req, res, next) => {
    try {
        const { id } = req.params;
        let todo = await ToDoService.getToDo(id);
        
        if (!todo) {
            return res.status(404).json({ status: false, message: 'Todo not found' });
        }
        
        res.json({ status: true, success: todo });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}
exports.updateToDo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const updateData = {};
        
        // Only update fields that are provided
        if (req.body.title !== undefined) updateData.title = req.body.title;
        if (req.body.description !== undefined) updateData.description = req.body.description;
        if (req.body.dueDate !== undefined) updateData.dueDate = req.body.dueDate;
        if (req.body.category !== undefined) updateData.category = req.body.category;
        if (req.body.priority !== undefined) updateData.priority = req.body.priority;
        if (req.body.completed !== undefined) updateData.completed = req.body.completed;
        if (req.body.tags !== undefined) updateData.tags = req.body.tags;
        
        let updatedTodo = await ToDoService.updateToDo(id, updateData);
        
        if (!updatedTodo) {
            return res.status(404).json({ status: false, message: 'Todo not found' });
        }
        
        res.json({ status: true, success: updatedTodo });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}
exports.deleteToDo = async (req, res, next) => {
    try {
        const { id } = req.params;
        let deletedData = await ToDoService.deleteToDo(id);
        
        if (!deletedData) {
            return res.status(404).json({ status: false, message: 'Todo not found' });
        }
        
        res.json({ status: true, success: deletedData });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}
exports.searchToDos = async (req, res, next) => {
    try {
        const { userId } = req.body;
        const { query } = req.query;
        
        if (!query) {
            return res.status(400).json({ status: false, message: 'Search query is required' });
        }
        
        let searchResults = await ToDoService.searchToDos(userId, query);
        res.json({ status: true, success: searchResults });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}
exports.shareToDo = async (req, res, next) => {
    try {
        const { todoId, userId, targetEmail } = req.body;
        
        if (!todoId || !userId || !targetEmail) {
            return res.status(400).json({ 
                status: false, 
                message: 'Todo ID, user ID, and target email are required' 
            });
        }
        
        let sharedTodo = await ToDoService.shareToDo(todoId, userId, targetEmail);
        res.json({ status: true, success: sharedTodo });
    } catch (error) {
        console.log(error, 'err---->');
        if (error.message.includes('User not found') || 
            error.message.includes('Todo not found') ||
            error.message.includes('already shared')) {
            return res.status(400).json({ status: false, message: error.message });
        }
        next(error);
    }
}
exports.unshareToDo = async (req, res, next) => {
    try {
        const { todoId, userId, targetUserId } = req.body;
        
        if (!todoId || !userId || !targetUserId) {
            return res.status(400).json({ 
                status: false, 
                message: 'Todo ID, user ID, and target user ID are required' 
            });
        }
        
        let updatedTodo = await ToDoService.unshareTask(todoId, userId, targetUserId);
        res.json({ status: true, success: updatedTodo });
    } catch (error) {
        console.log(error, 'err---->');
        if (error.message.includes('Todo not found')) {
            return res.status(404).json({ status: false, message: error.message });
        }
        next(error);
    }
}
exports.getCategories = async (req, res, next) => {
    try {
        const { userId } = req.body;
        let categories = await ToDoService.getCategories(userId);
        res.json({ status: true, success: categories });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}
exports.getTags = async (req, res, next) => {
    try {
        const { userId } = req.body;
        let tags = await ToDoService.getTags(userId);
        res.json({ status: true, success: tags });
    } catch (error) {
        console.log(error, 'err---->');
        next(error);
    }
}