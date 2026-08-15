import { IDocumentService } from '../../interface/service.interface/document';
import { IAIService } from '../../interface/service.interface/ai';
import { ICommonService } from '../../interface/service.interface/common';
import { IUserRepository } from '../../interface/repository.interface/user.repository';
import { IDocumentRepository } from '../../interface/repository.interface/document.repository';
import { IDocumentChunkRepository } from '../../interface/repository.interface/documentChunk.repository';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { AppError } from '../../middleware/errorHandler';
import { MESSAGES } from '../../constants/messages';
import { STATUS_CODES } from '../../constants/status';

export class DocumentService implements IDocumentService {
  private aiService: IAIService;
  private commonService: ICommonService;
  private userRepository: IUserRepository;
  private documentRepository: IDocumentRepository;
  private documentChunkRepository: IDocumentChunkRepository;

  constructor(
    aiService: IAIService,
    commonService: ICommonService,
    userRepository: IUserRepository,
    documentRepository: IDocumentRepository,
    documentChunkRepository: IDocumentChunkRepository
  ) {
    this.aiService = aiService;
    this.commonService = commonService;
    this.userRepository = userRepository;
    this.documentRepository = documentRepository;
    this.documentChunkRepository = documentChunkRepository;
  }

  // get the documents of the vendor
  getDocuments = async (userId: string): Promise<any[]> => {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', STATUS_CODES.NOT_FOUND);
    }

    const docs = await this.documentRepository.findBySecretKeySorted(user.secretKey);
    return docs.map((doc: any) => ({
      id: doc._id.toString(),
      name: doc.name,
      fileName: doc.fileName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      sizeBytes: doc.sizeBytes,
      uploadedAt: doc.uploadedAt,
      additionalText: doc.additionalText
    }));
  };


  // add new document 

  createDocument = async (payload: {
    name: string;
    fileName: string;
    fileType: string;
    fileSize: string;
    sizeBytes: number;
    additionalText: string;
    fileData?: string;
    secretKey?: string;
  }, secretKey: string): Promise<any> => {
    const { name, fileName, fileType, fileSize, sizeBytes, additionalText, fileData } = payload;
    
    const user = await this.userRepository.findOne({ secretKey });
    if (!user) {
      throw new AppError(MESSAGES.VENDOR.VENDOR_NOT_FOUND, STATUS_CODES.NOT_FOUND);
    }

    const candidateKeys = this.commonService.getCandidateKeys(user.apiKey);
    if (candidateKeys.length === 0) {
      throw new AppError("Gemini API key is not available", STATUS_CODES.BAD_REQUEST);
    }
    
    const userApiKey = user.apiKey || candidateKeys[0];
    const secretKeyToUse = payload.secretKey || user.secretKey;

    let extractedText = '';

    if (fileData) {
      const extension = fileName.split('.').pop()?.toLowerCase() || '';
      //------------------------------- need to check----------------------------------------------------
      if (extension === 'pdf') {
        extractedText = await this.aiService.extractTextFromDoc(fileData, 'application/pdf', userApiKey);
      } else if (['png', 'jpg', 'jpeg', 'webp'].includes(extension)) {
        extractedText = await this.aiService.extractTextFromDoc(fileData, `image/${extension === 'jpg' ? 'jpeg' : extension}`, userApiKey);
      } else {
        const base64Str = fileData.includes(',') ? fileData.split(',')[1] : fileData;
        extractedText = Buffer.from(base64Str, 'base64').toString('utf8');
      }
    }


    console.log('extractd text from the pdf', extractedText)

    const finalContent = `${additionalText || ''}\n\n${extractedText}`.trim() || name;

    console.log('final content--------->>>>>>>>>>>>>>>>>', finalContent)
    //---------------------------- need to check
    console.log(`[DocumentService] Generating main embedding for document "${name}"...`);
    const embedding = await this.aiService.generateEmbedding(finalContent, userApiKey);

    console.log('embedding----------------------------------------------------------', embedding)

    const uploadedAt = new Date().toLocaleString();
    const result = await this.documentRepository.create({
      name,
      fileName,
      fileType,
      fileSize,
      sizeBytes,
      uploadedAt,
      additionalText: finalContent,
      embedding,
      secretKey: secretKeyToUse
    });

    //----------------- need chekc -------------------------------------
    console.log(`[DocumentService] Splitting content using LangChain RecursiveCharacterTextSplitter...`);
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 300,
      chunkOverlap: 10
    });
    const chunkTexts = await splitter.splitText(finalContent);


    console.log('chunkTexts------------------------->>>>>>>>>>>>>>>>>', chunkTexts)

    console.log(`[DocumentService] Generating embedding for ${chunkTexts.length} chunks sequentially...`);
    // --------------------- need to check-----------------
    for (const chunkText of chunkTexts) {
      const chunkEmbedding = await this.aiService.generateEmbedding(chunkText, userApiKey);
      await this.documentChunkRepository.create({
        documentId: result._id,
        documentTitle: name,
        secretKey: secretKeyToUse,
        text: chunkText,
        embedding: chunkEmbedding
      });
    }

    return {
      id: result._id.toString(),
      name: result.name,
      fileName: result.fileName,
      fileType: result.fileType,
      fileSize: result.fileSize,
      sizeBytes: result.sizeBytes,
      uploadedAt: result.uploadedAt,
      additionalText: result.additionalText
    };
  };

  //----- delete document 
  deleteDocument = async (id: string, userId: string): Promise<void> => {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new AppError('User not found', STATUS_CODES.NOT_FOUND);
    }

    const doc = await this.documentRepository.findOne({ _id: id, secretKey: user.secretKey });
    if (!doc) {
      throw new AppError('Document not found', STATUS_CODES.NOT_FOUND);
    }

    await this.documentRepository.delete(id);
    await this.documentChunkRepository.deleteChunksByDocumentId(id);
  };
}
