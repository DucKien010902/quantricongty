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
import { ContractService } from './contract.service.js';
import { UploadableFile } from '../minio/minio.service.js';

@Controller('contracts')
export class ContractController {
  constructor(private readonly contractService: ContractService) {}

  // ==========================================
  // TEMPLATES
  // ==========================================

  @Post('templates/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadTemplate(
    @UploadedFile() file: any,
    @Body() body: { name: string; category?: string; description?: string }
  ) {
    return this.contractService.uploadTemplate(file, body);
  }

  @Get('templates')
  async listTemplates() {
    return this.contractService.listTemplates();
  }

  @Delete('templates/:id')
  async deleteTemplate(@Param('id') id: string) {
    return this.contractService.deleteTemplate(id);
  }

  // ==========================================
  // CONTRACTS
  // ==========================================

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async createContract(
    @UploadedFile() file: any,
    @Body() body: any
  ) {
    return this.contractService.createContract(file, body);
  }

  @Get()
  async listContracts(
    @Query('category') category?: string,
    @Query('status') status?: string,
    @Query('search') search?: string
  ) {
    return this.contractService.listContracts({ category, status, search });
  }

  @Delete(':id')
  async deleteContract(@Param('id') id: string) {
    return this.contractService.deleteContract(id);
  }
}
