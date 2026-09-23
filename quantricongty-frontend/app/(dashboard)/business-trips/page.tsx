"use client";
import { API_URL } from "@/app/config/api";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Briefcase,
  Plus,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Car,
  Plane,
  X,
  Loader2,
  AlertCircle,
  FileText,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import Modal from "@/app/components/ui/Modal";

interface BusinessTripItem {
  _id?: string;
  id?: string;
  code: string;
  title: string;
  requesterCode: string;
  requesterName: string;
  department: string;
  position: string;
  destination: string;
  startDate: string;
  endDate: string;
  daysCount: number;
  dates: string[];
  purpose: string;
  budget: string;
  transportation: string;
  companions: string[];
  priority: string;
  status: string;
  leaderApproval?: any;
  hrApproval?: any;
  history?: any[];
}

export default function BusinessTripsPage() {
  const { currentUser, employees, showToast, loadData } = useApp();

  const [trips, setTrips] = useState<BusinessTripItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [inspectTrip, setInspectTrip] = useState<BusinessTripItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    startSession: "morning" as "morning" | "afternoon",
    endDate: "",
    endSession: "afternoon" as "morning" | "afternoon",
    purpose: "",
    budget: "",
    transportation: "Tự túc",
    companions: [] as string[],
    priority: "normal",
  });

  const currentEmployee = useMemo(() => {
    if (!currentUser) return null;
    return (
      employees?.find(
        (e) =>
          (e.code && e.code === currentUser.code) ||
          (e.email && e.email.toLowerCase() === (currentUser.email || "").toLowerCase()) ||
          e.name === currentUser.name
      ) || currentUser
    );
  }, [currentUser, employees]);

  const isAdmin = useMemo(() => {
    const role = (currentUser?.role || currentEmployee?.role || "").toUpperCase();
    return role === "ADMIN";
  }, [currentUser, currentEmployee]);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/approvals?type=trip`);
      if (res.ok) {
        const data = await res.json();
        setTrips(data);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTrips();
  }, [fetchTrips]);

  const calculatedWorkingDays = useMemo(() => {
    if (!formData.startDate) return { count: 0, dates: [], description: "" };

    const start = new Date(formData.startDate);
    const endStr = formData.endDate || formData.startDate;
    const end = new Date(endStr);

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      return { count: 0, dates: [], description: "Ngày chọn không hợp lệ" };
    }

    if (formData.startDate === endStr) {
      const dayOfWeek = start.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return { count: 0, dates: [], description: "Ngày nghỉ Cuối tuần (T7/CN)" };
      }
      if (formData.startSession === "afternoon" && formData.endSession === "morning") {
        return { count: 0, dates: [], description: "Buổi kết thúc (Sáng) không thể trước Buổi bắt đầu (Chiều)" };
      }

      let count = 1.0;
      let sessionText = "Cả ngày";
      if (formData.startSession === "morning" && formData.endSession === "morning") {
        count = 0.5;
        sessionText = "Ca sáng (08:00 - 12:00)";
      } else if (formData.startSession === "afternoon" && formData.endSession === "afternoon") {
        count = 0.5;
        sessionText = "Ca chiều (13:30 - 17:30)";
      } else if (formData.startSession === "morning" && formData.endSession === "afternoon") {
        count = 1.0;
        sessionText = "Cả ngày (08:00 - 17:30)";
      }

      return {
        count,
        dates: [formData.startDate],
        description: `1 ngày làm việc (${sessionText})`,
      };
    }

    const dates: string[] = [];
    const cur = new Date(start);
    while (cur <= end) {
      const dayOfWeek = cur.getDay();
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
      if (formData.startSession === "afternoon" && formData.endSession === "morning") {
        totalCount = 0;
      } else if (formData.startSession === formData.endSession) {
        totalCount = 0.5;
      } else {
        totalCount = 1.0;
      }
    } else {
      totalCount += formData.startSession === "afternoon" ? 0.5 : 1.0;
      totalCount += (dates.length - 2) * 1.0;
      totalCount += formData.endSession === "morning" ? 0.5 : 1.0;
    }

    const startText = formData.startSession === "morning" ? "Sáng" : "Chiều";
    const endText = formData.endSession === "morning" ? "Sáng" : "Chiều";
    const descText = `Từ ${startText} (${formData.startDate}) đến ${endText} (${endStr})`;

    return {
      count: totalCount,
      dates,
      description: descText,
    };
  }, [formData.startDate, formData.endDate, formData.startSession, formData.endSession]);

  const filteredTrips = useMemo(() => {
    return trips.filter((t) => {
      if (selectedStatus !== "all") {
        if (selectedStatus === "mine") {
          const isMine =
            t.requesterCode === currentUser?.code ||
            t.requesterCode === currentEmployee?.code ||
            t.requesterName === currentUser?.name;
          if (!isMine) return false;
        } else if (t.status !== selectedStatus) {
          return false;
        }
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchTitle = (t.title || "").toLowerCase().includes(q);
        const matchDest = (t.destination || "").toLowerCase().includes(q);
        const matchName = (t.requesterName || "").toLowerCase().includes(q);
        const matchDept = (t.department || "").toLowerCase().includes(q);
        if (!matchTitle && !matchDest && !matchName && !matchDept) return false;
      }
      return true;
    });
  }, [trips, selectedStatus, searchQuery, currentUser, currentEmployee]);

  // Handle submit create business trip
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.destination.trim() || !formData.startDate) {
      alert("Vui lòng điền đầy đủ Địa điểm và Ngày đi!");
      return;
    }

    if (!formData.purpose.trim()) {
      alert("Vui lòng nhập mục đích và nội dung công việc chi tiết!");
      return;
    }

    if (calculatedWorkingDays.count <= 0) {
      alert("Thời gian công tác không hợp lệ hoặc trùng ngày nghỉ cuối tuần!");
      return;
    }

    setIsSubmitting(true);
    try {
      const autoTitle = `Đợt công tác tại ${formData.destination.trim()}`;
      const shiftLabel = `${formData.startSession === "morning" ? "Sáng" : "Chiều"} ${formData.startDate} → ${formData.endSession === "morning" ? "Sáng" : "Chiều"} ${formData.endDate || formData.startDate}`;

      const payload = {
        type: "trip",
        title: autoTitle,
        destination: formData.destination.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate || formData.startDate,
        startSession: formData.startSession,
        endSession: formData.endSession,
        daysCount: calculatedWorkingDays.count,
        dates: calculatedWorkingDays.dates,
        leaveShift: formData.startSession === "morning" && formData.endSession === "afternoon" ? "full" : formData.startSession,
        leaveShiftLabel: shiftLabel,
        reason: formData.purpose.trim(),
        purpose: formData.purpose.trim(),
        budget: formData.budget ? `${formData.budget.replace(/[^0-9]/g, "")} đ` : "0 đ",
        transportation: formData.transportation,
        companions: formData.companions,
        priority: formData.priority,
        requesterCode: currentUser?.code || currentEmployee?.code || "ĐH0015",
        requesterName: currentUser?.name || currentEmployee?.name || "Cán bộ",
        department: currentUser?.department || currentEmployee?.department || "Ban Chuyên môn",
        position: currentUser?.position || currentEmployee?.position || "Chuyên viên",
      };

      const res = await fetch(`${API_URL}/approvals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        showToast("🎉 Đã tạo đề xuất công tác thành công!");
        setIsCreateModalOpen(false);
        setFormData({
          destination: "",
          startDate: "",
          startSession: "morning",
          endDate: "",
          endSession: "afternoon",
          purpose: "",
          budget: "",
          transportation: "Tự túc",
          companions: [],
          priority: "normal",
        });
        await fetchTrips();
        await loadData();
      } else {
        const err = await res.json();
        alert(err.message || "Có lỗi xảy ra khi tạo đợt công tác!");
      }
    } catch {
      alert("Không kết nối được backend!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApproveTrip = async (id: string, isApproved: boolean) => {
    try {
      const endpoint = isAdmin
        ? `${API_URL}/business-trips/${id}/hr-approve`
        : `${API_URL}/business-trips/${id}/leader-approve`;

      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approverCode: currentUser?.code || currentEmployee?.code || "ĐH0050",
          approverName: currentUser?.name || currentEmployee?.name || "Quản trị viên",
          isApproved,
          note: isApproved ? "Đồng ý kế hoạch và dự toán chi phí" : "Từ chối kế hoạch công tác",
        }),
      });

      if (res.ok) {
        showToast(isApproved ? "Đã phê duyệt đợt công tác!" : "Đã từ chối đợt công tác!");
        setInspectTrip(null);
        await fetchTrips();
        await loadData();
      } else {
        const err = await res.json();
        alert(err.message || "Lỗi thao tác!");
      }
    } catch {
      alert("Không kết nối được backend!");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_LEADER":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Chờ Trưởng Ban
          </span>
        );
      case "PENDING_HR":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200">
            <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
            Chờ Admin duyệt
          </span>
        );
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Đã duyệt (Ký hiệu: CT)
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-4 h-4 text-rose-600" />
            Từ chối
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            Đã hủy
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-6 h-6 text-[#1b365d]" />
            Đăng Ký & Lịch Công Tác Doanh Nghiệp
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Quản lý kế hoạch công tác, phụ cấp tác nghiệp và tự động đồng bộ chấm công (Ký hiệu: CT)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-sm font-bold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Đăng ký đợt công tác mới</span>
        </button>
      </div>

      {/* Thẻ Thống Kê Công Tác */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Tổng đợt công tác</p>
            <p className="text-2xl font-extrabold text-slate-900 font-mono mt-1">{trips.length}</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-[#1b365d]">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Đã phê duyệt (CT)</p>
            <p className="text-2xl font-extrabold text-emerald-600 font-mono mt-1">
              {trips.filter((t) => t.status === "APPROVED").length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500">Chờ duyệt</p>
            <p className="text-2xl font-extrabold text-amber-600 font-mono mt-1">
              {trips.filter((t) => t.status === "PENDING_LEADER" || t.status === "PENDING_HR").length}
            </p>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-[#1b365d] text-white p-5 rounded-2xl shadow-md flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-blue-200">Địa điểm phổ biến</p>
            <p className="text-base font-bold text-white mt-1">Hải Phòng • TP.HCM</p>
          </div>
          <div className="p-3 rounded-xl bg-white/10 text-white">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Thanh Lọc & Tìm Kiếm */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo địa điểm, tiêu đề, tên cán bộ, phòng ban..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50/70 border border-slate-200 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50 font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
          >
            <option value="all">Tất cả đợt công tác ({trips.length})</option>
            <option value="mine">Công tác của tôi</option>
            <option value="PENDING_LEADER">Chờ Trưởng Ban duyệt</option>
            <option value="PENDING_HR">Chờ Admin duyệt</option>
            <option value="APPROVED">Đã duyệt (APPROVED)</option>
            <option value="REJECTED">Từ chối</option>
          </select>
        </div>
      </div>

      {/* Bảng Danh Sách Đợt Công Tác */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-4 min-w-[120px]">Mã & Địa điểm</th>
                <th className="py-3.5 px-4 min-w-[220px]">Cán bộ & Tiêu đề</th>
                <th className="py-3.5 px-4 text-center min-w-[140px]">Thời gian công tác</th>
                <th className="py-3.5 px-3 text-center min-w-[90px]">Số ngày</th>
                <th className="py-3.5 px-4 min-w-[130px]">Dự toán kinh phí</th>
                <th className="py-3.5 px-4 min-w-[120px]">Phương tiện</th>
                <th className="py-3.5 px-4 text-center min-w-[130px]">Trạng thái</th>
                <th className="py-3.5 px-4 text-center min-w-[90px]">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Loader2 className="w-6 h-6 animate-spin text-[#1b365d]" />
                      <span className="text-xs font-medium">Đang tải lịch công tác...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTrips.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-1">
                      <Briefcase className="w-8 h-8 text-slate-300 mb-1" />
                      <span className="text-sm font-semibold text-slate-600">Chưa có lịch công tác nào</span>
                      <span className="text-xs text-slate-400">Bấm nút "Đăng ký đợt công tác mới" ở trên để tạo lịch trình.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredTrips.map((t) => {
                  const itemId = t._id || t.id || "";
                  return (
                    <tr key={itemId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Mã & Địa điểm */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-mono text-xs font-bold text-slate-700 block">{t.code}</span>
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#1b365d] mt-1">
                          <MapPin className="w-3.5 h-3.5 text-rose-500" />
                          {t.destination}
                        </span>
                      </td>

                      {/* Tiêu đề & Cán bộ */}
                      <td className="py-4 px-4 max-w-sm">
                        <p className="font-bold text-slate-900 text-sm">{t.title}</p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {t.requesterName} • {t.department}
                        </p>
                      </td>

                      {/* Thời gian */}
                      <td className="py-4 px-4 text-center font-medium text-xs text-slate-700 whitespace-nowrap">
                        {t.startDate}
                        {t.endDate && t.endDate !== t.startDate ? ` → ${t.endDate}` : ""}
                      </td>

                      {/* Số ngày */}
                      <td className="py-4 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg font-extrabold text-xs text-[#1b365d] bg-blue-50 border border-blue-100 font-mono">
                          {t.daysCount || 1} ngày
                        </span>
                      </td>

                      {/* Kinh phí */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-bold text-emerald-700 font-mono">{t.budget || "0 đ"}</span>
                      </td>

                      {/* Phương tiện */}
                      <td className="py-4 px-4 text-slate-700 text-xs font-medium">
                        {t.transportation || "Xe công ty"}
                      </td>

                      {/* Trạng thái */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(t.status)}
                      </td>

                      {/* Thao tác */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectTrip(t)}
                          className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-[#1b365d] hover:text-white font-semibold text-xs transition-all cursor-pointer"
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL ĐĂNG KÝ ĐỢT CÔNG TÁC MỚI */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} size="lg" hideHeader className="p-0 overflow-hidden">
        <div className="flex flex-col h-full">
          <div className="p-4 px-6 bg-gradient-to-r from-slate-900 to-[#1b365d] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-blue-300 ring-1 ring-white/10">
                <Briefcase className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white tracking-tight">Đăng Ký Đợt Công Tác Mới</h3>
            </div>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
            {/* Destination */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                Địa điểm công tác *
              </label>
              <input
                type="text"
                required
                placeholder="VD: Hải Phòng / Cảng Đình Vũ / TP. Hồ Chí Minh"
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-semibold text-slate-800"
              />
            </div>

            {/* Pick Ngày & Buổi (Từ ngày Sáng/Chiều → Đến ngày Sáng/Chiều) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Từ ngày & Buổi bắt đầu */}
              <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <label className="block font-bold text-slate-700 text-xs">Từ ngày & Buổi bắt đầu *</label>
                <div className="space-y-2">
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      setFormData((prev) => ({
                        ...prev,
                        startDate: val,
                        endDate: prev.endDate || val,
                      }));
                    }}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startSession: "morning" })}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        formData.startSession === "morning"
                          ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      ☀️ Buổi Sáng
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, startSession: "afternoon" })}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        formData.startSession === "afternoon"
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
                    min={formData.startDate}
                    value={formData.endDate || formData.startDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full p-2 rounded-lg border border-slate-200 bg-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                  />
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, endSession: "morning" })}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        formData.endSession === "morning"
                          ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                          : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      ☀️ Buổi Sáng
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, endSession: "afternoon" })}
                      className={`py-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        formData.endSession === "afternoon"
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
            {formData.startDate && (
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
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Tạm ứng / Kinh phí dự toán</label>
                <input
                  type="text"
                  placeholder="VD: 5,000,000"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-mono font-bold text-emerald-700"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phương tiện di chuyển</label>
                <select
                  value={formData.transportation}
                  onChange={(e) => setFormData({ ...formData, transportation: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 bg-white font-medium"
                >
                  <option value="Tự túc">Tự túc phương tiện (Mặc định)</option>
                  <option value="Xe công ty">Xe công ty sắp xếp</option>
                  <option value="Máy bay">Máy bay (Khứ hồi)</option>
                  <option value="Tàu hỏa">Tàu hỏa</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Mục đích & Nội dung công việc chi tiết *</label>
              <textarea
                rows={3}
                required
                placeholder="Nhập nội dung công tác, danh mục nhiệm vụ cần hoàn thành..."
                value={formData.purpose}
                onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-normal"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Briefcase className="w-4 h-4" />}
                <span>Gửi Đăng Ký Công Tác</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>

      {/* MODAL XEM CHI TIẾT ĐỢT CÔNG TÁC */}
      {inspectTrip && (
        <Modal isOpen={Boolean(inspectTrip)} onClose={() => setInspectTrip(null)} size="lg" hideHeader className="p-0 overflow-hidden">
          <div className="flex flex-col h-full">
            <div className="p-5 px-6 bg-[#1b365d] text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Briefcase className="w-6 h-6 text-blue-300" />
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">{inspectTrip.title}</h3>
                  <p className="text-xs text-blue-200 font-mono">Mã đợt: {inspectTrip.code}</p>
                </div>
              </div>
              <button type="button" onClick={() => setInspectTrip(null)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex justify-between items-center">
                <div>
                  <p className="text-sm font-bold text-slate-900">{inspectTrip.requesterName}</p>
                  <p className="text-xs text-slate-500 font-medium">{inspectTrip.position} • {inspectTrip.department}</p>
                </div>
                <div>{getStatusBadge(inspectTrip.status)}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-slate-50/50 p-4 rounded-xl border border-slate-200/70">
                <div>
                  <p className="text-slate-500 font-medium">Địa điểm công tác:</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-rose-500" />
                    {inspectTrip.destination}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Thời gian:</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{inspectTrip.startDate} → {inspectTrip.endDate} ({inspectTrip.daysCount} ngày)</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Dự toán kinh phí:</p>
                  <p className="font-extrabold text-emerald-700 text-sm mt-0.5">{inspectTrip.budget}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium">Phương tiện:</p>
                  <p className="font-bold text-slate-800 text-sm mt-0.5">{inspectTrip.transportation}</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-700 mb-1">Mục đích & Nội dung làm việc:</p>
                <p className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-normal leading-relaxed">{inspectTrip.purpose}</p>
              </div>

              {(inspectTrip.status === "PENDING_LEADER" || inspectTrip.status === "PENDING_HR") && (
                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => handleApproveTrip(inspectTrip._id || inspectTrip.id || "", false)}
                    className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Từ Chối
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApproveTrip(inspectTrip._id || inspectTrip.id || "", true)}
                    className="px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-bold text-xs shadow-md transition-colors cursor-pointer"
                  >
                    Phê Duyệt Đợt Công Tác
                  </button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
