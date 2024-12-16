// src/routes/maintenance.ts
import express from 'express';
import { MaintenanceController } from '../controllers/maintenanceController';
import { auth } from '../middleware/auth';

const router = express.Router();

router.post('/schedule', auth, MaintenanceController.scheduleMaintenanceEvent);
router.get('/schedules', auth, MaintenanceController.getMaintenanceSchedules);
router.post('/backup/:id', auth, MaintenanceController.performBackup);

export default router;