const router = require("express").Router();
const ToDoController = require('../controller/todo.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Bỏ middleware verifyToken toàn cục vì app.js đã có middleware xác thực
// router.use(verifyToken); // Bỏ dòng này vì app.js đã xử lý xác thực

// Create and retrieve todos
router.post("/storeTodo", ToDoController.createToDo);  // Đổi tên theo app.js cũ nếu cần
router.post('/getUserTodoList', ToDoController.getToDoList);  // Chuyển từ get sang post để phù hợp với client
router.delete('/deleteTodo', ToDoController.deleteToDo);  // Đổi tên để phù hợp với client

// Update and delete todos - giữ nguyên
router.get('/todo/:id', ToDoController.getToDo);
router.patch('/todo/:id', ToDoController.updateToDo);

// Search functionality
router.post('/search', ToDoController.searchToDos);  // Chuyển từ get sang post nếu client gửi dữ liệu qua body

// Sharing functionality
router.post('/share', ToDoController.shareToDo);
router.post('/unshare', ToDoController.unshareToDo);

// Metadata
router.post('/categories', ToDoController.getCategories);  // Chuyển từ get sang post nếu cần
router.post('/tags', ToDoController.getTags);  // Chuyển từ get sang post nếu cần

module.exports = router;