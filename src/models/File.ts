import mongoose, { Document, Schema } from 'mongoose';

export interface IFile extends Document {
  filename: string;
  path: string;
  uploadedBy: mongoose.Types.ObjectId;
  size: number;
  lastModified: Date;
  backupPath?: string;
  backupDate?: Date;
}

const FileSchema = new Schema({
  filename: {
    type: String,
    required: true
  },
  path: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  lastModified: {
    type: Date,
    default: Date.now
  },
  backupPath: {
    type: String
  },
  backupDate: {
    type: Date
  }
}, {
  timestamps: true
});

export default mongoose.model<IFile>('File', FileSchema);