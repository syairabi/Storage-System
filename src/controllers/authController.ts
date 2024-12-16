// src/controllers/authController.ts
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';

export class AuthController {
  /*static async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        res.status(400).json({ error: 'Username already exists' });
        return;
      }

      // Create new user
      const user = new User({
        username,
        password
      });
      await user.save();

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '24h'
      });

      res.status(201).json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error creating user' });
    }
  }*/

  static async CreateUser(req: Request, res: Response) {
    try {
      const users = [
        {
          username: "Fakhrul",
          password: "mrl@2024!" 
        },
        {
          username: "Faiz",
          password: "mrl@2024!" 
        },
        {
          username: "Syairazi",
          password: "mrl@2024!" 
        },
      ]

      users.forEach(async u=>{
        // Check if user already exists
      const existingUser = await User.findOne({ username: u.username });
      if (existingUser) {
        
        return;
      }

      // Create new user
      const user = new User({
        username: u.username,
        password: u.password,
      });
      await user.save();

      })

      

      res.status(201).json({message:"Success"});
    } catch (error) {
      console.log (error)
      res.status(500).json({ error: 'Error creating user' });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      // Find user
      const user = await User.findOne({ username });
      if (!user) {
        res.status(401).json({ error: 'Invalid credentials' });
        

        return       }

      // Check password
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        res.status(401).json({ error: 'Invalid credentials' });
        return;
      }

      // Generate token
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET!, {
        expiresIn: '24h'
      });

      res.json({ user, token });
    } catch (error) {
      res.status(500).json({ error: 'Error logging in' });
    }
  }
}