import mongoose, { Schema, Document, Types } from 'mongoose';
import { Slot } from '../../../domain/entities/Turf';

export interface SlotDocument extends Slot, Document {
  turfId: string | Types.ObjectId;
  userId?: string | Types.ObjectId;
}

const slotSchema = new Schema<SlotDocument>({
  date: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  price:{
    type: String,
    required: true
  },
  isBooked: {
    type: Boolean,
    default: false,
  },
  turfId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'Turf',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});


export const SlotModel = mongoose.model<SlotDocument>('Slot', slotSchema);
