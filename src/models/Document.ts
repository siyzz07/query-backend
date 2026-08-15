import { Schema, model, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  name: string;
  fileName: string;
  fileType: string;
  fileSize: string;
  sizeBytes: number;
  uploadedAt: string;
  additionalText?: string;
  embedding?: number[];
  secretKey: string;
}

const DocumentSchema = new Schema<IDocument>({
  name: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: String, required: true },
  sizeBytes: { type: Number, required: true },
  uploadedAt: { type: String, required: true },
  additionalText: { type: String },
  embedding: { type: [Number], default: [] },
  secretKey: { type: String, required: true }
}, {
  timestamps: true
});

export const Document = model<IDocument>('Document', DocumentSchema);
