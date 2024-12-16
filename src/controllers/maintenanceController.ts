// src/controllers/maintenanceController.ts
import { Request, Response } from 'express';
import MaintenanceSchedule from '../models/MaintenanceSchedule';
import File from '../models/File';
import { FileUtils } from '../utils/fileUtils';
import { IUser } from '../models/User';

interface AuthRequest extends Request {
  user?: IUser;
}

export class MaintenanceController {
  static async scheduleMaintenanceEvent(req: AuthRequest, res: Response) {
    try {
      const { scheduledDate, description } = req.body;

      const maintenance = new MaintenanceSchedule({
        scheduledDate: new Date(scheduledDate),
        description,
        createdBy: req.user!._id
      });

      await maintenance.save();
      res.status(201).json(maintenance);
    } catch (error) {
      res.status(500).json({ error: 'Error scheduling maintenance' });
    }
  }

  static async getMaintenanceSchedules(req: Request, res: Response) {
    try {
      const schedules = await MaintenanceSchedule.find()
        .populate('createdBy', 'username')
        .sort({ scheduledDate: 1 });
      res.json(schedules);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching maintenance schedules' });
    }
  }

  static async performBackup(req: Request, res: Response) {
    try {
      const maintenanceId = req.params.id;
      const maintenance = await MaintenanceSchedule.findById(maintenanceId);
      
      if (!maintenance) {
        res.status(404).json({ error: 'Maintenance schedule not found' });
        return;
      }

      const files = await File.find();
      const backupResults = [];

      for (const file of files) {
        try {
          const backupPath = await FileUtils.createBackup(
            file.path,
            FileUtils.getBackupPath()
          );
          
          file.backupPath = backupPath;
          file.backupDate = new Date();
          await file.save();
          
          backupResults.push({
            fileId: file._id,
            status: 'success',
            backupPath
          });
        } catch (error) {
          backupResults.push({
            fileId: file._id,
            status: 'failed',
            error: (error as Error).message
          });
        }
      }

      maintenance.status = 'completed';
      maintenance.lastBackupDate = new Date();
      await maintenance.save();

      res.json({
        maintenance,
        backupResults
      });
    } catch (error) {
      res.status(500).json({ error: 'Error performing backup' });
    }
  }
}