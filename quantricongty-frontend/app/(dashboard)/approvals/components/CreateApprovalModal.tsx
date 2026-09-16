"use client";

import React, { useState, useMemo } from "react";
import {
  Plus,
  X,
  Send,
  Palmtree,
  Briefcase,
  FileText,
  AlertCircle,
} from "lucide-react";
import { UserLeaveStats } from "../types";

interface CreateApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: "leave" | "trip" | "document";
  leaveStats: UserLeaveStats;
  employees: any[];
  currentUser: any;
  currentEmployee: any;
  actionLoading: boolean;
  onSubmit: (payload: any) => Promise<void>;
}

export const CreateApprovalModal: React.FC<CreateApprovalModalProps> = ({
  isOpen,
  onClose,
  defaultType = "leave",
  leaveStats,
  employees,
  currentUser,
  currentEmployee,
  actionLoading,
  onSubmit,
}) => {
  const [newType, setNewType] = useState<"leave" | "trip" | "document">(defaultType);
  const [newLeaveType, setNewLeaveType] = useState<"annual" | "personal" | "sick" | "unpaid">("annual");
  const [newTitle, setNewTitle] = useState("");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newHandover, setNewHandover] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "normal" | "low">("normal");

  // Working dates calculation (skipping Saturday and Sunday)
  const calculatedWorkingDays = useMemo(() => {
    if (!newStartDate) return { count: 0, dates: [] };
    const start = new Date(newStartDate);
    const end = newEndDate ? new Date(newEndDate) : new Date(newStartDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { count: 0, dates: [] };
    }

    const dates: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay(); // 0 = Sunday, 6 = Saturday
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const yyyy = cur.getFullYear();
        const mm = String(cur.getMonth() + 1).padStart(2, "0");
        const dd = String(cur.getDate()).padStart(2, "0");
        dates.push(`${yyyy}-${mm}-${dd}`);
      }
      cur.setDate(cur.getDate() + 1);
    }

    return { count: dates.length, dates };
  }, [newStartDate, newEndDate]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newReason.trim()) {
      alert("Vui lòng nhập đầy đủ tiêu đề và nội dung giải thích chi tiết!");
      return;
    }

    if (newType === "leave") {
      if (!newStartDate) {
        alert("Vui lòng chọn ngày bắt đầu nghỉ!");
        return;
      }
      if (calculatedWorkingDays.count <= 0) {
        alert("Khoảng thời gian chọn không có ngày làm việc hợp lệ (trùng thứ Bảy / Chủ Nhật)!");
        return;
      }
      if (newLeaveType === "annual" && calculatedWorkingDays.count > leaveStats.remaining) {
        const proceed = confirm(
          `CẢNH BÁO: Bạn chỉ còn ${leaveStats.remaining} ngày phép năm, nhưng xin nghỉ ${calculatedWorkingDays.count} ngày làm việc. Bạn vẫn muốn tiếp tục gửi đơn đề xuất?`
        );
        if (!proceed) return;
      }
    }

    const payload: any = {
      type: newType,
      title: newTitle.trim(),
      requesterCode: currentUser?.code || currentEmployee?.code || "ĐH0015",
      requesterName: currentUser?.name || currentEmployee?.name || "Nhân sự",
      department: currentUser?.department || currentEmployee?.department || "Ban Công nghệ Thông tin & Chuyển đổi số",
      position: currentUser?.position || currentEmployee?.position || "Nhân viên IT",
      priority: newPriority,
      reason: newReason.trim(),
    };

    if (newType === "leave") {
      payload.leaveType = newLeaveType;
      payload.startDate = newStartDate;
      payload.endDate = newEndDate || newStartDate;
      payload.daysCount = calculatedWorkingDays.count;
      payload.dates = calculatedWorkingDays.dates;
      payload.handoverTo = newHandover || "Chưa chọn người nhận bàn giao";
    } else if (newType === "trip") {
      payload.startDate = newStartDate;
      payload.endDate = newEndDate || newStartDate;
      payload.amount = newAmount ? `${newAmount.replace(/[^0-9]/g, "")} đ` : undefined;
    }

    await onSubmit(payload);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#1b365d] text-white">
          <div className="flex items-center gap-2">
            <Plus className="w-5 h-5 text-blue-300" />
            <div>
              <h3 className="text-base font-bold">Khởi Tạo Đề Xuất Phê Duyệt Mới</h3>
              <p className="text-xs text-blue-200/80">
                Quy trình phê duyệt 2 cấp (Trưởng ban $\rightarrow$ Trưởng ban HCNS)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Type Select */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Loại đề xuất *</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: "leave", label: "Đơn nghỉ phép", icon: Palmtree },
                { id: "trip", label: "Đề xuất công tác", icon: Briefcase },
                { id: "document", label: "Up tài liệu", icon: FileText },
              ].map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setNewType(t.id as any)}
                    className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 font-bold text-xs transition-all ${
                      newType === t.id
                        ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                        : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sub-type for Leave */}
          {newType === "leave" && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-700">Loại hình nghỉ phép *</label>
                <span className="text-[11px] font-mono font-bold text-blue-900 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Phép khả dụng: {leaveStats.remaining} ngày
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: "annual", label: "Phép năm (Trừ vào quỹ phép)", desc: "1.0 công / ngày" },
                  { id: "personal", label: "Việc riêng hưởng lương", desc: "Hiếu hỉ, kết hôn..." },
                  { id: "sick", label: "Nghỉ ốm BHXH", desc: "Kèm giấy khám bệnh" },
                  { id: "unpaid", label: "Nghỉ không lương", desc: "Không tính công" },
                ].map((lt) => (
                  <label
                    key={lt.id}
                    className={`flex items-start gap-2 p-2.5 rounded-lg border cursor-pointer transition-all ${
                      newLeaveType === lt.id
                        ? "bg-white border-[#1b365d] ring-1 ring-[#1b365d]"
                        : "bg-white/60 border-slate-200 hover:bg-white"
                    }`}
                  >
                    <input
                      type="radio"
                      name="leaveType"
                      checked={newLeaveType === lt.id}
                      onChange={() => setNewLeaveType(lt.id as any)}
                      className="mt-0.5 text-[#1b365d]"
                    />
                    <div>
                      <p className="font-bold text-slate-800 text-[11.5px]">{lt.label}</p>
                      <p className="text-[10px] text-slate-400">{lt.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Tiêu đề đề xuất *</label>
            <input
              type="text"
              required
              placeholder={
                newType === "leave"
                  ? "VD: Đơn xin nghỉ phép năm giải quyết việc gia đình..."
                  : newType === "trip"
                  ? "VD: Đề xuất công tác kiểm định hệ thống Cảng Hải Phòng..."
                  : "VD: Phê duyệt quy chế chi tiêu nội bộ năm 2026..."
              }
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
            />
          </div>

          {/* Date pickers & Working days counter */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Từ ngày *</label>
              <input
                type="date"
                required
                value={newStartDate}
                onChange={(e) => setNewStartDate(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Đến ngày</label>
              <input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={newStartDate}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-mono"
              />
            </div>
          </div>

          {/* Working days preview */}
          {newType === "leave" && newStartDate && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-[11.5px]">
                  Tổng số ngày làm việc xin nghỉ:{" "}
                  <span className="text-[#1b365d] font-mono text-sm font-black">
                    {calculatedWorkingDays.count} ngày
                  </span>
                </p>
                <p className="text-[10.5px] text-slate-400">
                  (Hệ thống tự động bỏ qua các ngày Thứ Bảy và Chủ Nhật)
                </p>
              </div>

              {newLeaveType === "annual" && calculatedWorkingDays.count > leaveStats.remaining && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Vượt quá {calculatedWorkingDays.count - leaveStats.remaining} ngày phép!</span>
                </div>
              )}
            </div>
          )}

          {/* Handover contact for leave */}
          {newType === "leave" && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Người nhận bàn giao công việc</label>
              <select
                value={newHandover}
                onChange={(e) => setNewHandover(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
              >
                <option value="">-- Chọn nhân sự nhận bàn giao tạm thời --</option>
                {employees.map((emp) => (
                  <option key={emp.code} value={emp.name}>
                    {emp.name} ({emp.code} - {emp.department})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Trip amount */}
          {newType === "trip" && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Dự toán kinh phí công tác (VNĐ)</label>
              <input
                type="text"
                placeholder="VD: 5.000.000"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 font-mono focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
              />
            </div>
          )}

          {/* Priority */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Mức độ ưu tiên</label>
            <div className="flex gap-2">
              {[
                { id: "normal", label: "Bình thường" },
                { id: "high", label: "Ưu tiên cao / Khẩn cấp" },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setNewPriority(p.id as any)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold ${
                    newPriority === p.id
                      ? "bg-[#1b365d] text-white border-[#1b365d]"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Detailed Reason & Explanation */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Nội dung giải thích & Căn cứ chi tiết *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Trình bày rõ lý do xin nghỉ, kế hoạch bàn giao công việc hoặc căn cứ tờ trình (nội dung này sẽ hiển thị chi tiết khi Ban Lãnh đạo xem xét duyệt)..."
              value={newReason}
              onChange={(e) => setNewReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 leading-relaxed"
            />
          </div>

          {/* Submit footer */}
          <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-bold shadow-md shadow-[#1b365d]/20 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi đơn đề xuất</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
