import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ContractTemplate, ContractTemplateDocument } from '../../schemas/contract-template.schema.js';
import { Contract, ContractDocument } from '../../schemas/contract.schema.js';
import { MinioService, UploadableFile } from '../minio/minio.service.js';

@Injectable()
export class ContractService {
  private readonly logger = new Logger(ContractService.name);

  constructor(
    @InjectModel(ContractTemplate.name)
    private templateModel: Model<ContractTemplateDocument>,
    @InjectModel(Contract.name)
    private contractModel: Model<ContractDocument>,
    private readonly minioService: MinioService,
  ) {}

  // ==========================================
  // TEMPLATES MANAGEMENT (KHO MẪU BIỂU .DOCX)
  // ==========================================

  /**
   * Upload tệp mẫu Word lên MinIO và lưu vào MongoDB
   */
  async uploadTemplate(
    file: UploadableFile,
    body: { name: string; category?: string; description?: string }
  ): Promise<ContractTemplate> {
    if (!file || !file.buffer) {
      throw new BadRequestException('Vui lòng chọn tệp Word (.docx) để tải lên!');
    }
    if (!body.name || !body.name.trim()) {
      throw new BadRequestException('Vui lòng nhập tên biểu mẫu hợp đồng!');
    }

    // Upload lên MinIO thư mục contracts/templates/
    const uploadRes = await this.minioService.uploadFile(file, 'contracts/templates');

    const newTemplate = await this.templateModel.create({
      name: body.name.trim(),
      category: body.category || 'labor',
      fileName: uploadRes.fileName,
      fileUrl: uploadRes.url,
      objectKey: uploadRes.objectKey,
      fileSize: uploadRes.fileSize,
      description: body.description || '',
      isSystemDefault: false,
    });

    this.logger.log(`Uploaded template: ${newTemplate.name} -> ${uploadRes.url}`);
    return newTemplate;
  }

  /**
   * Lấy danh sách tất cả biểu mẫu hợp đồng
   */
  async listTemplates(): Promise<ContractTemplate[]> {
    return this.templateModel.find().sort({ createdAt: -1 }).lean();
  }

  /**
   * Xóa biểu mẫu khỏi MongoDB và MinIO
   */
  async deleteTemplate(id: string): Promise<{ success: boolean; message: string }> {
    const template = await this.templateModel.findById(id);
    if (!template) {
      throw new NotFoundException('Không tìm thấy biểu mẫu hợp đồng cần xóa!');
    }

    if (template.objectKey) {
      await this.minioService.deleteObject(template.objectKey);
    }

    await this.templateModel.findByIdAndDelete(id);
    this.logger.log(`Deleted template: ${template.name} (${id})`);
    return { success: true, message: `Đã xóa biểu mẫu "${template.name}" thành công!` };
  }

  // ==========================================
  // CONTRACTS MANAGEMENT (DANH SÁCH HỢP ĐỒNG ĐÃ LÀM)
  // ==========================================

  /**
   * Lưu hợp đồng mới đã sinh (kèm tệp docx lưu lên MinIO)
   */
  async createContract(
    file: UploadableFile | undefined,
    body: any
  ): Promise<Contract> {
    let fileUrl = '';
    let objectKey = '';
    let fileSize = '0 KB';

    if (file && file.buffer) {
      const uploadRes = await this.minioService.uploadFile(file, 'contracts/generated');
      fileUrl = uploadRes.url;
      objectKey = uploadRes.objectKey;
      fileSize = uploadRes.fileSize;
    }

    // Kiểm tra trùng mã hợp đồng
    const existing = await this.contractModel.findOne({ code: body.code });
    if (existing) {
      body.code = `${body.code}-${Date.now().toString().slice(-4)}`;
    }

    const newContract = await this.contractModel.create({
      code: body.code,
      title: body.title,
      category: body.category || 'labor',
      templateId: body.templateId || '',
      templateName: body.templateName || '',
      employeeId: body.employeeId || '',
      employeeName: body.employeeName || body.partyB,
      partyB: body.partyB,
      partyBType: body.partyBType || 'employee',
      salary: Number(body.salary) || 0,
      startDate: body.startDate || '',
      endDate: body.endDate || '',
      signDate: body.signDate || '',
      fileUrl: fileUrl || body.fileUrl || '',
      objectKey: objectKey || body.objectKey || '',
      fileSize: fileSize || body.fileSize || '45 KB',
      status: body.status || 'active',
      author: body.author || 'Ban Pháp Chế & Nhân Sự',
    });

    this.logger.log(`Created contract: ${newContract.code} -> ${newContract.fileUrl}`);
    return newContract;
  }

  /**
   * Danh sách hợp đồng đã làm kèm bộ lọc
   */
  async listContracts(query: { category?: string; status?: string; search?: string }): Promise<Contract[]> {
    const filter: any = {};

    if (query.category && query.category !== 'all') {
      if (query.category === 'economic') {
        filter.category = { $in: ['economic', 'service'] };
      } else {
        filter.category = query.category;
      }
    }

    if (query.status && query.status !== 'all') {
      filter.status = query.status;
    }

    if (query.search && query.search.trim()) {
      const q = query.search.trim();
      filter.$or = [
        { code: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { partyB: { $regex: q, $options: 'i' } },
        { author: { $regex: q, $options: 'i' } },
      ];
    }

    return this.contractModel.find(filter).sort({ createdAt: -1 }).lean();
  }

  /**
   * Xóa hợp đồng khỏi MongoDB và MinIO
   */
  async deleteContract(id: string): Promise<{ success: boolean; message: string }> {
    const contract = await this.contractModel.findById(id);
    if (!contract) {
      throw new NotFoundException('Không tìm thấy hợp đồng cần xóa!');
    }

    if (contract.objectKey) {
      await this.minioService.deleteObject(contract.objectKey);
    }

    await this.contractModel.findByIdAndDelete(id);
    this.logger.log(`Deleted contract: ${contract.code} (${id})`);
    return { success: true, message: `Đã xóa hợp đồng "${contract.code}" thành công!` };
  }
}
