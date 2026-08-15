import { IBaseRepository } from "./base.repository";
import { IDocument } from "../../models/Document";

export interface IDocumentRepository extends IBaseRepository<IDocument> {
  findBySecretKeySorted(secretKey: string): Promise<IDocument[]>;
}
