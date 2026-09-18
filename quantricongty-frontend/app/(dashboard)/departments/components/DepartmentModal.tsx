"use client";

import React, { useState, useEffect } from "react";
import { Building2, X, Save, Loader2, UserCheck } from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { DepartmentInfo } from "@/app/data/seed-employees";

interface DepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  department?: DepartmentInfo | null;
  employees: any[];
  onSubmit: (data: any) => Promise<void>;
}

const COLOR_OPTIONS = [
  { label: "Xanh Dương (IT / Số hóa)", value: "bg-blue-500" },
  { label: "Xanh Chàm (Đầu tư)", value: "bg-indigo-500" },
  { label: "Xanh Lá (Kinh doanh)", value: "bg-emerald-500" },
  { label: "Tím (Tài chính)", value: "bg-violet-500" },
  { label: "Đỏ Hồng (Nhân sự)", value: "bg-rose-500" },
  { label: "Vàng Cam (Pháp chế)", value: "bg-amber-500" },
  { label: "Xám Xanh (Chung)", value: "bg-slate-600" },
];

export default function DepartmentModal({
  isOpen,
  onClose,
  department,
  employees,
  onSubmit,
}: DepartmentModalProps) {
  const isEdit = Boolean(department);

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    description: "",
    managerName: "Chưa có",
    color: "bg-blue-500",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || "",
        code: department.code || "",
        description: department.description || "",
        managerName: department.managerName || "Chưa có",
        color: department.color || "bg-blue-500",
      });
    } else {
      setFormData({
        name: "",
        code: "",
        description: "",
        managerName: "Chưa có",
        color: "bg-blue-500",
      });
    }
  }, [department, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên ban / phòng!");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch {
      // Error handled in context
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" hideHeader className="p-0 overflow-hidden">
      <div className="flex flex-col h-full">
        {/* Modal Header với Tone Màu Thương Hiệu #1b365d */}
        <div className="p-5 px-6 bg-[#1b365d] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-white ring-1 ring-white/20">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white tracking-tight">
                {isEdit ? "Cập Nhật Thông Tin Ban / Phòng" : "Thêm Ban / Phòng Ban Mới"}
              </h3>
              <p className="text-xs text-slate-200">
                {isEdit ? `Mã ban: ${formData.code || "N/A"}` : "Khai báo sơ đồ khối chức năng mới"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Form Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                Tên Ban / Phòng Ban <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="VD: Ban Công nghệ Thông tin & Chuyển đổi số"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mã Viết Tắt (Code)</label>
              <input
                type="text"
                placeholder="VD: DHI-IT"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all font-mono font-bold text-slate-700"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">Mô Tả Chức Năng & Nhiệm Vụ</label>
            <textarea
              rows={3}
              placeholder="Nhập chức năng, nhiệm vụ chính của phòng ban..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all font-normal text-slate-800"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-slate-500" />
                Trưởng Ban / Phụ Trách
              </label>
              <select
                value={formData.managerName}
                onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all bg-white font-medium text-slate-800"
              >
                <option value="Chưa có">-- Chưa phân công --</option>
                {employees.map((emp, idx) => (
                  <option key={idx} value={emp.name}>
                    {emp.name} ({emp.position || "Cán bộ"})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Màu Nhận Diện Sơ Đồ</label>
              <select
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all bg-white font-medium text-slate-800"
              >
                {COLOR_OPTIONS.map((c, idx) => (
                  <option key={idx} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
            >
              Hủy Bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-semibold shadow-md flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEdit ? "Lưu Thay Đổi" : "Tạo Phòng Ban"}</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
