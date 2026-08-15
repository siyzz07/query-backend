import { Schema, model } from 'mongoose';

const LogSchema = new Schema({
  type: { type: String, required: true, enum: ['INFO', 'SYS', 'WARN', 'ERROR'] },
  message: { type: String, required: true },
  timestamp: { type: String, required: true }
});

export const Log = model('Log', LogSchema);
