import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as Minio from 'minio';

export interface UploadableFile {
  fieldname?: string;
  originalname: string;
  encoding?: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private client: Minio.Client;
  private bucketName: string;
  private publicUrl: string;

  constructor() {
    const endPoint = process.env.MINIO_ENDPOINT || 'file.gennovax.vn';
    const port = Number(process.env.MINIO_PORT) || 443;
    const useSSL = process.env.MINIO_USE_SSL === 'true' || port === 443;
    const accessKey = process.env.MINIO_ACCESS_KEY || 'admin';
    const secretKey = process.env.MINIO_SECRET_KEY || 'admin2025';

    this.bucketName = process.env.MINIO_BUCKET || 'quantricongty';
    this.publicUrl = (
      process.env.MINIO_PUBLIC_URL ||
      process.env.URL_MINIO ||
      (useSSL ? `https://${endPoint}` : `http://${endPoint}:${port}`)
    ).replace(/\/$/, '');

    this.client = new Minio.Client({
      endPoint,
      port,
      useSSL,
      accessKey,
      secretKey,
    });
  }

  async onModuleInit() {
    await this.initBucket();
  }

  /**
   * Khởi tạo bucket và gán quyền Public Read nếu chưa có
   */
  async initBucket(): Promise<void> {
    try {
      const exists = await this.client.bucketExists(this.bucketName);
      if (!exists) {
        await this.client.makeBucket(this.bucketName);
        this.logger.log(`Created new MinIO bucket: ${this.bucketName}`);
      }

      const publicReadPolicy = {
        Version: '2012-10-17',
        Statement: [
          {
            Effect: 'Allow',
            Principal: '*',
            Action: ['s3:GetObject'],
            Resource: [`arn:aws:s3:::${this.bucketName}/*`],
          },
        ],
      };

      await this.client.setBucketPolicy(
        this.bucketName,
        JSON.stringify(publicReadPolicy)
      );
      this.logger.log(`MinIO bucket '${this.bucketName}' is ready with Public Read policy.`);
    } catch (err: any) {
      this.logger.warn(`MinIO init warning: ${err?.message || err}`);
    }
  }

  /**
   * Upload Buffer trực tiếp lên MinIO
   */
  async uploadBuffer(
    buffer: Buffer,
    objectKey: string,
    mimetype = 'application/octet-stream'
  ): Promise<{ url: string; objectKey: string }> {
    await this.client.putObject(this.bucketName, objectKey, buffer, buffer.length, {
      'Content-Type': mimetype,
    });

    const url = `${this.publicUrl}/${this.bucketName}/${objectKey}`;
    return { url, objectKey };
  }

  /**
   * Upload file Multer lên MinIO
   */
  async uploadFile(
    file: UploadableFile,
    folder = 'contracts/templates'
  ): Promise<{ url: string; objectKey: string; fileName: string; fileSize: string }> {
    const cleanFolder = folder.replace(/^\/+|\/+$/g, '');
    let originalName = file.originalname || 'document.docx';
    try {
      // Sửa lỗi mã hóa ký tự tiếng Việt từ Multer (latin1 -> utf8)
      originalName = Buffer.from(originalName, 'latin1').toString('utf8');
    } catch (e) {
      // fallback
    }

    const cleanOriginalName = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
    const safeFileName = `${Date.now()}_${cleanOriginalName}`;
    const objectKey = `${cleanFolder}/${safeFileName}`;

    await this.client.putObject(
      this.bucketName,
      objectKey,
      file.buffer,
      file.buffer.length,
      {
        'Content-Type': file.mimetype || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }
    );

    const url = `${this.publicUrl}/${this.bucketName}/${objectKey}`;
    const fileSize = `${(file.size / 1024).toFixed(0)} KB`;

    return {
      url,
      objectKey,
      fileName: originalName,
      fileSize,
    };
  }

  /**
   * Tải Buffer của một object từ MinIO
   */
  async getObjectBuffer(objectKey: string): Promise<Buffer> {
    const stream = await this.client.getObject(this.bucketName, objectKey);
    const chunks: Buffer[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });
  }

  /**
   * Xóa object trên MinIO
   */
  async deleteObject(objectKey: string): Promise<boolean> {
    try {
      await this.client.removeObject(this.bucketName, objectKey);
      this.logger.log(`Deleted MinIO object: ${objectKey}`);
      return true;
    } catch (err: any) {
      this.logger.warn(`Could not delete MinIO object '${objectKey}': ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Xóa nhiều object cùng lúc (dùng khi xóa thư mục)
   */
  async deleteObjects(objectKeys: string[]): Promise<boolean> {
    if (!objectKeys || objectKeys.length === 0) return true;
    try {
      await this.client.removeObjects(this.bucketName, objectKeys);
      return true;
    } catch (err: any) {
      this.logger.warn(`Could not delete MinIO objects: ${err?.message || err}`);
      return false;
    }
  }

  /**
   * Liệt kê danh sách object theo prefix
   */
  async listObjects(prefix = ''): Promise<any[]> {
    const stream = this.client.listObjectsV2(this.bucketName, prefix, true);
    const objects: any[] = [];
    return new Promise((resolve, reject) => {
      stream.on('data', (obj) => {
        objects.push({
          name: obj.name,
          size: obj.size,
          lastModified: obj.lastModified,
          url: `${this.publicUrl}/${this.bucketName}/${obj.name}`,
        });
      });
      stream.on('end', () => resolve(objects));
      stream.on('error', (err) => reject(err));
    });
  }
}
