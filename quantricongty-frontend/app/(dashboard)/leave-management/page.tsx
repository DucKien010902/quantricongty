"use client";

import React, { useState, useMemo } from "react";
import {
  Users,
  CalendarCheck,
  Clock,
  Search,
  Filter,
  Edit3,
  History,
  CheckCircle2,
  X,
  Sparkles,
  Building2,
  CalendarDays,
  FileSpreadsheet,
  Palmtree,
  Info,
  ShieldAlert,
  ShieldCheck,
  Home,
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import { usePermission } from "@/app/hooks/usePermission";
import { Employee } from "@/app/data/seed-employees";
import Modal from "@/app/components/ui/Modal";

interface LeaveHistoryItem {
  id: string;
  code: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  reason: string;
  status: "approved" | "pending" | "rejected" | "cancelled";
  createdAt: string;
}

import { ActionConfirmModal, ConfirmVariant } from "@/app/components/ui/ActionConfirmModal";
import { StatusFeedbackModal, FeedbackType } from "@/app/components/ui/StatusFeedbackModal";

export default function LeaveManagementPage() {
  const { currentUser, isAuthLoaded, employees, departments, showToast, handleUpdateEmployee } = useApp();
  const { can } = usePermission();

  const canViewLeaveManagement = can("leave_management.view");
  const canManageLeave = can("leave_management.manage");
  const canExportLeave = can("leave_management.export");

  const currentEmployee = useMemo(() => {
    if (!currentUser) return null;
    return (
      employees?.find(
        (e) =>
          (e.code && e.code === currentUser.code) ||
          (e.email && e.email.toLowerCase() === (currentUser.email || "").toLowerCase()) ||
          e.name === currentUser.name
      ) || currentUser
    );
  }, [currentUser, employees]);

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDept, setSelectedDept] = useState<string>("all");
  const [selectedAlertStatus, setSelectedAlertStatus] = useState<string>("all");

  // Confirmation & Feedback modals state
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: ConfirmVariant;
    confirmText: string;
    onConfirmAction: () => Promise<void> | void;
    itemDetails?: { label: string; value: string }[];
  } | null>(null);

  const [feedbackState, setFeedbackState] = useState<{
    isOpen: boolean;
    type: FeedbackType;
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });

  // State modal chỉnh sửa phép
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [quotaForm, setQuotaForm] = useState<{
    annualQuota: number;
    carriedQuota: number;
    adjustmentDays: number;
    note: string;
  }>({
    annualQuota: 12,
    carriedQuota: 0,
    adjustmentDays: 0,
    note: "",
  });

  // State modal xem lịch sử đơn nghỉ phép
  const [historyEmp, setHistoryEmp] = useState<Employee | null>(null);

  // Mock lịch sử đơn nghỉ phép mẫu cho từng nhân sự
  const mockLeaveHistories: Record<string, LeaveHistoryItem[]> = {
    "DHI-002": [
      {
        id: "lh-1",
        code: "DX-2026-004",
        leaveType: "Nghỉ phép năm",
        startDate: "02/09/2026",
        endDate: "02/09/2026",
        daysCount: 1,
        reason: "Nghỉ phép cá nhân giải quyết việc gia đình",
        status: "approved",
        createdAt: "01/09/2026",
      },
      {
        id: "lh-2",
        code: "DX-2026-008",
        leaveType: "Nghỉ phép năm",
        startDate: "25/09/2026",
        endDate: "26/09/2026",
        daysCount: 2,
        reason: "Nghỉ mát gia đình hàng năm",
        status: "pending",
        createdAt: "14/09/2026",
      },
    ],
    "DHI-001": [
      {
        id: "lh-3",
        code: "DX-2026-002",
        leaveType: "Nghỉ phép năm",
        startDate: "10/08/2026",
        endDate: "11/08/2026",
        daysCount: 2,
        reason: "Khám sức khỏe tổng quát",
        status: "approved",
        createdAt: "08/08/2026",
      },
    ],
  };

  // Tính toán số liệu thống kê toàn công ty
  const totalEmployees = employees.length > 0 ? employees.length : 12;

  const totalQuota = useMemo(() => {
    return employees.reduce((sum, emp) => {
      const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
      const carried = emp.carriedOverLeave || 0;
      return sum + quota + carried;
    }, 0);
  }, [employees]);

  const totalUsed = useMemo(() => {
    return employees.reduce((sum, emp) => sum + (emp.usedLeave || 0), 0);
  }, [employees]);

  const totalRemaining = Math.max(0, totalQuota - totalUsed);

  // Filter nhân viên theo từ khóa, phòng ban & cảnh báo phép
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      const nameMatch =
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.code || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (emp.position || "").toLowerCase().includes(searchQuery.toLowerCase());

      const deptMatch =
        selectedDept === "all" ||
        emp.department?.toLowerCase() === selectedDept.toLowerCase();

      const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
      const carried = emp.carriedOverLeave || 0;
      const used = emp.usedLeave || 0;
      const remaining = Math.max(0, quota + carried - used);

      let alertMatch = true;
      if (selectedAlertStatus === "low") {
        alertMatch = remaining <= 3;
      } else if (selectedAlertStatus === "high") {
        alertMatch = remaining >= 8;
      }

      return nameMatch && deptMatch && alertMatch;
    });
  }, [employees, searchQuery, selectedDept, selectedAlertStatus]);

  // Mở modal sửa phép cho 1 nhân viên
  const handleOpenEditModal = (emp: Employee) => {
    setEditingEmp(emp);
    const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
    const carried = emp.carriedOverLeave || 0;
    setQuotaForm({
      annualQuota: quota,
      carriedQuota: carried,
      adjustmentDays: 0,
      note: "Điều chỉnh định kỳ phép năm 2026",
    });
  };

  // Lưu cập nhật phép cho nhân viên (có xác nhận)
  const handleSaveQuotaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEmp) return;

    const newAnnualQuota = Number(quotaForm.annualQuota) || 0;
    const newCarriedQuota = Number(quotaForm.carriedQuota) || 0;
    const adj = Number(quotaForm.adjustmentDays) || 0;
    const currentUsed = editingEmp.usedLeave || 0;

    const totalAllowed = newAnnualQuota + newCarriedQuota + adj;
    const newRemaining = Math.max(0, totalAllowed - currentUsed);

    setConfirmModalState({
      isOpen: true,
      title: "Xác Nhận Cập Nhật Quỹ Phép",
      description: `Bạn có chắc chắn muốn cập nhật chỉ tiêu phép cho nhân sự ${editingEmp.name}?`,
      variant: "primary",
      confirmText: "Lưu thay đổi",
      itemDetails: [
        { label: "Cán bộ nhân sự", value: editingEmp.name },
        { label: "Phép năm 2026", value: `${newAnnualQuota} ngày` },
        { label: "Phép tồn 2025", value: `${newCarriedQuota} ngày` },
        { label: "Còn lại sau khi điều chỉnh", value: `${newRemaining} ngày` },
      ],
      onConfirmAction: async () => {
        try {
          await handleUpdateEmployee(editingEmp.id, {
            annualLeaveQuota: newAnnualQuota + adj,
            carriedOverLeave: newCarriedQuota,
            usedLeave: currentUsed,
            remainingLeave: newRemaining,
          });
          setEditingEmp(null);
          setFeedbackState({
            isOpen: true,
            type: "success",
            title: "Cập Nhật Quỹ Phép Thành Công!",
            message: `Đã lưu cập nhật quỹ phép cho nhân sự ${editingEmp.name}. Phép mới còn lại là ${newRemaining} ngày.`,
          });
        } catch (err: any) {
          setFeedbackState({
            isOpen: true,
            type: "error",
            title: "Cập Nhật Thất Bại!",
            message: err.message || "Có lỗi xảy ra khi cập nhật phép!",
          });
        }
      },
    });
  };

  // Khởi tạo phép năm 2026 hàng loạt (có xác nhận)
  const handleBatchInitQuotaPrompt = () => {
    setConfirmModalState({
      isOpen: true,
      title: "Xác Nhận Khởi Tạo Phép Hàng Loạt",
      description: "Bạn có chắc chắn muốn chuẩn hóa và khởi tạo chỉ tiêu quỹ phép năm 2026 cho toàn bộ cán bộ công ty?",
      variant: "warning",
      confirmText: "Khởi tạo hàng loạt",
      itemDetails: [
        { label: "Tổng số nhân sự", value: `${employees.length} cán bộ` },
        { label: "Chỉ tiêu chuẩn", value: "12 ngày / năm" },
      ],
      onConfirmAction: async () => {
        try {
          employees.forEach((emp) => {
            const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
            const carried = emp.carriedOverLeave || 0;
            const used = emp.usedLeave || 0;
            const remaining = Math.max(0, quota + carried - used);

            handleUpdateEmployee(emp.id, {
              annualLeaveQuota: quota,
              carriedOverLeave: carried,
              usedLeave: used,
              remainingLeave: remaining,
            });
          });
          setFeedbackState({
            isOpen: true,
            type: "success",
            title: "Khởi Tạo Hàng Loạt Thành Công!",
            message: `Đã chuẩn hóa và phân bổ chỉ tiêu quỹ phép năm 2026 cho toàn bộ ${employees.length} cán bộ nhân sự!`,
          });
        } catch (err: any) {
          setFeedbackState({
            isOpen: true,
            type: "error",
            title: "Khởi Tạo Thất Bại!",
            message: err.message || "Có lỗi xảy ra khi khởi tạo hàng loạt!",
          });
        }
      },
    });
  };

  // Xuất file Excel báo cáo phép
  const handleExportLeaveReport = () => {
    setFeedbackState({
      isOpen: true,
      type: "info",
      title: "Đang Kết Xuất Báo Cáo!",
      message: "Đã tạo yêu cầu tải về file Excel báo cáo tổng hợp chỉ tiêu quỹ phép năm 2026 (.XLSX).",
    });
  };

  // Nếu đã nạp auth và người dùng không có quyền Quản lý phép: Chặn truy cập theo Ma trận phân quyền
  if (isAuthLoaded && currentUser && !canViewLeaveManagement) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Giới hạn quyền truy cập
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              Trang Quản lý phép nhân viên chỉ dành riêng cho <b>Quản trị viên (Admin)</b> và bộ phận <b>Hành chính - Nhân sự (HCNS)</b> để khởi tạo, cấp phát và điều chỉnh quỹ phép toàn công ty.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium text-left">
            <div>Tài khoản: <b className="text-slate-900">{currentEmployee?.name || currentUser?.name}</b></div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Chức danh: {currentEmployee?.position || currentEmployee?.jobTitle || "Nhân viên"} • Ban: {currentEmployee?.department || "Chuyên môn"}
            </div>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <Link
              href="/leave"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold transition-all shadow-md shadow-[#1b365d]/20 flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              <span>Xem đơn phép của tôi</span>
            </Link>
            <Link
              href="/"
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span>Về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto text-slate-800">
      {/* 1. HEADER CHUẨN TRANG XIN NGHĨ PHÉP (KHUNG TRẮNG SẠCH SẼ) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
              <CalendarCheck className="w-6 h-6 text-[#1b365d]" />
              Quản lý phép nhân viên
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quyền: Quản trị Quỹ Phép toàn công ty</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Theo dõi, khởi tạo, cập nhật chỉ tiêu phép năm và điều chỉnh phép cho từng nhân sự toàn công ty
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {canManageLeave && (
            <button
              type="button"
              onClick={handleBatchInitQuotaPrompt}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all shadow-2xs cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#1b365d]" />
              <span>Khởi tạo phép hàng loạt</span>
            </button>
          )}
          {canExportLeave && (
            <button
              type="button"
              onClick={handleExportLeaveReport}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold transition-all shadow-md shadow-[#1b365d]/20 cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Xuất báo cáo phép</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. CỤM 4 THẺ THỐNG KÊ QUỸ PHÉP (THIẾT KẾ CÂN ĐỐI, THẺ TRẮNG CHỮ TO RÕ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Tổng cán bộ cấp phép</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1b365d]">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {totalEmployees}
              </span>
              <span className="text-sm font-medium text-slate-500">cán bộ</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              100% Nhân sự đã phân bổ định biên
            </p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Tổng quỹ phép công ty</span>
            <div className="p-2.5 rounded-xl bg-slate-100 text-slate-700">
              <Palmtree className="w-5 h-5 text-[#1b365d]" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {totalQuota}
              </span>
              <span className="text-sm font-medium text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Gồm phép cấp mới + Phép tồn 2025
            </p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Đã sử dụng thực tế</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">
                {totalUsed}
              </span>
              <span className="text-sm font-medium text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Đã trừ từ các đơn xin nghỉ đã duyệt
            </p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Còn lại khả dụng</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1b365d] font-mono">
                {totalRemaining}
              </span>
              <span className="text-sm font-medium text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Sẵn sàng cho nhân sự sử dụng
            </p>
          </div>
        </div>
      </div>

      {/* 3. BỘ LỌC TÌM KIẾM & PHÒNG BAN */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Tìm kiếm */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên nhân viên, mã NV hoặc vị trí..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all"
          />
        </div>

        {/* Lọc theo Ban và Cảnh báo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Building2 className="w-4 h-4 text-slate-400" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả ban / phòng</option>
              {departments.map((d: any) => (
                <option key={d.id} value={d.name}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedAlertStatus}
              onChange={(e) => setSelectedAlertStatus(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả mức dư phép</option>
              <option value="low">Cán bộ sắp hết phép (≤ 3 ngày)</option>
              <option value="high">Cán bộ còn nhiều phép (≥ 8 ngày)</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. BẢNG DANH SÁCH QUẢN LÝ PHÉP NHÂN VIÊN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Danh Sách Chỉ Tiêu Phép Cán Bộ Nhân Sự
            </h3>
            <p className="text-xs text-slate-500 font-normal">Hiển thị {filteredEmployees.length} nhân sự</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/90 border-b border-slate-200 text-xs font-semibold text-slate-700">
                <th className="py-3 px-4 min-w-[150px] w-44">Nhân sự</th>
                <th className="py-3 px-4 min-w-[140px] w-44">Ban / Khối</th>
                <th className="py-3 px-4 text-center min-w-[130px]">Phép được cấp</th>
                <th className="py-3 px-4 text-center min-w-[100px]">Phép tồn 2025</th>
                <th className="py-3 px-4 text-center min-w-[110px]">Đã nghỉ thực tế</th>
                <th className="py-3 px-4 text-center min-w-[130px]">Còn lại (Khả dụng)</th>
                <th className="py-3 px-4 min-w-[140px]">Tỷ lệ đã dùng</th>
                <th className="py-3 px-4 text-right min-w-[140px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredEmployees.map((emp) => {
                const quota = emp.annualLeaveQuota !== undefined ? emp.annualLeaveQuota : 12;
                const carried = emp.carriedOverLeave || 0;
                const used = emp.usedLeave || 0;
                const totalAllowed = quota + carried;
                const remaining = Math.max(0, totalAllowed - used);
                const usedPercent = totalAllowed > 0 ? Math.min(100, Math.round((used / totalAllowed) * 100)) : 0;

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Nhân sự */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={emp.avatar}
                          alt={emp.name}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {emp.name}
                        </span>
                      </div>
                    </td>

                    {/* Ban / Khối */}
                    <td className="py-3 px-4">
                      <span className="font-medium text-slate-800 truncate block max-w-[160px]">
                        {emp.department || "Chung"}
                      </span>
                    </td>

                    {/* Phép cấp */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-slate-800">
                      <span className="px-3 py-1 rounded-lg bg-blue-50 text-[#1b365d] border border-blue-200 whitespace-nowrap inline-block">
                        {quota} ngày
                      </span>
                    </td>

                    {/* Phép tồn */}
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {carried > 0 ? (
                        <span className="px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold whitespace-nowrap inline-block">
                          +{carried} ngày
                        </span>
                      ) : (
                        <span className="text-slate-400">0</span>
                      )}
                    </td>

                    {/* Đã nghỉ */}
                    <td className="py-3 px-4 text-center font-mono font-bold text-amber-700">
                      {used > 0 ? (
                        <span className="px-2.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap inline-block">
                          {used} ngày
                        </span>
                      ) : (
                        <span className="text-slate-400 font-normal">0 ngày</span>
                      )}
                    </td>

                    {/* Còn lại */}
                    <td className="py-3 px-4 text-center font-mono font-black text-slate-900 text-sm">
                      <span
                        className={`px-3 py-1 rounded-lg border font-bold whitespace-nowrap inline-block ${
                          remaining <= 3
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-emerald-50 text-emerald-800 border-emerald-200"
                        }`}
                      >
                        {remaining} ngày
                      </span>
                    </td>

                    {/* Tiến độ phép đã dùng */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                          <span>Đã nghỉ {usedPercent}%</span>
                          <span className="font-mono">{used}/{totalAllowed}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              usedPercent >= 80 ? "bg-amber-500" : "bg-[#1b365d]"
                            }`}
                            style={{ width: `${usedPercent}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Thao tác */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canManageLeave && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditModal(emp)}
                            className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                            title="Cập nhật chỉ tiêu quỹ phép năm"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#1b365d]" />
                            <span>Sửa phép</span>
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => setHistoryEmp(emp)}
                          className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-all cursor-pointer shadow-2xs"
                          title="Xem lịch sử các đơn nghỉ phép"
                        >
                          <History className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL CẬP NHẬT / KHỞI TẠO QUỸ PHÉP ================= */}
      {editingEmp && (
        <Modal
          isOpen={Boolean(editingEmp)}
          onClose={() => setEditingEmp(null)}
          size="lg"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-5 px-6 border-b border-slate-100 bg-[#1b365d] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={editingEmp.avatar}
                  alt={editingEmp.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-white/30 shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold">Cập Nhật Quỹ Phép Năm 2026</h3>
                  <p className="text-xs text-slate-200 font-normal">
                    {editingEmp.name} ({editingEmp.code || editingEmp.id}) - {editingEmp.position}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingEmp(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <form onSubmit={handleSaveQuotaSubmit} className="p-6 space-y-4 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Phép năm được cấp (2026) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    required
                    value={quotaForm.annualQuota}
                    onChange={(e) => setQuotaForm({ ...quotaForm, annualQuota: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Chỉ tiêu tiêu chuẩn: 12 ngày</p>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Phép tồn năm 2025 chuyển sang
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="15"
                    value={quotaForm.carriedQuota}
                    onChange={(e) => setQuotaForm({ ...quotaForm, carriedQuota: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">Phép dư từ năm trước</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Điều chỉnh bổ sung (Ngày)
                  </label>
                  <input
                    type="number"
                    min="-10"
                    max="10"
                    value={quotaForm.adjustmentDays}
                    onChange={(e) => setQuotaForm({ ...quotaForm, adjustmentDays: Number(e.target.value) })}
                    placeholder="VD: 2 hoặc -1"
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Đã nghỉ thực tế (Hệ thống ghi nhận)
                  </label>
                  <input
                    type="number"
                    disabled
                    value={editingEmp.usedLeave || 0}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-100 font-mono font-bold text-amber-800 cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Tính toán trước số phép khả dụng */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-600">Tổng ngày phép còn khả dụng sau khi lưu:</span>
                <span className="text-base font-bold font-mono text-[#1b365d]">
                  {Math.max(
                    0,
                    (Number(quotaForm.annualQuota) || 0) +
                      (Number(quotaForm.carriedQuota) || 0) +
                      (Number(quotaForm.adjustmentDays) || 0) -
                      (editingEmp.usedLeave || 0)
                  )}{" "}
                  ngày
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Ghi chú / Căn cứ quyết định điều chỉnh
                </label>
                <textarea
                  rows={2}
                  value={quotaForm.note}
                  onChange={(e) => setQuotaForm({ ...quotaForm, note: e.target.value })}
                  placeholder="Ghi rõ lý do điều chỉnh phép năm..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingEmp(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#1b365d] hover:bg-slate-800 transition-all shadow-xs"
                >
                  Xác nhận lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ================= MODAL LỊCH SỬ XIN NGHỈ PHÉP ================= */}
      {historyEmp && (
        <Modal
          isOpen={Boolean(historyEmp)}
          onClose={() => setHistoryEmp(null)}
          size="2xl"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden max-h-[85vh]">
            <div className="p-5 px-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <img
                  src={historyEmp.avatar}
                  alt={historyEmp.name}
                  className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Lịch Sử Đơn Xin Nghỉ Phép
                  </h3>
                  <p className="text-xs text-slate-500 font-normal">
                    {historyEmp.name} ({historyEmp.code || historyEmp.id}) - {historyEmp.department}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHistoryEmp(null)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-3">
              {mockLeaveHistories[historyEmp.id || historyEmp.code || ""] ? (
                mockLeaveHistories[historyEmp.id || historyEmp.code || ""].map((item) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#1b365d] bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                          {item.code}
                        </span>
                        <span className="font-bold text-slate-800">{item.leaveType}</span>
                        <span className="text-slate-400">•</span>
                        <span className="text-slate-500">{item.createdAt}</span>
                      </div>
                      <p className="text-slate-700 font-medium">
                        Thời gian: <strong>{item.startDate} - {item.endDate}</strong> ({item.daysCount} ngày)
                      </p>
                      <p className="text-slate-500 italic">Lý do: {item.reason}</p>
                    </div>

                    <div className="shrink-0">
                      {item.status === "approved" ? (
                        <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Đã duyệt (-{item.daysCount} ngày)
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-600" /> Chờ duyệt
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <CalendarCheck className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                  <p>Cán bộ chưa phát sinh lịch sử xin nghỉ phép trong năm 2026.</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setHistoryEmp(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL XÁC NHẬN HÀNH ĐỘNG (CONFIRM MODAL) */}
      {confirmModalState && (
        <ActionConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={() => setConfirmModalState(null)}
          onConfirm={() => {
            const action = confirmModalState.onConfirmAction;
            setConfirmModalState(null);
            action();
          }}
          title={confirmModalState.title}
          description={confirmModalState.description}
          variant={confirmModalState.variant}
          confirmText={confirmModalState.confirmText}
          itemDetails={confirmModalState.itemDetails}
        />
      )}

      {/* MODAL PHẢN HỒI TRẠNG THÁI (SUCCESS / FAILURE FEEDBACK MODAL) */}
      <StatusFeedbackModal
        isOpen={feedbackState.isOpen}
        onClose={() => setFeedbackState({ ...feedbackState, isOpen: false })}
        type={feedbackState.type}
        title={feedbackState.title}
        message={feedbackState.message}
      />
    </div>
  );
}
