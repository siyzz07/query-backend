export interface IDocumentService {
  getDocuments(userId: string): Promise<any[]>;
  createDocument(payload: {
    name: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    sizeBytes: number;
    additionalText: string;
    fileData?: string;
    secretKey?: string;
  }, secretKey: string): Promise<any>;
  deleteDocument(id: string, userId: string): Promise<void>;
}
