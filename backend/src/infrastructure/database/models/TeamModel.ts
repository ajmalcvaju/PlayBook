import mongoose, { Schema, Document } from 'mongoose';
import { Team } from '../../../domain/entities/Team';

export interface TeamDocuments extends Team, Document {
    createdAt:Date
    updatedAt:Date
}

const teamSchema = new Schema<TeamDocuments>({
  teamName: {
    type: String,
    required: true,
    trim: true,
    unique: true, 
  },
  maxMembers: {
    type: Number,
    required: true,
    min: 2, 
    max: 100,
  },
  privacy: {
    type: String,
    enum: ['public', 'private'], 
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now, 
  },
  updatedAt: {
    type: Date,
    default: Date.now, 
  },
});


teamSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});


export const TeamModel = mongoose.model<TeamDocuments>('Team', teamSchema);
