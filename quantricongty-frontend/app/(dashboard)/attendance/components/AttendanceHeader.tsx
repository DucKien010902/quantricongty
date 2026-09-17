"use client";

import React from "react";
import {
  CalendarCheck,
  ShieldCheck,
  UserCheck,
  Calendar,
  Server,
  Upload,
  Download,
  Trash2,
} from "lucide-react";

interface AttendanceHeaderProps {
  isHRAdmin: boolean;
  canManage: boolean;
  canExport: boolean;
  canViewAll: boolean;
  currentEmployee: any;
  currentUser: any;
  selectedMonth: string;
  onMonthChange: (m: string) => void;
  onOpenDeviceModal: () => void;
  onOpenExcelModal: () => void;
  onExportExcel: () => void;
  onClearAll: () => void;
}

export default function AttendanceHeader({
  isHRAdmin,
  canManage,
  canExport,
  canViewAll,
  currentEmployee,
  currentUser,
  selectedMonth,
  onMonthChange,
  onOpenDeviceModal,
  onOpenExcelModal,
  onExportExcel,
  onClearAll,
}: AttendanceHeaderProps) {
  const myCode = currentEmployee?.code || currentUser?.code || "";

  return (
    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#1b365d]" />
            {isHRAdmin ? "Quản trị chấm công" : "Bảng chấm công cá nhân"}
          </h1>
          {isHRAdmin ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quyền: Quản trị Chấm công toàn công ty</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 shadow-2xs">
              <UserCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>
                Cá nhân: {currentEmployee?.name || currentUser?.name} ({myCode || "NV"})
              </span>
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 font-medium mt-1">
          {isHRAdmin
            ? "Bảng chấm công và quản lý dữ liệu quẹt thẻ nhân sự toàn công ty"
            : "Theo dõi thời gian làm việc, lượt quẹt thẻ và công chuẩn cá nhân"}
        </p>
      </div>

      {/* TOP ACTION BUTTONS */}
      <div className="flex flex-wrap items-center gap-2.5">
        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedMonth}
            onChange={(e) => onMonthChange(e.target.value)}
            className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
          >
            <option value="2026-09">Tháng 09/2026</option>
            <option value="2026-08">Tháng 08/2026</option>
            <option value="2026-10">Tháng 10/2026</option>
          </select>
        </div>

        {/* Action 1 & 2: Kéo máy & Nhập Excel (Chỉ hiển thị cho vai trò Quản lý) */}
        {canManage && (
          <>
            <button
              onClick={onOpenDeviceModal}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Server className="w-4 h-4 text-blue-200" />
              <span>Kéo dữ liệu máy chấm công</span>
            </button>

            <button
              onClick={onOpenExcelModal}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Upload className="w-4 h-4" />
              <span>Nhập file Excel</span>
            </button>
          </>
        )}

        {/* Action 3: Xuất Excel */}
        {canExport && (
          <button
            onClick={onExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all"
            title={canViewAll ? "Xuất bảng tính Excel toàn công ty" : "Xuất bảng tính Excel cá nhân"}
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>
        )}

        {/* Action 4: Reset dữ liệu */}
        {canManage && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/80 shadow-2xs transition-all"
            title="Xóa toàn bộ dữ liệu để kiểm thử dữ liệu thực tế"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Reset dữ liệu</span>
          </button>
        )}
      </div>
    </div>
  );
}
