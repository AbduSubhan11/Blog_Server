import express from 'express';
import { register, login, logout, getCurrentUser } from '../controllers/auth.js';
import { authenticateUser } from '../middleware/user.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

export const router = express.Router();

router.post('/login', login);
router.post('/register', upload.single("image"), register);
router.post('/logout', logout);
router.get('/user', authenticateUser ,  getCurrentUser)
