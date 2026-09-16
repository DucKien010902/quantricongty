import { Controller, Get, Post, Body } from '@nestjs/common';
import { CompanyService } from './company.service.js';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Get()
  async getCompany() {
    return this.companyService.getCompany();
  }

  @Post('initialize')
  async initializeCompany(@Body() data: any) {
    return this.companyService.updateCompany(data);
  }

  @Post('init-wizard')
  async initWizard(@Body() payload: any) {
    return this.companyService.initWizard(payload);
  }
}
