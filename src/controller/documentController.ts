import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth';
import { IDocumentService } from '../interface/service.interface/document';
import { MESSAGES } from '../constants/messages';

export class DocumentController {
  private documentService: IDocumentService;

  constructor(documentService: IDocumentService) {
    this.documentService = documentService;
  }

  getDocuments = async (req: AuthenticatedRequest, res: Response) => {
    try {
      
      const email = req.query.email as string | undefined;
      const result = await this.documentService.getDocuments( email);
      res.json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to retrieve documents' });
    }
  };


// add new Document 
  createDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const secretKey = req.body?.secretKey;
      if (!secretKey) {
        return res.status(400).json({ error: MESSAGES.DOCUMENT.MISSING_FIELDS });
      }
      const result = await this.documentService.createDocument(req.body, String(secretKey));
      res.status(201).json(result);
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to create document' });
    }
  };

  // delete Document 
  deleteDocument = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const { id } = req.params;
      await this.documentService.deleteDocument(id, String(userId));
      res.json({ message: 'Document deleted successfully' });
    } catch (err: any) {
      res.status(500).json({ error: err.message || 'Failed to delete document' });
    }
  };
}
