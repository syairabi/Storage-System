// src/models/MaintenanceSchedule.ts
import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenanceSchedule extends Document {
  scheduledDate: Date;
  description: string;
  status: 'pending' | 'completed' | 'failed';
  createdBy: mongoose.Types.ObjectId;
  lastBackupDate?: Date;
}

const MaintenanceScheduleSchema = new Schema({
  scheduledDate: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastBackupDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IMaintenanceSchedule>('MaintenanceSchedule', MaintenanceScheduleSchema);