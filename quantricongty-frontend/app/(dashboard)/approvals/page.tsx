"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ClipboardCheck, ShieldCheck, ShieldAlert, Clock, Home } from "lucide-react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import { ApprovalItem } from "./types";
import { ApprovalStatsCards } from "./components/ApprovalStatsCards";
import { ApprovalFilterBar } from "./components/ApprovalFilterBar";
import { ApprovalTable } from "./components/ApprovalTable";
import { ApprovalDetailModal } from "./components/ApprovalDetailModal";
import { ActionConfirmModal, ConfirmVariant } from "@/app/components/ui/ActionConfirmModal";
import { StatusFeedbackModal, FeedbackType } from "@/app/components/ui/StatusFeedbackModal";

export default function ApprovalsPage() {
  const { currentUser, employees, showToast, loadData, isAuthLoaded } = useApp();

  const [approvals, setApprovals] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters: 3 loại theo quy định (leave, trip, document)
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modals state
  const [inspectItem, setInspectItem] = useState<ApprovalItem | null>(null);
  const [approvalNote, setApprovalNote] = useState<string>("");
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Action Confirmation & Feedback Modals
  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    variant: ConfirmVariant;
    confirmText: string;
    actionType: "LEADER_APPROVE" | "LEADER_REJECT" | "HR_APPROVE" | "HR_REJECT" | "HR_CANCEL_APPROVE" | "HR_CANCEL_REJECT";
    itemId: string;
    itemDetails: { label: string; value: string }[];
  } | null>(null);

  const [confirmNote, setConfirmNote] = useState<string>("");

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

  // Matched employee of logged in user
  const currentEmployee = useMemo(() => {
    if (!currentUser) return null;
    return (
      employees.find(
        (e) =>
          (e.code && e.code === currentUser.code) ||
          (e.email && e.email.toLowerCase() === (currentUser.email || "").toLowerCase()) ||
          e.name === currentUser.name
      ) || currentUser
    );
  }, [currentUser, employees]);

  // Quyền Admin nghiệp vụ (Duyệt chốt Cấp 2 toàn công ty): Dựa vào role === "ADMIN" (hoặc Ban Quản Trị)
  const isBusinessAdmin = useMemo(() => {
    const emp = currentEmployee || currentUser;
    if (!emp) return false;
    const role = (emp.role || "").toUpperCase();
    const level = (emp.positionLevel || "").toLowerCase();
    return role === "ADMIN" || level === "ban quản trị";
  }, [currentUser, currentEmployee]);

  // Thẩm quyền Trưởng ban / Trưởng phòng chuyên môn (Duyệt Cấp 1)
  const isDepartmentLeader = useMemo(() => {
    const emp = currentEmployee || currentUser;
    if (!emp) return false;
    const role = (emp.role || "").toUpperCase();
    const pos = (emp.position || emp.jobTitle || "").toLowerCase();
    const level = (emp.positionLevel || "").toLowerCase();

    const isLeaderTitle =
      pos.includes("trưởng") ||
      pos.includes("giám đốc") ||
      pos.includes("phụ trách") ||
      level.includes("trưởng");

    return isLeaderTitle || role === "LEADER" || role === "MANAGER";
  }, [currentUser, currentEmployee]);

  const isHRAdmin = isBusinessAdmin;
  const isHeadOfHR = isBusinessAdmin;
  const isLeader = isDepartmentLeader;

  // Quyền vào trang Phê duyệt: CHỈ CÓ ADMIN NGHIỆP VỤ VÀ TRƯỞNG BAN
  const canAccessApprovals = useMemo(() => {
    return isBusinessAdmin || isDepartmentLeader;
  }, [isBusinessAdmin, isDepartmentLeader]);

  // Fetch approvals from backend
  const fetchApprovals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5002/api/approvals");
      if (res.ok) {
        const data = await res.json();
        setApprovals(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách phê duyệt:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canAccessApprovals) {
      fetchApprovals();
    }
  }, [fetchApprovals, canAccessApprovals]);

  // LỌC CHỈ HIỂN THỊ ĐƠN CỦA NGƯỜI KHÁC GỬI LÊN CẦN PHÊ DUYỆT (TRANG PHÊ DUYỆT CỦA CẤP QUẢN LÝ)
  const isMyRequest = useCallback(
    (item: ApprovalItem) => {
      const codeMatches =
        (item.requesterCode && item.requesterCode === currentUser?.code) ||
        (item.requesterCode && item.requesterCode === currentEmployee?.code);
      const nameMatches = item.requesterName && item.requesterName === currentUser?.name;
      return Boolean(codeMatches || nameMatches);
    },
    [currentUser, currentEmployee]
  );

  const otherApprovals = useMemo(() => {
    const userDept = currentEmployee?.department || currentUser?.department || "";
    return approvals.filter((item) => {
      // 1. Không hiển thị đơn của chính mình ở bảng phê duyệt cấp quản lý
      if (isMyRequest(item)) return false;

      // 2. Nếu là Admin nghiệp vụ: Có thẩm quyền duyệt C2 cho toàn công ty
      if (isBusinessAdmin) {
        return true;
      }

      // 3. Nếu là Trưởng phòng / Trưởng ban chuyên môn khác (ví dụ Ban CNTT):
      // CHỈ ĐƯỢC XEM & DUYỆT đơn của nhân sự thuộc đúng ban mình quản lý!
      if (isDepartmentLeader) {
        return Boolean(userDept && item.department === userDept);
      }

      // 4. Nếu là nhân viên thông thường (không phải Leader, không phải Admin):
      // Không có thẩm quyền duyệt đơn của người khác
      return false;
    });
  }, [approvals, isMyRequest, isBusinessAdmin, isDepartmentLeader, currentEmployee, currentUser]);

  // Stats
  const stats = useMemo(() => {
    const pendingLeader = otherApprovals.filter((a) => a.status === "PENDING_LEADER").length;
    const pendingHR = otherApprovals.filter((a) => a.status === "PENDING_HR").length;
    const pendingTotal = pendingLeader + pendingHR;
    const approved = otherApprovals.filter((a) => a.status === "APPROVED").length;
    const requestCancel = otherApprovals.filter((a) => a.status === "REQUEST_CANCEL").length;
    const rejectedOrCancelled = otherApprovals.filter(
      (a) => a.status === "REJECTED" || a.status === "CANCELLED"
    ).length;

    return {
      pendingTotal,
      pendingLeader,
      pendingHR,
      approved,
      requestCancel,
      rejectedOrCancelled,
      total: otherApprovals.length,
    };
  }, [otherApprovals]);

  const typeCounts = useMemo(() => {
    return {
      all: otherApprovals.length,
      leave: otherApprovals.filter((a) => a.type === "leave").length,
      trip: otherApprovals.filter((a) => a.type === "trip").length,
      document: otherApprovals.filter((a) => a.type === "document").length,
    };
  }, [otherApprovals]);

  // Filtered approvals
  const filteredApprovals = useMemo(() => {
    return otherApprovals.filter((item) => {
      // Type filter
      if (selectedType !== "all" && item.type !== selectedType) return false;

      // Status filter
      if (selectedStatus !== "all") {
        if (selectedStatus === "pending") {
          if (item.status !== "PENDING_LEADER" && item.status !== "PENDING_HR") return false;
        } else if (selectedStatus === "APPROVED") {
          if (item.status !== "APPROVED") return false;
        } else if (selectedStatus === "REQUEST_CANCEL") {
          if (item.status !== "REQUEST_CANCEL") return false;
        } else if (selectedStatus === "closed") {
          if (item.status !== "REJECTED" && item.status !== "CANCELLED") return false;
        }
      }

      // Search query
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchRequester = (item.requesterName || "").toLowerCase().includes(q);
        const matchDept = (item.department || "").toLowerCase().includes(q);
        const matchReason = (item.reason || "").toLowerCase().includes(q);
        if (!matchTitle && !matchRequester && !matchDept && !matchReason) return false;
      }

      return true;
    });
  }, [otherApprovals, selectedType, selectedStatus, searchQuery]);

  // Prompt confirmation helpers
  const promptLeaderApprove = (item: ApprovalItem, isApproved: boolean, note?: string) => {
    setConfirmNote(note || approvalNote || "");
    setConfirmModalState({
      isOpen: true,
      actionType: isApproved ? "LEADER_APPROVE" : "LEADER_REJECT",
      itemId: item._id || item.id || "",
      title: isApproved ? "Xác nhận Phê duyệt Cấp 1" : "Xác nhận Từ chối đơn",
      description: isApproved
        ? `Bạn có chắc chắn muốn duyệt Cấp 1 đơn của nhân sự ${item.requesterName}? Đơn sẽ được gửi tiếp lên Admin nghiệp vụ duyệt Cấp 2.`
        : `Bạn có chắc chắn muốn từ chối đơn đề xuất của ${item.requesterName}?`,
      variant: isApproved ? "success" : "danger",
      confirmText: isApproved ? "Xác nhận Duyệt C1" : "Từ chối đơn",
      itemDetails: [
        { label: "Nhân sự đề xuất", value: `${item.requesterName} (${item.department})` },
        { label: "Nội dung", value: item.title },
        { label: "Số ngày / Thời gian", value: item.daysCount ? `${item.daysCount} ngày (${item.startDate || ""} → ${item.endDate || ""})` : item.startDate || "N/A" },
      ],
    });
  };

  const promptHRApprove = (item: ApprovalItem, isApproved: boolean, note?: string) => {
    setConfirmNote(note || approvalNote || "");
    setConfirmModalState({
      isOpen: true,
      actionType: isApproved ? "HR_APPROVE" : "HR_REJECT",
      itemId: item._id || item.id || "",
      title: isApproved ? "Xác nhận Duyệt Chốt Cấp 2 (Admin)" : "Xác nhận Từ chối Cấp 2",
      description: isApproved
        ? `Bạn có chắc chắn muốn duyệt chốt Cấp 2 cho đơn của ${item.requesterName}? Hệ thống sẽ tự động trừ phép thật và cập nhật bảng chấm công.`
        : `Bạn có chắc chắn muốn từ chối đơn của ${item.requesterName}?`,
      variant: isApproved ? "success" : "danger",
      confirmText: isApproved ? "Duyệt Chốt" : "Từ chối đơn",
      itemDetails: [
        { label: "Nhân sự đề xuất", value: `${item.requesterName} (${item.department})` },
        { label: "Nội dung", value: item.title },
        { label: "Số ngày trừ phép", value: item.daysCount ? `${item.daysCount} ngày` : "N/A" },
      ],
    });
  };

  const promptHRApproveCancel = (item: ApprovalItem, isApproved: boolean, note?: string) => {
    setConfirmNote(note || approvalNote || "");
    setConfirmModalState({
      isOpen: true,
      actionType: isApproved ? "HR_CANCEL_APPROVE" : "HR_CANCEL_REJECT",
      itemId: item._id || item.id || "",
      title: isApproved ? "Xác nhận Duyệt Hủy Đơn & Hoàn Phép" : "Xác nhận Từ chối Hủy Đơn",
      description: isApproved
        ? `Bạn có chắc chắn muốn chấp thuận hủy đơn và hoàn lại ngày phép cho ${item.requesterName}?`
        : `Bạn có chắc chắn từ chối đề xuất hủy đơn của ${item.requesterName}?`,
      variant: isApproved ? "warning" : "danger",
      confirmText: isApproved ? "Chấp thuận Hủy & Hoàn phép" : "Không chấp thuận",
      itemDetails: [
        { label: "Nhân sự đề xuất", value: `${item.requesterName} (${item.department})` },
        { label: "Nội dung đơn", value: item.title },
        { label: "Số ngày hoàn phép", value: item.daysCount ? `${item.daysCount} ngày` : "N/A" },
      ],
    });
  };

  const handleLeaderApproveClick = (id: string, isApproved: boolean, note?: string) => {
    const item = approvals.find((a) => a._id === id || a.id === id);
    if (item) promptLeaderApprove(item, isApproved, note);
  };

  const handleHRApproveClick = (id: string, isApproved: boolean, note?: string) => {
    const item = approvals.find((a) => a._id === id || a.id === id);
    if (item) promptHRApprove(item, isApproved, note);
  };

  const handleHRApproveCancelClick = (id: string, isApproved: boolean, note?: string) => {
    const item = approvals.find((a) => a._id === id || a.id === id);
    if (item) promptHRApproveCancel(item, isApproved, note);
  };

  // Execution functions
  const executeLeaderApprove = async (id: string, isApproved: boolean, note?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5002/api/approvals/${id}/leader-approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverCode: currentUser?.code || currentEmployee?.code || "LEADER",
          approverName: currentUser?.name || currentEmployee?.name || "Trưởng Ban",
          isApproved,
          note: note || (isApproved ? "Đồng ý duyệt cấp Ban" : "Không chấp thuận"),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi xử lý duyệt cấp ban");
      }

      const updated = await res.json();
      setApprovals((prev) => prev.map((a) => (a._id === id || a.id === id ? updated : a)));
      if (inspectItem && (inspectItem._id === id || inspectItem.id === id)) {
        setInspectItem(null);
      }
      await loadData();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("approval-changed"));
      }

      setFeedbackState({
        isOpen: true,
        type: "success",
        title: isApproved ? "Đã Phê Duyệt Cấp 1 Thành Công!" : "Đã Từ Chối Đơn!",
        message: isApproved
          ? "Hồ sơ đề xuất đã được phê duyệt Cấp 1 và chuyển tới Admin nghiệp vụ để duyệt chốt Cấp 2."
          : "Hồ sơ đề xuất đã bị từ chối.",
      });
    } catch (err: any) {
      setFeedbackState({
        isOpen: true,
        type: "error",
        title: "Thao Tác Thất Bại!",
        message: err.message || "Có lỗi xảy ra khi phê duyệt đơn!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const executeHRApprove = async (id: string, isApproved: boolean, note?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5002/api/approvals/${id}/hr-approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverCode: currentUser?.code || currentEmployee?.code || "DHI-001",
          approverName: currentUser?.name || currentEmployee?.name || "Trần Văn Khang",
          isApproved,
          note: note || (isApproved ? "Đã duyệt chốt & Ghi nhận công" : "Từ chối duyệt đơn"),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi xử lý duyệt Cấp 2 (Admin nghiệp vụ)");
      }

      const updated = await res.json();
      setApprovals((prev) => prev.map((a) => (a._id === id || a.id === id ? updated : a)));
      if (inspectItem && (inspectItem._id === id || inspectItem.id === id)) {
        setInspectItem(null);
      }
      await loadData();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("approval-changed"));
      }

      setFeedbackState({
        isOpen: true,
        type: "success",
        title: isApproved ? "Đã Duyệt Chốt Cấp 2 Thành Công!" : "Đã Từ Chối Phê Duyệt!",
        message: isApproved
          ? "Đã phê duyệt chốt đơn thành công! Tự động trừ phép thật và cập nhật bảng chấm công."
          : "Đã từ chối duyệt đơn thành công.",
      });
    } catch (err: any) {
      setFeedbackState({
        isOpen: true,
        type: "error",
        title: "Thao Tác Thất Bại!",
        message: err.message || "Có lỗi xảy ra khi phê duyệt đơn!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const executeHRApproveCancel = async (id: string, isApproved: boolean, note?: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5002/api/approvals/${id}/hr-approve-cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hrCode: currentUser?.code || currentEmployee?.code || "DHI-001",
          hrName: currentUser?.name || currentEmployee?.name || "Trần Văn Khang",
          isApproved,
          note: note || (isApproved ? "Đã chấp thuận hủy đơn và hoàn phép" : "Từ chối yêu cầu hủy đơn"),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi xử lý duyệt hủy đơn");
      }

      const updated = await res.json();
      setApprovals((prev) => prev.map((a) => (a._id === id || a.id === id ? updated : a)));
      if (inspectItem && (inspectItem._id === id || inspectItem.id === id)) {
        setInspectItem(null);
      }
      await loadData();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("approval-changed"));
      }

      setFeedbackState({
        isOpen: true,
        type: "success",
        title: isApproved ? "Đã Chấp Thuận Hủy Đơn & Hoàn Phép!" : "Đã Từ Chối Đề Xuất Hủy!",
        message: isApproved
          ? "Đã chấp thuận hủy đơn và hoàn lại ngày phép vào quỹ phép cá nhân thành công!"
          : "Đã từ chối đề xuất hủy đơn.",
      });
    } catch (err: any) {
      setFeedbackState({
        isOpen: true,
        type: "error",
        title: "Thao Tác Thất Bại!",
        message: err.message || "Có lỗi xảy ra khi xử lý đề xuất hủy!",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmActionSubmit = async () => {
    if (!confirmModalState) return;
    const { actionType, itemId } = confirmModalState;
    setConfirmModalState(null);

    if (actionType === "LEADER_APPROVE") {
      await executeLeaderApprove(itemId, true, confirmNote);
    } else if (actionType === "LEADER_REJECT") {
      await executeLeaderApprove(itemId, false, confirmNote);
    } else if (actionType === "HR_APPROVE") {
      await executeHRApprove(itemId, true, confirmNote);
    } else if (actionType === "HR_REJECT") {
      await executeHRApprove(itemId, false, confirmNote);
    } else if (actionType === "HR_CANCEL_APPROVE") {
      await executeHRApproveCancel(itemId, true, confirmNote);
    } else if (actionType === "HR_CANCEL_REJECT") {
      await executeHRApproveCancel(itemId, false, confirmNote);
    }
  };

  // Nếu đã nạp auth và người dùng không phải Admin hoặc Trưởng phòng: Chặn truy cập
  if (isAuthLoaded && currentUser && !canAccessApprovals) {
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
              Trang Phê duyệt chỉ dành riêng cho <b>Quản trị viên (Admin)</b> và các <b>Trưởng phòng / Trưởng ban</b> có thẩm quyền phê duyệt hồ sơ cán bộ nhân viên.
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
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner - Phê duyệt hồ sơ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <ClipboardCheck className="w-6 h-6 text-[#1b365d]" />
            Trung tâm phê duyệt hồ sơ
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Xét duyệt hồ sơ cán bộ nhân viên gửi lên: Đơn nghỉ phép, Đề xuất công tác và Phê duyệt tài liệu
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          {isBusinessAdmin ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Vai trò: Admin nghiệp vụ (Cấp 2 - Duyệt chốt toàn công ty)</span>
            </span>
          ) : isDepartmentLeader ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Chức danh: Trưởng Ban ({currentEmployee?.department || currentUser?.department || 'Chuyên môn'}) - Duyệt Cấp 1</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
              <span>Vai trò: Cán bộ thẩm duyệt</span>
            </span>
          )}
        </div>
      </div>

      {/* 1. STATS TỔNG HỢP TIẾN TRÌNH */}
      <ApprovalStatsCards stats={stats} />

      {/* 2. BỘ LỌC TÌM KIẾM THEO 3 LOẠI ĐƠN & TRẠNG THÁI */}
      <ApprovalFilterBar
        selectedType={selectedType}
        onSelectType={setSelectedType}
        typeCounts={typeCounts}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
        stats={stats}
      />

      {/* 3. BẢNG PHÊ DUYỆT (KHÔNG CÓ CỘT MÃ ĐƠN - BAN NÀO CHỈ DUYỆT BAN ĐÓ) */}
      <ApprovalTable
        approvals={filteredApprovals}
        loading={loading}
        currentUser={currentUser}
        currentEmployee={currentEmployee}
        isHeadOfHR={isHeadOfHR}
        isHRAdmin={isHeadOfHR}
        isLeader={isDepartmentLeader}
        actionLoading={actionLoading}
        onInspect={(item) => {
          setInspectItem(item);
          setApprovalNote("");
        }}
        onLeaderApprove={(id, isApproved) => handleLeaderApproveClick(id, isApproved)}
        onHRApprove={(id, isApproved) => handleHRApproveClick(id, isApproved)}
        onHRApproveCancel={(id, isApproved) => handleHRApproveCancelClick(id, isApproved)}
      />

      {/* 4. MODAL: CHI TIẾT ĐỀ XUẤT (XEM GIẢI TRÌNH CĂN CỨ & PHÊ DUYỆT / TỪ CHỐI) */}
      {inspectItem && (
        <ApprovalDetailModal
          item={inspectItem}
          onClose={() => setInspectItem(null)}
          approvalNote={approvalNote}
          onNoteChange={setApprovalNote}
          actionLoading={actionLoading}
          isHeadOfHR={isHeadOfHR}
          isHRAdmin={isHeadOfHR}
          isLeader={isDepartmentLeader}
          currentUser={currentUser}
          currentEmployee={currentEmployee}
          onLeaderApprove={(id, isApproved, note) => handleLeaderApproveClick(id, isApproved, note)}
          onHRApprove={(id, isApproved, note) => handleHRApproveClick(id, isApproved, note)}
          onHRApproveCancel={(id, isApproved, note) => handleHRApproveCancelClick(id, isApproved, note)}
          showToast={showToast}
        />
      )}

      {/* 5. MODAL XÁC NHẬN HÀNH ĐỘNG (CONFIRM MODAL) */}
      {confirmModalState && (
        <ActionConfirmModal
          isOpen={confirmModalState.isOpen}
          onClose={() => setConfirmModalState(null)}
          onConfirm={handleConfirmActionSubmit}
          title={confirmModalState.title}
          description={confirmModalState.description}
          variant={confirmModalState.variant}
          confirmText={confirmModalState.confirmText}
          itemDetails={confirmModalState.itemDetails}
          noteValue={confirmNote}
          onNoteChange={setConfirmNote}
          isLoading={actionLoading}
        />
      )}

      {/* 6. MODAL PHẢN HỒI TRẠNG THÁI (SUCCESS / FAILURE FEEDBACK MODAL) */}
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
