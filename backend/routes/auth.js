const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');


router.post('/register', upload.single('pwdIdImage'), authController.register);
router.post('/login', authController.login);
router.post('/admin/create-user', verifyToken, isAdmin, authController.createAdminUser);


module.exports = router;
