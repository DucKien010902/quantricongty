"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { RotateCcw, X } from "lucide-react";
import { ApprovalItem } from "../types";

interface CancelApprovalModalProps {
  item: ApprovalItem | null;
  onClose: () => void;
  actionLoading: boolean;
  isHeadOfHR?: boolean;
  isAdmin?: boolean;
  onConfirmCancel: (item: ApprovalItem, reason: string) => Promise<void>;
}

export const CancelApprovalModal: React.FC<CancelApprovalModalProps> = ({
  item,
  onClose,
  actionLoading,
  isHeadOfHR = false,
  isAdmin = false,
  onConfirmCancel,
}) => {
  const [reason, setReason] = useState("");
  const isBusinessAdmin = Boolean(isAdmin || isHeadOfHR);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!item || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    await onConfirmCancel(item, reason.trim());
    setReason("");
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col my-auto animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-amber-700 text-white shrink-0">
          <div className="flex items-center gap-2">
            <RotateCcw className="w-5 h-5 text-amber-200" />
            <div>
              <h3 className="text-base font-bold">
                {isBusinessAdmin ? "Admin Nghiệp Vụ Tự Hủy Đơn" : "Đề Xuất Hủy Nghỉ Phép"}
              </h3>
              <p className="text-xs text-amber-100">
                {isBusinessAdmin ? "Hủy đơn và hoàn ngày phép tức thì" : "Gửi Admin nghiệp vụ để hoàn lại ngày phép"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-amber-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <p className="text-slate-700 font-medium">
            Bạn đang yêu cầu hủy đơn <strong>"{item.title}"</strong> ({item.daysCount} ngày làm việc).
          </p>
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Lý do hủy đơn *</label>
            <textarea
              rows={3}
              required
              placeholder="Ví dụ: Công việc đột xuất cần xử lý, lịch gia đình thay đổi nên đi làm bình thường..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-[11px] leading-relaxed">
            {isBusinessAdmin ? (
              <span>
                Với cương vị <strong>Admin nghiệp vụ</strong>, thao tác này sẽ <strong>hủy đơn trực tiếp ngay lập tức</strong>, đồng thời tự động hoàn lại <strong>{item.daysCount} ngày phép</strong> và khôi phục bảng chấm công.
              </span>
            ) : (
              <span>
                Khi Admin nghiệp vụ chấp thuận hủy đơn, <strong>{item.daysCount} ngày phép</strong> sẽ được tự động hoàn lại vào Quỹ phép năm của bạn và cập nhật lại bảng chấm công.
              </span>
            )}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
            >
              Đóng
            </button>
            <button
              type="submit"
              disabled={actionLoading || !reason.trim()}
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-xs transition-colors"
            >
              {isBusinessAdmin ? "Xác nhận tự hủy & hoàn phép" : "Gửi đề xuất hủy"}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
