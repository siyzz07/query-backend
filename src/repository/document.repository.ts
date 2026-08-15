import { BaseRepository } from "./base.repository";
import { IDocument, Document } from "../models/Document";
import { IDocumentRepository } from "../interface/repository.interface/document.repository";

export class DocumentRepository extends BaseRepository<IDocument> implements IDocumentRepository {
  constructor() {
    super(Document);
  }

  async findBySecretKeySorted(secretKey: string): Promise<IDocument[]> {
    return await this.model.find({ secretKey }).sort({ createdAt: -1 }).exec();
  }
}
