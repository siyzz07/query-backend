import { BaseRepository } from "./base.repository";
import { IDocumentChunk, DocumentChunk } from "../models/documentChunk";
import { IDocumentChunkRepository } from "../interface/repository.interface/documentChunk.repository";

export class DocumentChunkRepository extends BaseRepository<IDocumentChunk> implements IDocumentChunkRepository {
  constructor() {
    super(DocumentChunk);
  }

  async deleteChunksByDocumentId(documentId: string): Promise<boolean> {
    const result = await this.model.deleteMany({ documentId }).exec();
    return result.acknowledged;
  }
}
