"use client";

import React from "react";
import { Search } from "lucide-react";

interface ApprovalFilterBarProps {
  selectedType: string;
  onSelectType: (type: string) => void;
  typeCounts: {
    all: number;
    leave: number;
    trip: number;
    document: number;
  };
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onSelectStatus: (s: string) => void;
  stats: {
    total: number;
    pendingTotal: number;
    approved: number;
    requestCancel: number;
    rejectedOrCancelled: number;
  };
}

export const ApprovalFilterBar: React.FC<ApprovalFilterBarProps> = ({
  selectedType,
  onSelectType,
  typeCounts,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onSelectStatus,
  stats,
}) => {
  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
      {/* Tabs loại yêu cầu */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 pb-3">
        {[
          { id: "all", label: "Tất cả đề xuất", count: typeCounts.all },
          { id: "leave", label: "Đơn nghỉ phép", count: typeCounts.leave },
          { id: "trip", label: "Đề xuất công tác", count: typeCounts.trip },
          { id: "document", label: "Up tài liệu", count: typeCounts.document },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onSelectType(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
              selectedType === tab.id
                ? "bg-[#1b365d] text-white shadow-xs font-bold"
                : "bg-slate-50 text-slate-600 hover:bg-slate-100"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                selectedType === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Thanh tìm kiếm & Lọc trạng thái */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tiêu đề, nhân sự, phòng ban..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => onSelectStatus(e.target.value)}
            className="w-full sm:w-auto text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
          >
            <option value="all">Tất cả trạng thái ({stats.total})</option>
            <option value="pending">Chờ phê duyệt ({stats.pendingTotal})</option>
            <option value="APPROVED">Đã duyệt hoàn tất ({stats.approved})</option>
            <option value="REQUEST_CANCEL">Yêu cầu hủy đơn ({stats.requestCancel})</option>
            <option value="closed">Đã từ chối / Đã hủy ({stats.rejectedOrCancelled})</option>
          </select>
        </div>
      </div>
    </div>
  );
};

