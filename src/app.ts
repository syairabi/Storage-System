// src/app.ts
import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/database';
import authRoutes from './routes/auth';
import { join } from 'path';
import fileRoutes from './routes/file';
import maintenanceRoutes from './routes/maintenance';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware to parse JSON requests
app.use(express.json());
app.set('views', join(__dirname, '..', 'views'));
app.use(express.static(join(__dirname, '..', 'public')))

// Connect to MongoDB
//connectDB();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/file', fileRoutes);

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
