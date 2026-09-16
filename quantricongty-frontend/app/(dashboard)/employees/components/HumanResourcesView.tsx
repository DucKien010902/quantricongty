"use client";

import React from "react";
import { Plus, Upload, Download, Users } from "lucide-react";
import EmployeeTable from "./EmployeeTable";
import { Employee } from "@/app/data/seed-employees";

interface HumanResourcesViewProps {
  employees: Employee[];
  departments: any[];
  searchQuery: string;
  selectedDepartment?: string;
  onSelectDepartment?: (dept: string) => void;
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (id: string) => void;
  onSendInviteClick: (emp: Employee) => void;
  onAddEmployeeClick: () => void;
  onOpenImportModal: () => void;
  onDownloadTemplate: () => void;
  canManage?: boolean;
  canExport?: boolean;
  isLeaderOnly?: boolean;
  userDepartment?: string;
}

export default function HumanResourcesView({
  employees,
  departments,
  searchQuery,
  selectedDepartment,
  onSelectDepartment,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onSendInviteClick,
  onAddEmployeeClick,
  onOpenImportModal,
  onDownloadTemplate,
  canManage = true,
  canExport = true,
  isLeaderOnly = false,
  userDepartment,
}: HumanResourcesViewProps) {
  return (
    <div className="space-y-5">
      {/* Header banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[#1b365d]" />
            Quản lý nhân sự & Cán bộ
            <span className="text-xs font-extrabold px-3 py-1 rounded-full bg-blue-50 text-[#1b365d] border border-blue-200">
              {employees.length} cán bộ
            </span>
            {isLeaderOnly && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                Phòng ban: {userDepartment || "Nội bộ Ban"} (Chỉ xem)
              </span>
            )}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            {isLeaderOnly
              ? `Xem danh sách nhân sự thuộc ${userDepartment || "ban chuyên môn"} của bạn (Quyền: Chỉ xem)`
              : "Quản lý hồ sơ nhân sự, phân ban phòng, chức danh và phân quyền nội bộ"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          {canExport && (
            <button
              onClick={onDownloadTemplate}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all"
              title="Tải mẫu Excel"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span className="hidden sm:inline">Tải mẫu Excel</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={onOpenImportModal}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all"
              title="Nhập từ Excel"
            >
              <Upload className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Nhập Excel</span>
            </button>
          )}

          {canManage && (
            <button
              onClick={onAddEmployeeClick}
              className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Thêm nhân viên</span>
            </button>
          )}
        </div>
      </div>

      {/* Bảng danh sách */}
      <EmployeeTable
        employees={employees}
        departments={departments}
        searchQuery={searchQuery}
        selectedDepartment={selectedDepartment}
        onDepartmentChange={onSelectDepartment}
        onViewEmployee={onViewEmployee}
        onEditEmployee={onEditEmployee}
        onDeleteEmployee={onDeleteEmployee}
        onSendInviteClick={onSendInviteClick}
        onAddEmployeeClick={onAddEmployeeClick}
        canManage={canManage}
      />
    </div>
  );
}
