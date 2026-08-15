import { Schema, model, Types } from 'mongoose';

export interface IDocumentChunk {
  documentId: Types.ObjectId;
  documentTitle?: string;
  secretKey: string;
  text: string;
  embedding: number[];
}

const DocumentChunkSchema = new Schema<IDocumentChunk>({
  documentId: { type: Schema.Types.ObjectId, ref: 'Document', required: true },
  documentTitle: { type: String },
  secretKey: { type: String, required: true },
  text: { type: String, required: true },
  embedding: { type: [Number], required: true }
}, {
  timestamps: true
});

// Index for multi-tenant query optimization
DocumentChunkSchema.index({ secretKey: 1 });

export const DocumentChunk = model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
