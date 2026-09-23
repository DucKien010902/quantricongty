"use client";
import { API_URL } from "@/app/config/api";

import React, { useState } from "react";
import { X, Edit2, Loader2, Save } from "lucide-react";
import { Employee } from "@/app/data/seed-employees";
import Modal from "@/app/components/ui/Modal";

interface EditEmployeeModalProps {
  employee: Employee | null;
  departments: Array<{ name: string }>;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditEmployeeModal({
  employee,
  departments,
  isOpen,
  onClose,
  onSuccess,
}: EditEmployeeModalProps) {
  if (!isOpen || !employee) return null;

  const [formData, setFormData] = useState({
    name: employee.name || "",
    email: employee.email || "",
    phone: employee.phone || "",
    gender: employee.gender || "Nam",
    department: employee.department || "Ban Nhân sự & Hành chính Tổng hợp",
    positionLevel:
      (employee as any).positionLevel ||
      ((employee as any).role === "ADMIN" || (employee as any).role === "CHAIRMAN" || (employee as any).role === "CEO"
        ? "Ban Quản Trị"
        : (employee as any).role === "LEADER" || (employee as any).role === "HEAD_OF_DEPARTMENT"
        ? "Trưởng Ban"
        : "Nhân Viên"),
    position: (employee as any).position || (employee as any).role || "Nhân viên",
    attendanceCode: (employee as any).attendanceCode || "",
    role:
      (employee as any).role === "CHAIRMAN" || (employee as any).role === "CEO" || (employee as any).role === "ADMIN"
        ? "ADMIN"
        : (employee as any).role === "HEAD_OF_DEPARTMENT" || (employee as any).role === "LEADER"
        ? "LEADER"
        : (employee as any).role || "USER",
    status: employee.status || "active",
    salaryGrade: employee.salaryGrade || "Bậc 3",
    location: employee.location || "Hà Nội",
    performance: employee.performance || 90,
    annualLeaveQuota: (employee as any).annualLeaveQuota !== undefined ? Number((employee as any).annualLeaveQuota) : 12,
    carriedOverLeave: (employee as any).carriedOverLeave !== undefined ? Number((employee as any).carriedOverLeave) : 0,
    usedLeave: (employee as any).usedLeave !== undefined ? Number((employee as any).usedLeave) : 0,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const empId = (employee as any)._id || employee.id;
      const res = await fetch(`${API_URL}/employees/${empId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Không thể cập nhật thông tin!");
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || "Lỗi khi cập nhật!");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
      hideHeader
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white">
              <Edit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Chỉnh Sửa Hồ Sơ Nhân Sự
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Mã NV: {employee.id} • DONG HAI INVEST
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200">
              {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Họ và Tên
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Giới tính
              </label>
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Số Điện Thoại
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Ban / Phòng Ban Trực Thuộc
            </label>
            <select
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            >
              {departments.map((dept, idx) => (
                <option key={idx} value={dept.name}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Cấp Bậc Chức Danh
              </label>
              <select
                value={formData.positionLevel}
                onChange={(e) => setFormData({ ...formData, positionLevel: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-medium"
              >
                <option value="Ban Quản Trị">Ban Quản Trị</option>
                <option value="Trưởng Ban">Trưởng Ban</option>
                <option value="Nhân Viên">Nhân Viên</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Quyền Tài Khoản (Role)
              </label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-semibold text-[#1b365d] dark:text-blue-400"
              >
                <option value="ADMIN">Quản trị viên (Admin - Toàn quyền)</option>
                <option value="LEADER">Trưởng ban (Leader - QL ban & duyệt đơn)</option>
                <option value="USER">Nhân viên (User - Xem & gửi đơn)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Chức Vụ Hiển Thị Cụ Thể
            </label>
            <input
              type="text"
              required
              placeholder="VD: Trưởng Ban Hành chính - Nhân sự, Nhân viên IT..."
              value={formData.position}
              onChange={(e) => setFormData({ ...formData, position: e.target.value })}
              className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>

          {/* Cấu hình Quỹ Phép Năm */}
          <div className="p-3 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200 text-xs">
                Quỹ Phép Năm (Nhập tay & Bù trừ linh hoạt)
              </span>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#1b365d] text-white">
                Còn lại: {Math.max(0, Number(formData.annualLeaveQuota || 0) + Number(formData.carriedOverLeave || 0) - Number(formData.usedLeave || 0))} ngày
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Phép năm cấp
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={formData.annualLeaveQuota}
                  onChange={(e) => setFormData({ ...formData, annualLeaveQuota: Number(e.target.value) })}
                  className="w-full px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-center"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Phép tồn năm trước
                </label>
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={formData.carriedOverLeave}
                  onChange={(e) => setFormData({ ...formData, carriedOverLeave: Number(e.target.value) })}
                  className="w-full px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-center"
                />
              </div>

              <div>
                <label className="text-[11px] text-slate-600 dark:text-slate-400 font-medium block mb-1">
                  Đã sử dụng
                </label>
                <input
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={formData.usedLeave}
                  onChange={(e) => setFormData({ ...formData, usedLeave: Number(e.target.value) })}
                  className="w-full px-2.5 py-1 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white font-semibold text-center"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between">
              <span>Mã Chấm Công (Trên máy hoặc Excel No.)</span>
              <span className="text-[10px] text-blue-600 font-normal">Dùng để map đúng nhân sự khi kéo dữ liệu</span>
            </label>
            <input
              type="text"
              placeholder="VD: 3, 6, 11, 14..."
              value={formData.attendanceCode}
              onChange={(e) => setFormData({ ...formData, attendanceCode: e.target.value })}
              className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40 font-mono font-bold"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Trạng Thái
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="active">Chính thức</option>
                <option value="probation">Thử việc</option>
                <option value="invited">Đã mời qua Email</option>
                <option value="leave">Nghỉ phép</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Văn Phòng
              </label>
              <select
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="Hà Nội">Hà Nội</option>
                <option value="TP. Hồ Chí Minh">TP. Hồ Chí Minh</option>
                <option value="Đà Nẵng">Đà Nẵng</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Ngạch Lương
              </label>
              <select
                value={formData.salaryGrade}
                onChange={(e) => setFormData({ ...formData, salaryGrade: e.target.value })}
                className="mt-1 w-full px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/40"
              >
                <option value="Bậc 1">Bậc 1</option>
                <option value="Bậc 2">Bậc 2</option>
                <option value="Bậc 3">Bậc 3</option>
                <option value="Bậc 4">Bậc 4</option>
                <option value="Bậc 5">Bậc 5</option>
                <option value="Bậc 6">Bậc 6</option>
                <option value="Bậc 7">Bậc 7</option>
                <option value="Bậc 8">Bậc 8 (Lãnh đạo)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-600/20 disabled:opacity-50 transition-all"
            >
              {isSubmitting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>{isSubmitting ? "Đang lưu..." : "Cập Nhật Hồ Sơ"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
