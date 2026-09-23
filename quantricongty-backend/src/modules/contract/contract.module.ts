import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ContractTemplate, ContractTemplateSchema } from '../../schemas/contract-template.schema.js';
import { Contract, ContractSchema } from '../../schemas/contract.schema.js';
import { ContractService } from './contract.service.js';
import { ContractController } from './contract.controller.js';
import { MinioModule } from '../minio/minio.module.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: ContractTemplate.name, schema: ContractTemplateSchema },
      { name: Contract.name, schema: ContractSchema },
    ]),
    MinioModule,
  ],
  controllers: [ContractController],
  providers: [ContractService],
  exports: [ContractService],
})
export class ContractModule {}
