"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { ClipboardCheck, ShieldCheck } from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { ApprovalItem } from "./types";
import { ApprovalStatsCards } from "./components/ApprovalStatsCards";
import { ApprovalFilterBar } from "./components/ApprovalFilterBar";
import { ApprovalTable } from "./components/ApprovalTable";
import { ApprovalDetailModal } from "./components/ApprovalDetailModal";

export default function ApprovalsPage() {
  const { currentUser, employees, showToast, loadData } = useApp();

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

  // User authority
  const isHRAdmin = useMemo(() => {
    const role = currentUser?.role || currentEmployee?.role || "";
    const dept = currentUser?.department || currentEmployee?.department || "";
    const code = currentUser?.code || currentEmployee?.code || "";
    return role === "ADMIN" || code === "DHI-001" || dept.includes("Nhân sự");
  }, [currentUser, currentEmployee]);

  const isLeader = useMemo(() => {
    const role = currentUser?.role || currentEmployee?.role || "";
    const level = currentEmployee?.positionLevel || "";
    const pos = currentUser?.position || currentEmployee?.position || "";
    return isHRAdmin || role === "LEADER" || level === "Trưởng Ban" || pos.includes("Trưởng");
  }, [currentUser, currentEmployee, isHRAdmin]);

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
    fetchApprovals();
  }, [fetchApprovals]);

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
    return approvals.filter((item) => !isMyRequest(item));
  }, [approvals, isMyRequest]);

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

  // Handle Leader Approve (Cấp 1 - Ban nào chỉ duyệt ban đó)
  const handleLeaderApprove = async (id: string, isApproved: boolean, note?: string) => {
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
        setInspectItem(updated);
      }
      showToast(
        isApproved
          ? "Đã duyệt Cấp 1! Đơn được chuyển tiếp lên Trưởng ban HCNS."
          : "Đã từ chối đơn phê duyệt."
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi phê duyệt!");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle HR Approve (Cấp 2 - Duyệt chốt & Trừ phép thật)
  const handleHRApprove = async (id: string, isApproved: boolean, note?: string) => {
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
        throw new Error(err.message || "Lỗi xử lý duyệt cấp HCNS");
      }

      const updated = await res.json();
      setApprovals((prev) => prev.map((a) => (a._id === id || a.id === id ? updated : a)));
      if (inspectItem && (inspectItem._id === id || inspectItem.id === id)) {
        setInspectItem(updated);
      }
      showToast(
        isApproved
          ? "Đã phê duyệt Cấp 2 (HCNS)! Tự động trừ phép thật và đồng bộ bảng chấm công."
          : "Đã từ chối đơn phê duyệt."
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi phê duyệt!");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle HR Approve Cancel (HCNS chấp thuận hủy & hoàn lại ngày phép)
  const handleHRApproveCancel = async (id: string, isApproved: boolean, note?: string) => {
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
        throw new Error(err.message || "Lỗi xử lý hủy đơn");
      }

      const updated = await res.json();
      setApprovals((prev) => prev.map((a) => (a._id === id || a.id === id ? updated : a)));
      if (inspectItem && (inspectItem._id === id || inspectItem.id === id)) {
        setInspectItem(updated);
      }
      showToast(
        isApproved
          ? "Đã chấp thuận hủy đơn! Hoàn trả ngày phép vào quỹ và khôi phục bảng chấm công."
          : "Đã từ chối đề xuất hủy đơn."
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi xử lý đề xuất hủy!");
    } finally {
      setActionLoading(false);
    }
  };

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
          {isHRAdmin ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Quyền: Trưởng Ban HCNS (Cấp 2 - Duyệt chốt)</span>
            </span>
          ) : isLeader ? (
            <span className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Quyền: Trưởng Ban (Cấp 1 - Duyệt nội bộ ban)</span>
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
        isHRAdmin={isHRAdmin}
        isLeader={isLeader}
        actionLoading={actionLoading}
        onInspect={(item) => {
          setInspectItem(item);
          setApprovalNote("");
        }}
        onLeaderApprove={(id, isApproved) => handleLeaderApprove(id, isApproved)}
        onHRApprove={(id, isApproved) => handleHRApprove(id, isApproved)}
        onHRApproveCancel={(id, isApproved) => handleHRApproveCancel(id, isApproved)}
      />

      {/* 4. MODAL: CHI TIẾT ĐỀ XUẤT (XEM GIẢI TRÌNH CĂN CỨ & PHÊ DUYỆT / TỪ CHỐI) */}
      {inspectItem && (
        <ApprovalDetailModal
          item={inspectItem}
          onClose={() => setInspectItem(null)}
          approvalNote={approvalNote}
          onNoteChange={setApprovalNote}
          actionLoading={actionLoading}
          isHRAdmin={isHRAdmin}
          isLeader={isLeader}
          currentUser={currentUser}
          currentEmployee={currentEmployee}
          onLeaderApprove={handleLeaderApprove}
          onHRApprove={handleHRApprove}
          onHRApproveCancel={handleHRApproveCancel}
          showToast={showToast}
        />
      )}
    </div>
  );
}
