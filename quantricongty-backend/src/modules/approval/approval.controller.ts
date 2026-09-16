import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { ApprovalService } from './approval.service.js';

@Controller('approvals')
export class ApprovalController {
  constructor(private readonly approvalService: ApprovalService) {}

  @Get()
  async findAll(
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('department') department?: string,
  ) {
    return this.approvalService.findAll(type, status, department);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.approvalService.findOne(id);
  }

  @Post()
  async create(@Body() data: any) {
    return this.approvalService.create(data);
  }

  @Put(':id/leader-approve')
  async leaderApprove(
    @Param('id') id: string,
    @Body() body: { approverCode: string; approverName: string; isApproved: boolean; note?: string },
  ) {
    return this.approvalService.leaderApprove(
      id,
      body.approverCode,
      body.approverName,
      body.isApproved,
      body.note,
    );
  }

  @Put(':id/hr-approve')
  async hrApprove(
    @Param('id') id: string,
    @Body() body: { approverCode: string; approverName: string; isApproved: boolean; note?: string },
  ) {
    return this.approvalService.hrApprove(
      id,
      body.approverCode,
      body.approverName,
      body.isApproved,
      body.note,
    );
  }

  @Put(':id/cancel')
  async cancelRequest(
    @Param('id') id: string,
    @Body() body: { userCode: string; userName: string; reason?: string },
  ) {
    return this.approvalService.cancelRequest(
      id,
      body.userCode,
      body.userName,
      body.reason,
    );
  }

  @Put(':id/hr-approve-cancel')
  async hrApproveCancel(
    @Param('id') id: string,
    @Body() body: { hrCode: string; hrName: string; isApproved: boolean; note?: string },
  ) {
    return this.approvalService.hrApproveCancel(
      id,
      body.hrCode,
      body.hrName,
      body.isApproved,
      body.note,
    );
  }
}
