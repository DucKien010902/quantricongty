"use client";

import React from "react";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Check,
  X,
  RotateCcw,
  Palmtree,
  Briefcase,
  FileText,
} from "lucide-react";
import { ApprovalItem } from "../types";

interface ApprovalTableProps {
  approvals: ApprovalItem[];
  loading: boolean;
  currentUser: any;
  currentEmployee: any;
  isHeadOfHR?: boolean;
  isHRAdmin?: boolean;
  isLeader: boolean;
  actionLoading: boolean;
  onInspect: (item: ApprovalItem) => void;
  onLeaderApprove: (id: string, isApproved: boolean) => void;
  onHRApprove: (id: string, isApproved: boolean) => void;
  onHRApproveCancel: (id: string, isApproved: boolean) => void;
}

export const ApprovalTable: React.FC<ApprovalTableProps> = ({
  approvals,
  loading,
  currentUser,
  currentEmployee,
  isHeadOfHR = false,
  isHRAdmin = false,
  isLeader,
  actionLoading,
  onInspect,
  onLeaderApprove,
  onHRApprove,
  onHRApproveCancel,
}) => {
  const canApproveHR = isHeadOfHR || isHRAdmin;
  const userDept = currentEmployee?.department || currentUser?.department || "";

  // Thẩm quyền Duyệt Cấp 1: Bắt buộc Trưởng ban / Trưởng phòng của CHÍNH BAN ĐÓ duyệt
  const canApproveLeader = (item: ApprovalItem) => {
    if (item.status !== "PENDING_LEADER") return false;
    // Bắt buộc phải là Lãnh đạo / Trưởng phòng và thuộc CÙNG PHÒNG BAN với nhân sự làm đơn
    return isLeader && userDept === item.department;
  };

  const getTypeBadge = (type: string, leaveType?: string) => {
    if (type === "leave") {
      const subLabel =
        leaveType === "personal"
          ? "Việc riêng"
          : leaveType === "sick"
          ? "Nghỉ ốm"
          : leaveType === "unpaid"
          ? "Không lương"
          : "Phép năm";
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <Palmtree className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <span>Nghỉ phép ({subLabel})</span>
        </span>
      );
    }
    if (type === "trip") {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-purple-50 text-purple-800 border border-purple-200">
          <Briefcase className="w-3.5 h-3.5 text-purple-600 shrink-0" />
          <span>Công tác</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
        <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        <span>Tài liệu</span>
      </span>
    );
  };

  const getStatusBadge = (item: ApprovalItem) => {
    switch (item.status) {
      case "PENDING_LEADER":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Cấp 1: Chờ Trưởng ban
          </span>
        );
      case "PENDING_HR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Cấp 2: Chờ HCNS
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Đã duyệt hoàn tất
          </span>
        );
      case "REQUEST_CANCEL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            Đề nghị hủy đơn
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-4 h-4 text-rose-600" />
            Từ chối
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold tracking-wider text-xs">
            <tr>
              <th className="py-3.5 px-4 min-w-[200px]">Nhân sự đề xuất</th>
              <th className="py-3.5 px-3 min-w-[140px]">Loại yêu cầu</th>
              <th className="py-3.5 px-4 min-w-[280px]">Nội dung đề xuất</th>
              <th className="py-3.5 px-3 text-center min-w-[140px]">Thời gian</th>
              <th className="py-3.5 px-3 text-center min-w-[150px]">Trạng thái</th>
              <th className="py-3.5 px-4 text-center min-w-[170px]">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-[#1b365d] border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-medium">Đang tải hồ sơ...</span>
                  </div>
                </td>
              </tr>
            ) : approvals.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-1">
                    <FileText className="w-8 h-8 text-slate-300 mb-1" />
                    <span className="text-sm font-semibold text-slate-600">Không tìm thấy hồ sơ nào</span>
                    <span className="text-xs text-slate-400">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.</span>
                  </div>
                </td>
              </tr>
            ) : (
              approvals.map((item) => {
                const itemId = item._id || item.id || "";

                return (
                  <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. Nhân sự đề xuất */}
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-bold text-slate-900 text-sm leading-snug">
                          {item.requesterName}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {item.department} {item.position ? `• ${item.position}` : ""}
                        </p>
                      </div>
                    </td>

                    {/* 2. Loại yêu cầu */}
                    <td className="py-4 px-3 whitespace-nowrap">
                      {getTypeBadge(item.type, item.leaveType)}
                    </td>

                    {/* 3. Nội dung đề xuất */}
                    <td className="py-4 px-4">
                      <div className="max-w-md">
                        <p
                          className="font-bold text-slate-900 text-sm leading-snug hover:text-[#1b365d] cursor-pointer transition-colors"
                          onClick={() => onInspect(item)}
                        >
                          {item.title}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          {item.daysCount !== undefined && item.daysCount > 0 && (
                            <span className="inline-block font-mono font-extrabold text-[#1b365d] bg-slate-100 px-2.5 py-0.5 rounded-md text-xs">
                              {item.daysCount} ngày
                            </span>
                          )}
                          {item.amount && (
                            <span className="inline-block font-mono font-bold text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md text-xs border border-purple-200">
                              Dự toán: {item.amount}
                            </span>
                          )}
                          {item.handoverTo && (
                            <span className="text-xs text-slate-500 font-medium">
                              Bàn giao: {item.handoverTo}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* 4. Thời gian */}
                    <td className="py-4 px-3 text-center font-medium text-xs text-slate-700 whitespace-nowrap">
                      {item.startDate ? (
                        <div>
                          <p className="font-bold text-slate-800">
                            {item.startDate}
                            {item.endDate && item.endDate !== item.startDate ? ` → ${item.endDate}` : ""}
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.createdAt ? String(item.createdAt).slice(0, 16) : ""}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400">Theo kế hoạch</span>
                      )}
                    </td>

                    {/* 5. Tiến trình duyệt */}
                    <td className="py-4 px-3 text-center whitespace-nowrap">
                      {getStatusBadge(item)}
                    </td>

                    {/* 6. Hành động */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        {/* Xem chi tiết */}
                        <button
                          type="button"
                          onClick={() => onInspect(item)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#1b365d] hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết nội dung giải trình"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Duyệt Cấp 1 */}
                        {canApproveLeader(item) && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => onLeaderApprove(itemId, true)}
                              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                              title={`Duyệt cấp Ban (${item.department})`}
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Duyệt C1</span>
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => onLeaderApprove(itemId, false)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                              title="Từ chối đơn"
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </>
                        )}

                        {/* Duyệt Cấp 2 (Trưởng phòng HCNS) */}
                        {item.status === "PENDING_HR" && canApproveHR && (
                          <>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => onHRApprove(itemId, true)}
                              className="px-3 py-1.5 rounded-lg bg-[#1b365d] hover:bg-[#152a4a] text-white font-semibold text-xs shadow-2xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                              title="Trưởng phòng HCNS phê duyệt chốt & trừ phép thật"
                            >
                              <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                              <span>Duyệt Chốt</span>
                            </button>
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => onHRApprove(itemId, false)}
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
                              title="Từ chối đơn"
                            >
                              <X className="w-4 h-4 stroke-[2.5]" />
                            </button>
                          </>
                        )}

                        {/* Trưởng phòng HCNS Duyệt Hủy Đơn */}
                        {item.status === "REQUEST_CANCEL" && canApproveHR && (
                          <button
                            type="button"
                            disabled={actionLoading}
                            onClick={() => onHRApproveCancel(itemId, true)}
                            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-2xs transition-all hover:scale-105 active:scale-95 flex items-center gap-1"
                            title="Chấp thuận hủy đơn và hoàn phép"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Hoàn phép</span>
                          </button>
                        )}

                        {!canApproveLeader(item) &&
                          !(item.status === "PENDING_HR" && canApproveHR) &&
                          !(item.status === "REQUEST_CANCEL" && canApproveHR) && (
                            item.status === "PENDING_LEADER" ? (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md cursor-help"
                                title={`Đơn đang chờ Trưởng phòng / Trưởng ban (${item.department}) duyệt Cấp 1 trước`}
                              >
                                ⏳ Chờ Trưởng phòng
                              </span>
                            ) : item.status === "PENDING_HR" ? (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/80 px-2 py-0.5 rounded-md cursor-help"
                                title="Đơn đang chờ Trưởng phòng Hành chính - Nhân sự phê duyệt chốt Cấp 2"
                              >
                                ⏳ Chờ Trưởng HCNS
                              </span>
                            ) : item.status === "REQUEST_CANCEL" ? (
                              <span
                                className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md cursor-help"
                                title="Đang chờ Trưởng phòng HCNS xác nhận hủy và hoàn phép"
                              >
                                ⏳ Chờ Trưởng HCNS hủy
                              </span>
                            ) : (
                              <span className="text-slate-400 text-xs">--</span>
                            )
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

