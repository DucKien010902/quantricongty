"use client";

import React, { useState, useMemo, useEffect } from "react";
import { createPortal } from "react-dom";
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

  useEffect(() => {
    if (isOpen) {
      setNewType(defaultType);
    }
  }, [isOpen, defaultType]);

  const [newLeaveType, setNewLeaveType] = useState<"annual" | "personal" | "sick" | "unpaid">("annual");
  const [newStartSession, setNewStartSession] = useState<"morning" | "afternoon">("morning");
  const [newEndSession, setNewEndSession] = useState<"morning" | "afternoon">("afternoon");
  const [newTransportation, setNewTransportation] = useState<string>("Tự túc");
  const [newStartDate, setNewStartDate] = useState("");
  const [newEndDate, setNewEndDate] = useState("");
  const [newReason, setNewReason] = useState("");
  const [newHandover, setNewHandover] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [newPriority, setNewPriority] = useState<"high" | "normal" | "low">("normal");

  // Working dates calculation (skipping Saturday and Sunday)
  const calculatedWorkingDays = useMemo(() => {
    if (!newStartDate) return { count: 0, dates: [], description: "" };

    const start = new Date(newStartDate);
    const endStr = newEndDate || newStartDate;
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { count: 0, dates: [], description: "Ngày chọn không hợp lệ" };
    }

    // Cùng 1 ngày
    if (newStartDate === endStr) {
      const dayOfWeek = start.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { count: 0, dates: [], description: "Ngày nghỉ Cuối tuần (T7/CN)" };
      }
      if (newStartSession === "afternoon" && newEndSession === "morning") {
        return { count: 0, dates: [], description: "Buổi kết thúc (Sáng) không thể trước Buổi bắt đầu (Chiều)" };
      }

      let count = 1.0;
      let sessionText = "Cả ngày";
      if (newStartSession === "morning" && newEndSession === "morning") {
        count = 0.5;
        sessionText = "Ca sáng (08:00 - 12:00)";
      } else if (newStartSession === "afternoon" && newEndSession === "afternoon") {
        count = 0.5;
        sessionText = "Ca chiều (13:30 - 17:30)";
      } else if (newStartSession === "morning" && newEndSession === "afternoon") {
        count = 1.0;
        sessionText = "Cả ngày (08:00 - 17:30)";
      }

      return {
        count,
        dates: [newStartDate],
        description: `1 ngày làm việc (${sessionText})`,
      };
    }

    // Nhiều ngày
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

    if (dates.length === 0) {
      return { count: 0, dates: [], description: "Khoảng thời gian chọn trùng vào ngày nghỉ Cuối tuần" };
    }

    let totalCount = 0;
    if (dates.length === 1) {
      if (newStartSession === "afternoon" && newEndSession === "morning") {
        totalCount = 0;
      } else if (newStartSession === newEndSession) {
        totalCount = 0.5;
      } else {
        totalCount = 1.0;
      }
    } else {
      totalCount += newStartSession === "afternoon" ? 0.5 : 1.0;
      totalCount += (dates.length - 2) * 1.0;
      totalCount += newEndSession === "morning" ? 0.5 : 1.0;
    }

    const startText = newStartSession === "morning" ? "Sáng" : "Chiều";
    const endText = newEndSession === "morning" ? "Sáng" : "Chiều";
    const descText = `Từ ${startText} (${newStartDate}) đến ${endText} (${endStr})`;

    return {
      count: totalCount,
      dates,
      description: descText,
    };
  }, [newStartDate, newEndDate, newStartSession, newEndSession]);

  // Thông báo luồng phê duyệt theo đúng chức danh
  const workflowNotice = useMemo(() => {
    const emp = currentEmployee || currentUser;
    if (!emp) return null;
    const role = (emp.role || "").toUpperCase();
    const dept = (emp.department || "").toLowerCase();
    const pos = (emp.position || "").toLowerCase();
    const level = (emp.positionLevel || "").toLowerCase();

    const isHRDept =
      dept.includes("nhân sự") ||
      dept.includes("hcns") ||
      dept.includes("hành chính") ||
      dept.includes("tổ chức");

    const isLeaderTitle =
      pos.includes("trưởng") ||
      pos.includes("giám đốc") ||
      pos.includes("phụ trách") ||
      level.includes("trưởng") ||
      level.includes("quản trị");

    if (role === "ADMIN") {
      return {
        badge: "Tự động duyệt (APPROVED)",
        text: "Bạn có quyền Admin nghiệp vụ. Đơn sẽ được tự động phê duyệt ngay lập tức và có thể tự hủy khi cần.",
        color: "bg-emerald-50 text-emerald-800 border-emerald-200",
      };
    }

    if (role === "LEADER" || isLeaderTitle) {
      return {
        badge: "Luồng 1 bước (Chuyển thẳng Admin duyệt Cấp 2)",
        text: "Bạn là Trưởng Ban chuyên môn. Đơn sẽ được chuyển thẳng tới Admin nghiệp vụ phê duyệt chốt (bỏ qua Cấp 1).",
        color: "bg-indigo-50 text-indigo-800 border-indigo-200",
      };
    }

    if (isHRDept) {
      return {
        badge: "Luồng 1 bước (Chuyển thẳng Admin duyệt Cấp 2)",
        text: "Bạn thuộc phòng HCNS. Đơn sẽ được chuyển thẳng tới Admin nghiệp vụ phê duyệt trực tiếp.",
        color: "bg-indigo-50 text-indigo-800 border-indigo-200",
      };
    }

    return {
      badge: "Luồng chuẩn 2 bước",
      text: "Đơn của bạn sẽ qua Trưởng ban duyệt Cấp 1 trước, sau đó chuyển Admin nghiệp vụ duyệt chốt Cấp 2.",
      color: "bg-slate-50 text-slate-700 border-slate-200",
    };
  }, [currentEmployee, currentUser]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReason.trim()) {
      alert("Vui lòng nhập nội dung giải thích chi tiết!");
      return;
    }

    if (!newStartDate) {
      alert("Vui lòng chọn ngày bắt đầu!");
      return;
    }

    if (calculatedWorkingDays.count <= 0) {
      alert("Khoảng thời gian chọn không có ngày làm việc hợp lệ (trùng thứ Bảy / Chủ Nhật)!");
      return;
    }

    if (newType === "leave" && newLeaveType === "annual" && calculatedWorkingDays.count > leaveStats.remaining) {
      const proceed = confirm(
        `CẢNH BÁO: Bạn chỉ còn ${leaveStats.remaining} ngày phép năm, nhưng xin nghỉ ${calculatedWorkingDays.count} ngày làm việc. Bạn vẫn muốn tiếp tục gửi đơn đề xuất?`
      );
      if (!proceed) return;
    }

    const autoTitle =
      newType === "leave"
        ? `Đơn xin nghỉ: ${newReason.trim().slice(0, 50)}`
        : newType === "trip"
        ? `Đề xuất công tác: ${newReason.trim().slice(0, 50)}`
        : newReason.trim().slice(0, 60);

    const payload: any = {
      type: newType,
      title: autoTitle,
      requesterCode: currentUser?.code || currentEmployee?.code || "ĐH0015",
      requesterName: currentUser?.name || currentEmployee?.name || "Nhân sự",
      department: currentUser?.department || currentEmployee?.department || "Ban Công nghệ Thông tin & Chuyển đổi số",
      position: currentUser?.position || currentEmployee?.position || "Nhân viên IT",
      priority: newPriority,
      reason: newReason.trim(),
    };

    if (newType === "leave") {
      payload.leaveType = newLeaveType;
      payload.leaveShift = newStartSession === "morning" && newEndSession === "afternoon" ? "full" : newStartSession;
      payload.leaveShiftLabel = `${newStartSession === "morning" ? "Sáng" : "Chiều"} ${newStartDate} → ${newEndSession === "morning" ? "Sáng" : "Chiều"} ${newEndDate || newStartDate}`;
      payload.startDate = newStartDate;
      payload.endDate = newEndDate || newStartDate;
      payload.startSession = newStartSession;
      payload.endSession = newEndSession;
      payload.daysCount = calculatedWorkingDays.count;
      payload.dates = calculatedWorkingDays.dates;
      payload.handoverTo = newHandover || "Chưa chọn người nhận bàn giao";
    } else if (newType === "trip") {
      payload.leaveShift = newStartSession === "morning" && newEndSession === "afternoon" ? "full" : newStartSession;
      payload.leaveShiftLabel = `${newStartSession === "morning" ? "Sáng" : "Chiều"} ${newStartDate} → ${newEndSession === "morning" ? "Sáng" : "Chiều"} ${newEndDate || newStartDate}`;
      payload.startDate = newStartDate;
      payload.endDate = newEndDate || newStartDate;
      payload.startSession = newStartSession;
      payload.endSession = newEndSession;
      payload.daysCount = calculatedWorkingDays.count;
      payload.dates = calculatedWorkingDays.dates;
      payload.amount = newAmount ? `${newAmount.replace(/[^0-9]/g, "")} đ` : undefined;
      payload.transportation = newTransportation;
    }

    await onSubmit(payload);
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden max-h-[90vh] flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#1b365d] text-white shrink-0">
          <div className="flex items-center gap-2.5">
            {newType === "leave" ? (
              <Palmtree className="w-5 h-5 text-emerald-400" />
            ) : newType === "trip" ? (
              <Briefcase className="w-5 h-5 text-blue-300" />
            ) : (
              <FileText className="w-5 h-5 text-blue-300" />
            )}
            <h3 className="text-base font-bold tracking-tight">
              {newType === "leave"
                ? "Tạo Đơn Xin Nghỉ Phép"
                : newType === "trip"
                ? "Đăng Ký Đợt Công Tác Mới"
                : "Tạo Đề Xuất Phê Duyệt Mới"}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">

          {/* Sub-type for Leave */}
          {newType === "leave" && (
            <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200/80 space-y-3">
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

          {/* Pick Ngày & Buổi (Từ ngày Sáng/Chiều → Đến ngày Sáng/Chiều) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Từ ngày & Buổi bắt đầu */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-700 text-xs">Từ ngày & Buổi bắt đầu *</label>
              <div className="space-y-2">
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => {
                    setNewStartDate(e.target.value);
                    if (!newEndDate) setNewEndDate(e.target.value);
                  }}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewStartSession("morning")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      newStartSession === "morning"
                        ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ☀️ Buổi Sáng
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewStartSession("afternoon")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      newStartSession === "afternoon"
                        ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ⛅ Buổi Chiều
                  </button>
                </div>
              </div>
            </div>

            {/* Đến ngày & Buổi kết thúc */}
            <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block font-bold text-slate-700 text-xs">Đến ngày & Buổi kết thúc *</label>
              <div className="space-y-2">
                <input
                  type="date"
                  required
                  min={newStartDate}
                  value={newEndDate || newStartDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                />
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => setNewEndSession("morning")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      newEndSession === "morning"
                        ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ☀️ Buổi Sáng
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEndSession("afternoon")}
                    className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      newEndSession === "afternoon"
                        ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    ⛅ Buổi Chiều
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Working days counter card (Nổi bật trên CẢ 2 Modal) */}
          {newStartDate && (
            <div className="p-3.5 rounded-xl bg-blue-50/80 border border-blue-200/90 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-xs">
                  Tổng số ngày đề xuất:{" "}
                  <span className="text-[#1b365d] font-mono text-base font-black ml-1">
                    {calculatedWorkingDays.count} ngày
                  </span>
                </p>
                <p className="text-[11px] text-blue-900/80 mt-0.5 font-medium">
                  {calculatedWorkingDays.description} (Tự động bỏ qua Thứ 7 & Chủ Nhật)
                </p>
              </div>

              {newType === "leave" && newLeaveType === "annual" && calculatedWorkingDays.count > leaveStats.remaining && (
                <div className="flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200 shrink-0">
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

          {/* Trip amount & transportation */}
          {newType === "trip" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

              <div>
                <label className="block font-bold text-slate-700 mb-1">Phương tiện di chuyển</label>
                <select
                  value={newTransportation}
                  onChange={(e) => setNewTransportation(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                >
                  <option value="Tự túc">Tự túc phương tiện (Mặc định)</option>
                  <option value="Xe công ty">Xe công ty sắp xếp</option>
                  <option value="Máy bay">Máy bay (Khứ hồi)</option>
                  <option value="Tàu hỏa">Tàu hỏa</option>
                </select>
              </div>
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
    </div>,
    document.body
  );
};
