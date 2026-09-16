"use client";

import React from "react";
import { Clock, CheckCircle2, RotateCcw, Files } from "lucide-react";

interface ApprovalStatsCardsProps {
  stats: {
    pendingTotal: number;
    pendingLeader: number;
    pendingHR: number;
    approved: number;
    requestCancel: number;
    total: number;
  };
}

export const ApprovalStatsCards: React.FC<ApprovalStatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Chờ phê duyệt */}
      <div className="bg-white p-5 rounded-2xl border border-amber-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Chờ phê duyệt</span>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">
              {stats.pendingTotal}
            </span>
            <span className="text-sm font-medium text-slate-500">hồ sơ</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Cấp 1 (Ban): <b className="text-slate-700">{stats.pendingLeader}</b> • Cấp 2 (HCNS): <b className="text-slate-700">{stats.pendingHR}</b>
          </p>
        </div>
      </div>

      {/* 2. Đã duyệt */}
      <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Đã duyệt hoàn tất</span>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">
              {stats.approved}
            </span>
            <span className="text-sm font-medium text-slate-500">hồ sơ</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Đã trừ phép & tự động tính công</p>
        </div>
      </div>

      {/* 3. Yêu cầu hủy */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Đề nghị hủy đơn</span>
          <div className="p-2.5 rounded-xl bg-amber-100/60 text-amber-800">
            <RotateCcw className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-700 font-mono">
              {stats.requestCancel}
            </span>
            <span className="text-sm font-medium text-slate-500">đơn</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Chờ HCNS xét duyệt hoàn phép</p>
        </div>
      </div>

      {/* 4. Tổng hồ sơ */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-600">Tổng số hồ sơ</span>
          <div className="p-2.5 rounded-xl bg-blue-50 text-[#1b365d]">
            <Files className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-extrabold text-[#1b365d] font-mono">
              {stats.total}
            </span>
            <span className="text-sm font-medium text-slate-500">tổng cộng</span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">Tất cả đề xuất trên hệ thống</p>
        </div>
      </div>
    </div>
  );
};

