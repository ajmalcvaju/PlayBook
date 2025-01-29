import mongoose, { Schema, Document } from 'mongoose';
import { Team } from '../../../domain/entities/Team';

export interface TeamDocuments extends Team, Document {
    createdAt:Date
    updatedAt:Date
}
const generateSecretCode = (): string => {
  return Math.random().toString(36).substring(2, 10).toUpperCase(); // Generates a random alphanumeric code
};

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
  secretCode: {
    type: String,
    unique: true,
},
  members: [
    {
      userId: {
        type: String,
        ref: 'User',
        required: true,
      },
      isAdmin: {
        type: Boolean,
        default: false,
      },
    },
  ]
});


teamSchema.pre('save', function (next) {
  if (this.privacy === "private" && !this.secretCode) {
    this.secretCode = generateSecretCode();
}
  this.updatedAt = new Date();
  next();
});


export const TeamModel = mongoose.model<TeamDocuments>('Team', teamSchema);
