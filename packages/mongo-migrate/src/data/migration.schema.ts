import mongoose from 'mongoose';

export interface MigrationDocument extends mongoose.Document {
  project: string;
  filename: string;
  hash: string;
  dateApplied: Date;
}

export const migrationSchema = new mongoose.Schema<MigrationDocument>({
  project: String,
  filename: String,
  hash: String,
  dateApplied: Date,
});
