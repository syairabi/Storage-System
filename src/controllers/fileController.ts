// src/controllers/fileController.ts
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import File, { IFile } from '../models/File';
import { FileUtils } from '../utils/fileUtils';
import { IUser } from '../models/User';

// Define custom request interfaces
interface MulterRequest extends Request, AuthRequest {
    file?: Express.Multer.File;
}

interface AuthRequest extends Request {
    user?: IUser;
}

export class FileController {
    // Upload a new file
    static async uploadFile(req: MulterRequest, res: Response) {
        try {
            if (!req.file) {
                res.status(400).json({ error: 'No file provided' });
                return;
            }

            const uploadedFile = new File({
                filename: req.file.originalname,
                path: req.file.path,
                size: req.file.size,
                uploadedBy: req.user!._id,
                lastModified: new Date()
            });

            await uploadedFile.save();
            res.status(201).json({
                success: true,
                data: uploadedFile,
                message: 'File uploaded successfully'
            });
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error uploading file',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get all files
    static async getAllFiles(req: AuthRequest, res: Response) {
        try {
            const files = await File.find()
                .populate('uploadedBy', 'username')
                .sort({ lastModified: -1 }); // Sort by most recently modified

            res.json({
                success: true,
                data: files,
                count: files.length
            });
        } catch (error) {
            console.error('Fetch error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Error fetching files',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get a single file by ID
    static async getFileById(req: Request, res: Response) {
        try {
            const file = await File.findById(req.params.id)
                .populate('uploadedBy', 'username');
            
            if (!file) {
                res.status(404).json({success: false,error: 'File not found'});
                return;
            }

            res.json({
                success: true,
                data: file
            });
        } catch (error) {
            console.error('Fetch error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching file',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Download a file
    static async downloadFile(req: Request, res: Response) {
        try {
            const file = await File.findById(req.params.id);
            if (!file) {
                res.status(404).json({success: false, error: 'File not found'});
                return;
            }

            // Check if file exists in filesystem
            if (!fs.existsSync(file.path)) {
                res.status(404).json({success: false, error: 'File not found in storage'});
                return;
            }

            res.download(file.path, file.filename);
        } catch (error) {
            console.error('Download error:', error);
            res.status(500).json({
                success: false,
                error: 'Error downloading file',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Create a backup of a file
    static async createBackup(req: Request, res: Response) {
        try {
            const file = await File.findById(req.params.id);
            if (!file) {
                res.status(404).json({success: false, error: 'File not found'});
                return;
            }

            // Check if original file exists
            if (!fs.existsSync(file.path)) {
                res.status(404).json({success: false, error: 'Original file not found in storage'});
                return;
            }

            const backupPath = await FileUtils.createBackup(
                file.path,
                FileUtils.getBackupPath()
            );

            file.backupPath = backupPath;
            file.backupDate = new Date();
            await file.save();

            res.json({
                success: true,
                data: file,
                message: 'Backup created successfully'
            });
        } catch (error) {
            console.error('Backup error:', error);
            res.status(500).json({
                success: false,
                error: 'Error creating backup',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Delete a file
    static async deleteFile(req: Request, res: Response) {
        try {
            const file = await File.findById(req.params.id);
            if (!file) {
                res.status(404).json({success: false, error: 'File not found'});
                return;
            }

            // Delete physical file if it exists
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }

            // Delete backup if it exists
            if (file.backupPath && fs.existsSync(file.backupPath)) {
                fs.unlinkSync(file.backupPath);
            }

            // Delete database record
            await file.deleteOne();

            res.json({
                success: true,
                message: 'File deleted successfully',
                data: file
            });
        } catch (error) {
            console.error('Delete error:', error);
            res.status(500).json({
                success: false,
                error: 'Error deleting file',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Search files
    static async searchFiles(req: Request, res: Response) {
        try {
            const { query } = req.query;
            
            const files = await File.find({
                filename: { $regex: query, $options: 'i' }
            }).populate('uploadedBy', 'username');

            res.json({
                success: true,
                data: files,
                count: files.length
            });
        } catch (error) {
            console.error('Search error:', error);
            res.status(500).json({
                success: false,
                error: 'Error searching files',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Update file metadata
    static async updateFile(req: AuthRequest, res: Response) {
        try {
            const { filename } = req.body;
            const file = await File.findById(req.params.id);

            if (!file) {
                res.status(404).json({success: false, error: 'File not found'});
                return;
            }

            if (filename) {
                file.filename = filename;
                file.lastModified = new Date();
                await file.save();
            }

            res.json({
                success: true,
                data: file,
                message: 'File updated successfully'
            });
        } catch (error) {
            console.error('Update error:', error);
            res.status(500).json({
                success: false,
                error: 'Error updating file',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }

    // Get all backups for a file
    static async getFileBackups(req: Request, res: Response) {
        try {
            const file = await File.findById(req.params.id);
            if (!file) {
                res.status(404).json({success: false, error: 'File not found'});
                return;
            }

            // Return backup information if it exists
            const backupInfo = file.backupPath ? {
                backupPath: file.backupPath,
                backupDate: file.backupDate,
                exists: fs.existsSync(file.backupPath)
            } : null;

            res.json({
                success: true,
                data: {
                    fileId: file._id,
                    filename: file.filename,
                    backup: backupInfo
                }
            });
        } catch (error) {
            console.error('Backup fetch error:', error);
            res.status(500).json({
                success: false,
                error: 'Error fetching backup information',
                details: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
}