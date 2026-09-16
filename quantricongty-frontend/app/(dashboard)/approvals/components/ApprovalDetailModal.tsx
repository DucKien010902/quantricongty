"use client";

import React from "react";
import {
  ClipboardCheck,
  CheckCircle2,
  Check,
  X,
  RotateCcw,
  Clock,
  Info,
  Paperclip,
  Download,
} from "lucide-react";
import { ApprovalItem } from "../types";

interface ApprovalDetailModalProps {
  item: ApprovalItem;
  onClose: () => void;
  approvalNote: string;
  onNoteChange: (note: string) => void;
  actionLoading: boolean;
  isHRAdmin: boolean;
  isLeader: boolean;
  currentUser: any;
  currentEmployee: any;
  onLeaderApprove: (id: string, isApproved: boolean, note?: string) => void;
  onHRApprove: (id: string, isApproved: boolean, note?: string) => void;
  onHRApproveCancel: (id: string, isApproved: boolean, note?: string) => void;
  showToast: (msg: string) => void;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  item,
  onClose,
  approvalNote,
  onNoteChange,
  actionLoading,
  isHRAdmin,
  isLeader,
  currentUser,
  currentEmployee,
  onLeaderApprove,
  onHRApprove,
  onHRApproveCancel,
  showToast,
}) => {
  const itemId = item._id || item.id || "";
  const userDept = currentEmployee?.department || currentUser?.department || "";

  const canApproveLeader =
    item.status === "PENDING_LEADER" && (isHRAdmin || (isLeader && userDept === item.department));

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#1b365d] to-[#122440] text-white">
          <div className="flex items-center gap-3">
            <ClipboardCheck className="w-6 h-6 text-blue-300" />
            <div>
              <h3 className="text-base sm:text-lg font-bold">Hồ sơ đề xuất phê duyệt</h3>
              <p className="text-xs text-blue-200/80 font-mono mt-0.5">Mã: {item.code}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs">
          {/* Requester banner */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="font-bold text-slate-900 text-base">{item.requesterName}</p>
              <p className="text-slate-600 font-medium text-xs mt-0.5">
                Mã NV: <span className="font-mono font-bold text-slate-800">{item.requesterCode}</span> • {item.department} {item.position ? `(${item.position})` : ""}
              </p>
            </div>

            <div className="text-left sm:text-right sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="inline-block px-3 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
                {item.type === "leave" ? "Đơn nghỉ phép" : item.type === "trip" ? "Công tác" : "Up tài liệu"}
              </span>
              <p className="text-slate-400 text-xs mt-1 font-mono">
                {item.createdAt ? String(item.createdAt).slice(0, 16) : ""}
              </p>
            </div>
          </div>

          {/* Title & Detailed Explanation */}
          <div>
            <h4 className="text-base font-bold text-slate-900">{item.title}</h4>
            <div className="mt-2.5 p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed space-y-2">
              <p className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
                <Info className="w-4 h-4 text-[#1b365d]" />
                Nội dung giải trình & căn cứ đề xuất chi tiết:
              </p>
              <p className="whitespace-pre-line text-slate-800 text-xs font-medium bg-white p-3.5 rounded-lg border border-slate-200/80">
                {item.reason || "Không có nội dung bổ sung."}
              </p>
            </div>
          </div>

          {/* Leave specific details */}
          {item.type === "leave" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-slate-500 font-medium block mb-1">Thời gian nghỉ</span>
                <span className="font-bold font-mono text-slate-900 text-xs">
                  {item.startDate} → {item.endDate}
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-blue-200 bg-blue-50/50">
                <span className="text-blue-800 font-semibold block mb-1">Số ngày làm việc</span>
                <span className="font-extrabold font-mono text-blue-900 text-sm">
                  {item.daysCount} ngày (trừ T7, CN)
                </span>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <span className="text-slate-500 font-medium block mb-1">Người nhận bàn giao</span>
                <span className="font-bold text-slate-900 text-xs">
                  {item.handoverTo || "Chưa ghi nhận"}
                </span>
              </div>
            </div>
          )}

          {/* Dates list if leave */}
          {item.dates && item.dates.length > 0 && (
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <p className="font-bold text-slate-700 mb-2 text-xs">
                Các ngày làm việc trừ phép & đồng bộ chấm công:
              </p>
              <div className="flex flex-wrap gap-2">
                {item.dates.map((d, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-blue-100/70 text-blue-900 font-mono font-bold text-xs border border-blue-200"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Trip amount if trip */}
          {item.type === "trip" && item.amount && (
            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/40 flex items-center justify-between">
              <span className="text-purple-900 font-bold text-xs">Dự toán kinh phí công tác:</span>
              <span className="font-black font-mono text-purple-900 text-base">{item.amount}</span>
            </div>
          )}

          {/* Attachments if any */}
          {item.attachments && item.attachments.length > 0 && (
            <div>
              <p className="font-bold text-slate-800 mb-2 flex items-center gap-2 text-xs">
                <Paperclip className="w-4 h-4 text-[#1b365d]" />
                Tài liệu đính kèm ({item.attachments.length}):
              </p>
              <div className="space-y-2">
                {item.attachments.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-mono text-slate-800"
                  >
                    <span className="truncate font-medium">{file}</span>
                    <button
                      type="button"
                      onClick={() => showToast(`Tải file: ${file}`)}
                      className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-sans font-semibold text-xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Tải về</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tiến trình xét duyệt 2 Cấp */}
          <div>
            <p className="font-bold text-slate-800 mb-3 flex items-center gap-2 text-xs">
              <Clock className="w-4 h-4 text-[#1b365d]" />
              Tiến trình xét duyệt & lịch sử xử lý:
            </p>
            <div className="space-y-3 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {item.history &&
                item.history.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-blue-50 border-2 border-[#1b365d] flex items-center justify-center text-[#1b365d] z-10 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div className="flex-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">
                          {step.step}: {step.actor}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">{step.time}</span>
                      </div>
                      <p className="text-slate-700 font-medium mt-1 text-xs">{step.action}</p>
                      {step.note && (
                        <p className="text-slate-600 italic mt-2 bg-white p-2.5 rounded-lg border border-slate-200/80 text-xs">
                          "{step.note}"
                        </p>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Note input if pending or request cancel */}
          {(item.status === "PENDING_LEADER" ||
            item.status === "PENDING_HR" ||
            item.status === "REQUEST_CANCEL") && (
            <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                Ý kiến phê duyệt hoặc lý do từ chối:
              </label>
              <textarea
                rows={2}
                value={approvalNote}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder="Nhập ghi chú phê duyệt hoặc chỉ đạo (không bắt buộc)..."
                className="w-full p-3 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
              />
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
          >
            Đóng
          </button>

          {/* Cấp 1 Actions */}
          {canApproveLeader && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onLeaderApprove(itemId, false, approvalNote)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Từ chối Cấp 1
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onLeaderApprove(itemId, true, approvalNote)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Duyệt Cấp Ban (C1)</span>
              </button>
            </>
          )}

          {/* Cấp 2 Actions */}
          {item.status === "PENDING_HR" && isHRAdmin && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onHRApprove(itemId, false, approvalNote)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition-colors"
              >
                Từ chối Cấp HCNS
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onHRApprove(itemId, true, approvalNote)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1b365d] hover:bg-[#152a4a] shadow-sm transition-colors flex items-center gap-1.5"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Duyệt Chốt & Trừ Phép (C2)</span>
              </button>
            </>
          )}

          {/* Request Cancel Action */}
          {item.status === "REQUEST_CANCEL" && isHRAdmin && (
            <>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onHRApproveCancel(itemId, false, approvalNote)}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Không duyệt hủy
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => onHRApproveCancel(itemId, true, approvalNote)}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Chấp thuận hủy & Hoàn phép</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

