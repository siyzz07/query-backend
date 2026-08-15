import { IBaseRepository } from "./base.repository";
import { IDocumentChunk } from "../../models/documentChunk";

export interface IDocumentChunkRepository extends IBaseRepository<IDocumentChunk> {
  deleteChunksByDocumentId(documentId: string): Promise<boolean>;
}
