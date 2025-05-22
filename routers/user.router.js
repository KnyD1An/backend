const router = require("express").Router();
const UserController = require('../controller/user.controller');
const { verifyToken } = require('../middleware/auth.middleware');

// Public routes - no authentication needed
// Sửa từ "/register" thành "/registration" để khớp với app.js
router.post("/registration", UserController.register);
router.post("/login", UserController.login);

// Protected routes - authentication required
router.get("/profile", verifyToken, UserController.getProfile);
router.patch("/profile", verifyToken, UserController.updateProfile);
router.post("/change-password", verifyToken, UserController.changePassword);

module.exports = router;