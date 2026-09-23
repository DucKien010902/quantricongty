import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentController } from './document.controller.js';
import { DocumentService } from './document.service.js';
import { CompanyDocument, DocumentSchema } from './document.schema.js';
import { MinioModule } from '../minio/minio.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: CompanyDocument.name, schema: DocumentSchema }]),
    MinioModule,
  ],
  controllers: [DocumentController],
  providers: [DocumentService],
  exports: [DocumentService],
})
export class DocumentModule {}
