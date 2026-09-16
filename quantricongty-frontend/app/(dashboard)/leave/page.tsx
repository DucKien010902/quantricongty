"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock,
  Plus,
  Calendar,
  Palmtree,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Search,
  User,
  Info,
  Check,
  X,
  FileText,
  AlertCircle,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { ApprovalItem, UserLeaveStats } from "../approvals/types";
import { CreateApprovalModal } from "../approvals/components/CreateApprovalModal";
import { CancelApprovalModal } from "../approvals/components/CancelApprovalModal";

export default function LeavePage() {
  const { currentUser, employees, showToast, loadData } = useApp();

  const [leaves, setLeaves] = useState<ApprovalItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [cancelModalItem, setCancelModalItem] = useState<ApprovalItem | null>(null);
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

  // Leave stats of current user
  const userLeaveStats: UserLeaveStats = useMemo(() => {
    const quota = currentEmployee?.annualLeaveQuota !== undefined ? currentEmployee.annualLeaveQuota : 12;
    const carried = currentEmployee?.carriedOverLeave || 0;
    const used = currentEmployee?.usedLeave || 0;
    const remaining =
      currentEmployee?.remainingLeave !== undefined
        ? currentEmployee.remainingLeave
        : Math.max(0, quota + carried - used);
    return {
      quota,
      carried,
      totalAllowed: quota + carried,
      used,
      remaining,
    };
  }, [currentEmployee]);

  // Kiểm tra Trưởng phòng HCNS dựa trên chức danh
  const isHeadOfHR = useMemo(() => {
    const emp = currentEmployee || currentUser;
    if (!emp) return false;
    const dept = (emp.department || "").toLowerCase();
    const pos = (emp.position || "").toLowerCase();
    const level = (emp.positionLevel || "").toLowerCase();
    const role = (emp.role || "").toUpperCase();

    if (role === "ADMIN") return true;

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

    return isHRDept && isLeaderTitle;
  }, [currentUser, currentEmployee]);

  // Fetch leave requests from backend
  const fetchLeaves = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5002/api/approvals?type=leave");
      if (res.ok) {
        const data = await res.json();
        setLeaves(data);
      }
    } catch (err) {
      console.error("Lỗi khi tải danh sách nghỉ phép:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  // LỌC CHÍNH XÁC: CHỈ HIỂN THỊ ĐƠN DO CHÍNH MÌNH TẠO (TRANG CÁ NHÂN)
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

  const myFilteredLeaves = useMemo(() => {
    return leaves.filter((item) => {
      // 1. Chỉ của mình
      if (!isMyRequest(item)) return false;

      // 2. Lọc trạng thái
      if (selectedStatus !== "all" && item.status !== selectedStatus) return false;

      // 3. Tìm kiếm
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = (item.title || "").toLowerCase().includes(q);
        const matchReason = (item.reason || "").toLowerCase().includes(q);
        const matchHandover = (item.handoverTo || "").toLowerCase().includes(q);
        if (!matchTitle && !matchReason && !matchHandover) return false;
      }
      return true;
    });
  }, [leaves, isMyRequest, selectedStatus, searchQuery]);

  // Handle submit new leave request
  const handleCreateLeave = async (payload: any) => {
    setActionLoading(true);
    try {
      const res = await fetch("http://localhost:5002/api/approvals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi gửi đơn xin nghỉ");
      }

      const created = await res.json();
      setLeaves([created, ...leaves]);
      setIsCreateModalOpen(false);
      if (created.status === "APPROVED") {
        showToast("Đơn nghỉ phép của Trưởng phòng HCNS đã được TỰ ĐỘNG DUYỆT ngay lập tức!");
      } else if (created.status === "PENDING_HR") {
        showToast("Đơn nghỉ phép đã được chuyển thẳng tới Trưởng phòng HCNS phê duyệt!");
      } else {
        showToast("Đã gửi đơn xin nghỉ phép thành công! Đang chờ Trưởng phòng duyệt Cấp 1.");
      }
      await loadData();
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi tạo đơn nghỉ phép!");
    } finally {
      setActionLoading(false);
    }
  };

  // Handle cancel request by requester
  const handleCancelRequest = async (item: ApprovalItem, reason?: string) => {
    const id = item._id || item.id;
    if (!id) return;
    setActionLoading(true);
    try {
      const res = await fetch(`http://localhost:5002/api/approvals/${id}/cancel`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userCode: currentUser?.code || currentEmployee?.code || item.requesterCode,
          userName: currentUser?.name || currentEmployee?.name || item.requesterName,
          reason: reason || "Kế hoạch cá nhân thay đổi",
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Lỗi khi gửi yêu cầu hủy đơn");
      }

      const updated = await res.json();
      setLeaves((prev) => prev.map((a) => (a._id === id || a.id === id ? updated : a)));
      setCancelModalItem(null);
      showToast(
        updated.status === "CANCELLED"
          ? (item.status === "APPROVED"
              ? "Trưởng phòng HCNS đã tự hủy đơn thành công và hoàn lại ngày phép vào quỹ!"
              : "Đã hủy đơn thành công!")
          : "Đã gửi đề xuất hủy đơn tới Trưởng phòng HCNS để hoàn lại ngày phép!"
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || "Có lỗi xảy ra khi hủy đơn!");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_LEADER":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Chờ Trưởng Ban
          </span>
        );
      case "PENDING_HR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-800 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Chờ HCNS duyệt
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Đã duyệt
          </span>
        );
      case "REQUEST_CANCEL":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">
            <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
            Chờ hủy đơn
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
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header gọn gàng, chữ to rõ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Clock className="w-6 h-6 text-[#1b365d]" />
            Xin nghỉ phép
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Theo dõi quỹ phép và lịch sử đơn nghỉ phép cá nhân
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-sm font-semibold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Tạo đơn nghỉ phép</span>
        </button>
      </div>

      {/* 1. THỐNG KÊ QUỸ PHÉP (3 THẺ CÂN ĐỐI, CHỮ TO RÕ) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Thẻ 1: Quỹ phép năm */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Tổng quỹ phép 2026</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1b365d]">
              <Palmtree className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-mono">
                {userLeaveStats.totalAllowed}
              </span>
              <span className="text-sm font-medium text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {userLeaveStats.quota} ngày năm nay + {userLeaveStats.carried} ngày tồn
            </p>
          </div>
        </div>

        {/* Thẻ 2: Đã sử dụng */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Số ngày đã nghỉ</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">
                {userLeaveStats.used}
              </span>
              <span className="text-sm font-medium text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Tự động trừ sau khi hoàn tất phê duyệt
            </p>
          </div>
        </div>

        {/* Thẻ 3: Khả dụng (Nổi bật nhất) */}
        <div className="bg-gradient-to-br from-[#1b365d] via-[#162d4e] to-[#0f1e36] text-white p-5 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between relative z-10">
            <span className="text-sm font-semibold text-blue-100">Ngày phép còn lại</span>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Khả dụng
            </span>
          </div>
          <div className="mt-4 relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-white font-mono tracking-tight">
                {userLeaveStats.remaining}
              </span>
              <span className="text-sm font-medium text-blue-200">ngày</span>
            </div>
            <p className="text-xs text-blue-200/80 mt-1 font-medium truncate">
              {currentUser?.name || "Cá nhân"} • {currentEmployee?.department || "Nội bộ"}
            </p>
          </div>
        </div>
      </div>

      {/* 2. LOẠI HÌNH NGHỈ PHÉP (GỌN GÀNG, CHỮ RÕ RÀNG) */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#1b365d]" />
          Quy định nghỉ phép
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-blue-50/50 hover:border-blue-200 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span className="font-bold text-slate-800 text-sm">Phép năm</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Hưởng 100% lương • Trừ quỹ phép năm</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-purple-50/50 hover:border-purple-200 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              <span className="font-bold text-slate-800 text-sm">Việc riêng có lương</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Hiếu hỉ, tang chế (1 - 3 ngày)</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-amber-50/50 hover:border-amber-200 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="font-bold text-slate-800 text-sm">Nghỉ ốm BHXH</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Có giấy y tế • BHXH chi trả</p>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100 transition-all">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <span className="font-bold text-slate-800 text-sm">Nghỉ không lương</span>
            </div>
            <p className="text-xs text-slate-600 font-medium">Thỏa thuận khi hết phép năm</p>
          </div>
        </div>
      </div>

      {/* 3. BỘ LỌC VÀ LỊCH SỬ ĐƠN (GIAO DIỆN BẢNG RÕ RÀNG) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header & Filter Box */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Lịch sử đơn nghỉ phép</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Danh sách các đơn do bạn đã tạo ({myFilteredLeaves.length} đơn)
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm tiêu đề, lý do..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>

            {/* Status Filter Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full sm:w-auto text-xs py-2 px-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
            >
              <option value="all">Tất cả trạng thái ({leaves.filter(isMyRequest).length})</option>
              <option value="PENDING_LEADER">Chờ Trưởng Ban</option>
              <option value="PENDING_HR">Chờ HCNS</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REQUEST_CANCEL">Chờ hủy</option>
              <option value="CANCELLED">Đã hủy</option>
              <option value="REJECTED">Từ chối</option>
            </select>
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 min-w-[130px]">Loại hình</th>
                <th className="py-3.5 px-4 min-w-[260px]">Tiêu đề & Lý do</th>
                <th className="py-3.5 px-4 text-center min-w-[150px]">Thời gian nghỉ</th>
                <th className="py-3.5 px-3 text-center min-w-[90px]">Số ngày</th>
                <th className="py-3.5 px-4 min-w-[140px]">Người bàn giao</th>
                <th className="py-3.5 px-4 text-center min-w-[140px]">Trạng thái</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-6 h-6 border-2 border-[#1b365d] border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-medium">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : myFilteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <FileText className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-sm font-semibold text-slate-600">Chưa có đơn nghỉ phép nào</span>
                      <span className="text-xs text-slate-400">Bấm nút "Tạo đơn nghỉ phép" ở trên để gửi đơn mới.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                myFilteredLeaves.map((l) => {
                  const itemId = l._id || l.id || "";
                  const subLabel =
                    l.leaveType === "personal"
                      ? "Việc riêng"
                      : l.leaveType === "sick"
                      ? "Ốm BHXH"
                      : l.leaveType === "unpaid"
                      ? "Không lương"
                      : "Phép năm";

                  return (
                    <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Loại hình */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                          {subLabel}
                        </span>
                      </td>

                      {/* Tiêu đề & Lý do */}
                      <td className="py-4 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 text-sm">{l.title}</p>
                        {l.reason && (
                          <p className="text-slate-500 text-xs mt-0.5 line-clamp-1">{l.reason}</p>
                        )}
                      </td>

                      {/* Thời gian */}
                      <td className="py-4 px-4 text-center font-medium text-xs text-slate-700 whitespace-nowrap">
                        {l.startDate}
                        {l.endDate && l.endDate !== l.startDate ? ` → ${l.endDate}` : ""}
                      </td>

                      {/* Số ngày */}
                      <td className="py-4 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg font-extrabold text-xs text-[#1b365d] bg-slate-100 font-mono">
                          {l.daysCount || 1} ngày
                        </span>
                      </td>

                      {/* Người bàn giao */}
                      <td className="py-4 px-4 text-slate-700 text-xs font-medium">
                        {l.handoverTo || "--"}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(l.status)}
                      </td>

                      {/* Hành động */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Đang chờ -> Hủy trực tiếp */}
                          {(l.status === "PENDING_LEADER" || l.status === "PENDING_HR") && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => handleCancelRequest(l)}
                              className="px-3 py-1.5 rounded-lg text-rose-700 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-all hover:shadow-2xs active:scale-95"
                              title="Hủy đơn này"
                            >
                              Hủy đơn
                            </button>
                          )}

                          {/* Đã duyệt -> Đề xuất hủy hoặc Tự hủy (Trưởng phòng HCNS) */}
                          {l.status === "APPROVED" && (
                            <button
                              type="button"
                              disabled={actionLoading}
                              onClick={() => setCancelModalItem(l)}
                              className="px-3 py-1.5 rounded-lg text-amber-800 hover:bg-amber-50 border border-amber-300 text-xs font-semibold transition-all hover:shadow-2xs active:scale-95"
                              title={isHeadOfHR ? "Trưởng phòng HCNS tự hủy đơn và hoàn lại ngày phép" : "Gửi đề xuất hủy đơn tới Trưởng phòng HCNS"}
                            >
                              {isHeadOfHR ? "Hủy đơn & Hoàn phép" : "Đề xuất hủy"}
                            </button>
                          )}

                          {l.status !== "PENDING_LEADER" &&
                            l.status !== "PENDING_HR" &&
                            l.status !== "APPROVED" && (
                              <span className="text-slate-400 text-xs">--</span>
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

      {/* MODAL TẠO ĐƠN NGHỈ PHÉP */}
      <CreateApprovalModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        defaultType="leave"
        leaveStats={userLeaveStats}
        employees={employees}
        currentUser={currentUser}
        currentEmployee={currentEmployee}
        actionLoading={actionLoading}
        onSubmit={handleCreateLeave}
      />

      {/* MODAL ĐỀ NGHỊ HỦY NGHỈ PHÉP */}
      <CancelApprovalModal
        item={cancelModalItem}
        onClose={() => setCancelModalItem(null)}
        actionLoading={actionLoading}
        isHeadOfHR={isHeadOfHR}
        onConfirmCancel={handleCancelRequest}
      />
    </div>
  );
}

