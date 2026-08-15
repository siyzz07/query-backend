import { Schema, model } from 'mongoose';

const InvoiceSchema = new Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true },
  amount: { type: Number, required: true },
  status: { type: String, required: true, enum: ['Paid', 'Pending'] }
}, {
  timestamps: true
});

export const Invoice = model('Invoice', InvoiceSchema);
