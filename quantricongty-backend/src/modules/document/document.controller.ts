import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  Body,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { DocumentService } from './document.service.js';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: any,
    @Body() body: { title?: string; category?: string; description?: string; author?: string },
  ) {
    return this.documentService.uploadDocument(file, body);
  }

  @Get()
  async listDocuments(
    @Query('category') category?: string,
    @Query('search') search?: string,
  ) {
    return this.documentService.listDocuments({ category, search });
  }

  @Delete(':id')
  async deleteDocument(@Param('id') id: string) {
    return this.documentService.deleteDocument(id);
  }
}
