import mongoose, { Schema, Document, Types } from 'mongoose';


export interface Slot extends Document {
  date: string;
  time: string;
  isBooked: boolean;
  turfId: Types.ObjectId;
  userId: Types.ObjectId; 
}

const slotSchema = new Schema<Slot>({
  date: {
    type: String,
    required: true,
  },
  time: {
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
    ref: 'TurfOwner',
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
});
slotSchema.index({ date: 1, time: 1 }, { unique: true });

export const SlotModel = mongoose.model<Slot>('Slot', slotSchema);
