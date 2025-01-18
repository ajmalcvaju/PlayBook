import mongoose, { Schema, Document, Types } from 'mongoose';
import mongooseSequence from 'mongoose-sequence'; // Import the mongoose-sequence plugin
import { Slot } from '../../../domain/entities/Turf'; // Assuming Slot is an interface

export interface SlotDocument extends Slot, Document {
  turfId: string | Types.ObjectId;
  userId?: string | Types.ObjectId;
  bookingNumber: number;
  slotNumber:number
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
  price: {
    type: String,
    required: true,
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
  bookingNumber: {
    type: Number,
  },
  slotNumber: {
    type: Number,
  }
});


slotSchema.plugin((mongooseSequence as any)(mongoose), {
  inc_field: 'bookingNumber',
  start_seq: 1001, 
});
slotSchema.plugin((mongooseSequence as any)(mongoose), {
  inc_field: 'slotNumber',
  start_seq: 1001, 
});

// Create the Slot model using the SlotDocument schema
export const SlotModel = mongoose.model<SlotDocument>('Slot', slotSchema);
