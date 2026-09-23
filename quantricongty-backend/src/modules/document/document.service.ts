import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CompanyDocument, DocumentDocument } from './document.schema.js';
import { MinioService, UploadableFile } from '../minio/minio.service.js';

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(CompanyDocument.name)
    private readonly documentModel: Model<DocumentDocument>,
    private readonly minioService: MinioService,
  ) {}

  async uploadDocument(
    file: UploadableFile,
    body: { title?: string; category?: string; description?: string; author?: string },
  ) {
    if (!file) {
      throw new Error('Vui lòng chọn tệp tài liệu cần tải lên!');
    }

    // Tải lên MinIO folder "documents"
    const minioResult = await this.minioService.uploadFile(file, 'documents');

    // Xác định định dạng tệp
    let originalName = minioResult.fileName;
    let extension = originalName.split('.').pop()?.toUpperCase() || 'FILE';
    let docType = 'OTHER';
    if (['PDF'].includes(extension)) docType = 'PDF';
    else if (['DOC', 'DOCX'].includes(extension)) docType = 'DOCX';
    else if (['XLS', 'XLSX', 'CSV'].includes(extension)) docType = 'XLSX';
    else if (['PPT', 'PPTX'].includes(extension)) docType = 'PPTX';
    else if (['ZIP', 'RAR', '7Z'].includes(extension)) docType = 'ZIP';
    else if (['PNG', 'JPG', 'JPEG', 'WEBP', 'SVG'].includes(extension)) docType = 'IMAGE';

    const newDoc = new this.documentModel({
      title: body.title?.trim() || originalName.replace(/\.[^/.]+$/, ''),
      category: body.category || 'rules',
      type: docType,
      size: minioResult.fileSize,
      fileUrl: minioResult.url,
      objectKey: minioResult.objectKey,
      author: body.author || 'Ban Giám Đốc',
      description: body.description || '',
    });

    return await newDoc.save();
  }

  async listDocuments(query: { category?: string; search?: string }) {
    const filter: any = {};
    if (query.category && query.category !== 'all') {
      filter.category = query.category;
    }
    if (query.search && query.search.trim()) {
      const regex = new RegExp(query.search.trim(), 'i');
      filter.$or = [{ title: regex }, { author: regex }, { description: regex }];
    }

    return await this.documentModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async deleteDocument(id: string) {
    const doc = await this.documentModel.findById(id);
    if (!doc) {
      throw new NotFoundException('Không tìm thấy tài liệu này!');
    }

    if (doc.objectKey) {
      await this.minioService.deleteObject(doc.objectKey);
    }

    await this.documentModel.findByIdAndDelete(id);
    return { success: true, message: 'Đã xóa tài liệu khỏi hệ thống và MinIO S3 thành công!' };
  }
}
