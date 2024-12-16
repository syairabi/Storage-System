// src/routes/auth.ts
import express from 'express';
import { AuthController } from '../controllers/authController';

const router = express.Router();

router.get('/login', (req, res)=>{
    res.render('login.ejs');
})

// Use static methods directly from the class
//router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

router.get('/createuser', AuthController.CreateUser);
export default router;
