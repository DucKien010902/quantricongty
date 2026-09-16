"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  CalendarCheck,
  Clock,
  UserCheck,
  AlertTriangle,
  Download,
  Filter,
  RefreshCw,
  Search,
  CheckCircle2,
  Calendar,
  Upload,
  Server,
  Wifi,
  FileSpreadsheet,
  AlertCircle,
  Eye,
  X,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Employee } from "@/app/data/seed-employees";

interface AttendanceViewProps {
  employees: Employee[];
  departments?: any[];
}

export default function AttendanceView({ employees, departments = [] }: AttendanceViewProps) {
  // Tab: 'daily' | 'monthly' | 'raw'
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "raw">("daily");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [filterDept, setFilterDept] = useState("ALL");
  const [filterUser, setFilterUser] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Data states
  const [dailyData, setDailyData] = useState<any[]>([]);
  const [monthlySummary, setMonthlySummary] = useState<any>(null);
  const [rawLogs, setRawLogs] = useState<any[]>([]);
  const [rawTotal, setRawTotal] = useState(0);
  const [rawPage, setRawPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [attendanceConfig, setAttendanceConfig] = useState<any>(null);

  // Modals
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);

  // Device sync modal state
  const [deviceIp, setDeviceIp] = useState("192.168.1.201");
  const [devicePort, setDevicePort] = useState(4370);
  const [deviceCommKey, setDeviceCommKey] = useState(123456);
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [pingMessage, setPingMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Excel import state
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [excelPreview, setExcelPreview] = useState<any[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Helper to format weekly off days
  const formatWeeklyOffDays = (str?: string) => {
    if (str === undefined || str === null || str === "0,6") return "T7, CN";
    const days = str.split(",").map((s) => s.trim()).filter(Boolean);
    if (days.length === 0) return "Không nghỉ (Làm cả tuần)";
    const map: Record<string, string> = {
      "0": "CN",
      "1": "T2",
      "2": "T3",
      "3": "T4",
      "4": "T5",
      "5": "T6",
      "6": "T7",
    };
    return days.map((d) => map[d] || d).join(", ");
  };

  // Load Data on tab or month change
  useEffect(() => {
    loadAllData();
  }, [selectedMonth, filterDept, filterUser, rawPage]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      // 1. Daily data
      const dailyRes = await fetch(
        `http://localhost:5002/api/attendance/daily?month=${selectedMonth}&userId=${filterUser}&department=${filterDept}`
      );
      if (dailyRes.ok) {
        const data = await dailyRes.json();
        setDailyData(data);
      }

      // 2. Monthly summary
      const monthlyRes = await fetch(
        `http://localhost:5002/api/attendance/monthly-summary?month=${selectedMonth}`
      );
      if (monthlyRes.ok) {
        const data = await monthlyRes.json();
        setMonthlySummary(data);
      }

      // 3. Raw logs
      const rawRes = await fetch(
        `http://localhost:5002/api/attendance/raw-logs?month=${selectedMonth}&userId=${filterUser}&page=${rawPage}&limit=50`
      );
      if (rawRes.ok) {
        const data = await rawRes.json();
        setRawLogs(data.logs || []);
        setRawTotal(data.total || 0);
      }

      // 4. Active Shift & Days Off Config
      const configRes = await fetch(`http://localhost:5002/api/attendance/config`);
      if (configRes.ok) {
        const cfg = await configRes.json();
        setAttendanceConfig(cfg);
      }
    } catch (e) {
      console.warn("Backend attendance endpoint not reachable, keeping local state:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all data (Reset to zero)
  const handleClearAll = async () => {
    if (!window.confirm("Bạn có chắc chắn muốn XÓA SẠCH toàn bộ dữ liệu chấm công (kể cả dữ liệu mẫu) để kiểm thử dữ liệu thực tế không?")) return;
    try {
      const res = await fetch("http://localhost:5002/api/attendance/clear-all", { method: "POST" });
      if (res.ok) {
        showToast("Đã xóa sạch toàn bộ dữ liệu chấm công! Bảng hiện tại trống 100%.");
        await loadAllData();
      }
    } catch {
      alert("Lỗi khi kết nối backend!");
    }
  };

  // Ping test
  const handleTestConnection = async () => {
    setPingStatus("testing");
    setPingMessage("Đang mở kết nối TCP Socket 4370 tới thiết bị...");
    setSyncFeedback(null);
    try {
      const res = await fetch("http://localhost:5002/api/attendance/device/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: deviceIp, port: Number(devicePort), commKey: Number(deviceCommKey) }),
      });
      const data = await res.json();
      if (data.success) {
        setPingStatus("success");
        setPingMessage(data.message || "Kết nối thành công tới máy chấm công LAN!");
      } else {
        setPingStatus("error");
        setPingMessage(data.message || "Không thể kết nối (Timeout).");
      }
    } catch (err: any) {
      setPingStatus("error");
      setPingMessage("Không thể gửi yêu cầu tới Backend: " + err.message);
    }
  };

  // Device sync
  const handleSyncDevice = async () => {
    setIsSyncing(true);
    setPingStatus("idle");
    setPingMessage("");
    setSyncFeedback(null);
    try {
      const res = await fetch("http://localhost:5002/api/attendance/device/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: deviceIp, port: Number(devicePort), commKey: Number(deviceCommKey) }),
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback(data.message);
        showToast(data.message);
        await loadAllData();
      } else {
        setSyncFeedback(data.message);
      }
    } catch (err: any) {
      setSyncFeedback("Lỗi khi đồng bộ: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  // Mock / Seed sync simulation (useful when testing without physical hardware)
  const handleSeedData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("http://localhost:5002/api/attendance/seed", { method: "POST" });
      if (res.ok) {
        showToast("Đã đồng bộ lại dữ liệu chấm công Tháng 9/2026 thành công!");
        await loadAllData();
        setIsDeviceModalOpen(false);
      }
    } catch (e) {
      alert("Lỗi khi nạp dữ liệu mẫu!");
    } finally {
      setIsSyncing(false);
    }
  };

  // Excel File Parsing & Preview
  const handleExcelFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: "binary" });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rows: any[] = XLSX.utils.sheet_to_json(ws, { header: 1 });

        if (rows.length > 1) {
          // Take header and first 10 rows for preview
          setExcelPreview(rows.slice(0, 8));
        }
      } catch (err) {
        console.error("Error previewing Excel:", err);
      }
    };
    reader.readAsBinaryString(file);
  };

  // Submit Excel Import
  const handleImportExcel = async () => {
    if (!excelFile) return;
    setIsImporting(true);
    setImportResult(null);

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      const res = await fetch("http://localhost:5002/api/attendance/import-excel", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setImportResult(data);
      if (data.inserted !== undefined) {
        showToast(
          `Nhập thành công ${data.total} dòng (${data.inserted} mới, ${data.skipped} trùng lặp đã bỏ qua)!`
        );
        await loadAllData();
      }
    } catch (err: any) {
      alert("Lỗi khi nhập file Excel: " + err.message);
    } finally {
      setIsImporting(false);
    }
  };

  // Export Detail or Monthly Excel
  const handleExportExcel = () => {
    if (activeTab === "monthly" && monthlySummary?.data) {
      const exportRows = monthlySummary.data.map((item: any) => ({
        "STT": item.stt,
        "Mã Nhân Viên": item.userId,
        "Họ và Tên": item.name,
        "Ban / Phòng": item.department,
        "Công Đi Làm": item.congDiLam,
        "Công Tác": item.congTac,
        "Công Phép": item.congPhep,
        "Tổng Công": item.tongCong,
        "Chuẩn Tháng": item.chuanThang,
        "Thiếu Phút": item.missingMinutes,
        "Làm Thêm Phút": item.overtimeMinutes,
        "Ghi Chú": item.ghiChu,
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `TongHopCong_${selectedMonth}`);
      XLSX.writeFile(wb, `Bang_Tong_Hop_Cong_${selectedMonth}.xlsx`);
      showToast("Đã xuất file Bảng Tổng Hợp Công Tháng thành công!");
    } else {
      const exportRows = filteredDailyData.map((d: any, idx: number) => ({
        "STT": idx + 1,
        "Mã Nhân Viên": d.userId,
        "Họ và Tên": d.name,
        "Ban / Phòng": d.department,
        "Ngày": d.date,
        "Thứ": d.weekday,
        "Giờ Vào": d.firstIn || "--:--",
        "Giờ Ra": d.lastOut || "--:--",
        "Giờ Làm": formatWorkTime(d),
        "Thiếu Phút": d.missingMinutes,
        "Làm Thêm (p)": d.overtimeMinutes,
        "Trạng Thái": getStatusText(d.status),
        "Công Ngày": d.workCredit,
        "Ghi Chú": d.note,
      }));

      const ws = XLSX.utils.json_to_sheet(exportRows);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `ChiTiet_${selectedMonth}`);
      XLSX.writeFile(wb, `Bang_Chi_Tiet_Cham_Cong_${selectedMonth}.xlsx`);
      showToast("Đã xuất file Báo Cáo Chi Tiết Chấm Công thành công!");
    }
  };

  // Filter daily data by search query and ensure no future dates beyond latest available data
  const filteredDailyData = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const currentMonthStr = `${yyyy}-${mm}`;

    return dailyData.filter((item) => {
      // Chỉ hiện dữ liệu tới ngày hiện muộn nhất được kéo về (không hiện ngày tương lai)
      if (item.date && selectedMonth === currentMonthStr && item.date > todayStr) {
        return false;
      }
      const matchesSearch =
        searchQuery === "" ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date?.includes(searchQuery);
      return matchesSearch;
    });
  }, [dailyData, searchQuery, selectedMonth]);

  // Helper tính thứ trong tuần nếu dữ liệu chưa có
  const getWeekdayLabel = (dateStr: string, fallback?: string): string => {
    if (fallback && fallback.trim() !== "") return fallback;
    if (!dateStr) return "";
    try {
      const [y, m, d] = dateStr.split("-").map(Number);
      const dateObj = new Date(y, m - 1, d);
      const dow = dateObj.getDay();
      const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
      return weekdays[dow] || "";
    } catch {
      return "";
    }
  };

  // Helper định dạng giờ làm: "8h 15p" thay vì số thập phân "8.25h" hoặc "8,25 h"
  const formatWorkTime = (row: any): string => {
    if (row.workTimeText && row.workTimeText !== "0h") return row.workTimeText;
    // Nếu có firstIn và lastOut hợp lệ
    if (row.firstIn && row.lastOut && (row.punchCount === undefined || row.punchCount >= 2)) {
      try {
        const parseSec = (t: string) => {
          const parts = String(t).split(":").map(Number);
          return (parts[0] || 0) * 3600 + (parts[1] || 0) * 60 + (parts[2] || 0);
        };
        const inSec = parseSec(row.firstIn);
        const outSec = parseSec(row.lastOut);
        if (outSec > inSec) {
          const spanSec = outSec - inSec;
          const lunchSec = spanSec > 3600 ? 3600 : 0;
          const workSec = Math.max(0, spanSec - lunchSec);
          if (workSec > 0) {
            const h = Math.floor(workSec / 3600);
            const m = Math.floor((workSec % 3600) / 60);
            return `${h}h ${String(m).padStart(2, "0")}p`;
          }
        }
      } catch {
        // fallback to workHours
      }
    }
    // Dựa vào workHours số nếu có (ví dụ 8.25 -> 8h 15p)
    if (row.workHours !== undefined && row.workHours !== null && Number(row.workHours) > 0) {
      const num = Number(row.workHours);
      const h = Math.floor(num);
      const m = Math.round((num - h) * 60);
      return `${h}h ${String(m).padStart(2, "0")}p`;
    }
    return "0h";
  };

  // Status Helpers matching CHAMCONG_WEB_SPECIFICATION.md
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "DU_CONG":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Đủ công (1.0)
          </span>
        );
      case "THIEU_PHUT":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Thiếu phút (0.0)
          </span>
        );
      case "THIEU_GIO_RA":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Quên quẹt ra (0.0)
          </span>
        );
      case "THIEU_GIO_VAO":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
            Quên quẹt vào (0.0)
          </span>
        );
      case "MISS":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            Vắng mặt (0.0)
          </span>
        );
      case "CUOI_TUAN":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Nghỉ cuối tuần
          </span>
        );
      case "NGHI_LE":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Nghỉ Lễ / Cty
          </span>
        );
      case "NGHI_PHEP":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
            Nghỉ phép (P - 1.0)
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs text-slate-500 bg-slate-100">
            {status}
          </span>
        );
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DU_CONG":
        return "Đủ công (1.0)";
      case "THIEU_PHUT":
        return "Thiếu phút (0.0)";
      case "THIEU_GIO_RA":
        return "Quên quẹt ra";
      case "THIEU_GIO_VAO":
        return "Quên quẹt vào";
      case "MISS":
        return "Vắng mặt";
      case "CUOI_TUAN":
        return "Nghỉ cuối tuần";
      case "NGHI_LE":
        return "Nghỉ lễ";
      case "NGHI_PHEP":
        return "Nghỉ phép (P - 1.0)";
      default:
        return status;
    }
  };

  // Summary counts
  const totalStandardDays = monthlySummary?.standardDays || 21;
  const totalPunchRecords = rawTotal || 126;
  const totalDuCong = dailyData.filter((d) => d.status === "DU_CONG").length;
  const totalThieuPhut = dailyData.filter(
    (d) => d.status === "THIEU_PHUT" || d.status === "THIEU_GIO_RA" || d.status === "THIEU_GIO_VAO"
  ).length;

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* TOAST ALERT */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 text-white shadow-xl backdrop-blur-sm border border-slate-700 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#1b365d]" />
            Quản trị chấm công
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Bảng chấm công và quản lý dữ liệu quẹt thẻ nhân sự
          </p>
        </div>

        {/* TOP ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer"
            >
              <option value="2026-09">Tháng 09/2026</option>
              <option value="2026-08">Tháng 08/2026</option>
              <option value="2026-10">Tháng 10/2026</option>
            </select>
          </div>

          {/* Action 1: Kéo máy chấm công */}
          <button
            onClick={() => setIsDeviceModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Server className="w-4 h-4 text-blue-200" />
            <span>Kéo dữ liệu máy chấm công</span>
          </button>

          {/* Action 2: Nhập Excel */}
          <button
            onClick={() => setIsExcelModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Upload className="w-4 h-4" />
            <span>Nhập file Excel</span>
          </button>

          {/* Action 3: Xuất Excel */}
          <button
            onClick={handleExportExcel}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/90 shadow-2xs transition-all"
            title="Xuất bảng tính Excel theo tab hiện tại"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Excel</span>
          </button>

          {/* Action 4: Reset */}
          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-xl bg-white hover:bg-rose-50 text-rose-600 border border-rose-200/80 shadow-2xs transition-all"
            title="Xóa toàn bộ dữ liệu để kiểm thử dữ liệu thực tế"
          >
            <Trash2 className="w-4 h-4 text-rose-500" />
            <span>Reset dữ liệu</span>
          </button>
        </div>
      </div>

      {/* TOP 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Chuẩn công tháng</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-[#1b365d]">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-[#1b365d] font-mono">
                {totalStandardDays}
              </span>
              <span className="text-sm font-medium text-slate-500">ngày</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Trừ 8 ngày nghỉ T7/CN & 1 ngày Lễ</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Lượt đủ công (1.0)</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-emerald-600 font-mono">
                {totalDuCong}
              </span>
              <span className="text-sm font-medium text-slate-500">lượt</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Đạt đủ 8h làm việc theo ca</p>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-amber-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Thiếu phút / Quên quẹt</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-amber-600 font-mono">
                {totalThieuPhut}
              </span>
              <span className="text-sm font-medium text-slate-500">lượt</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Đi muộn sau 9h hoặc về sớm</p>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-purple-200/90 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-600">Lượt chấm công máy</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-extrabold text-purple-700 font-mono">
                {totalPunchRecords}
              </span>
              <span className="text-sm font-medium text-slate-500">bản ghi</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">Đã lọc trùng lặp tuyệt đối</p>
          </div>
        </div>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex items-center justify-between border-b border-slate-200 bg-white px-3 pt-2 rounded-2xl border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("daily")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "daily"
                ? "border-[#1b365d] text-[#1b365d] bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>1. Bảng chấm công chi tiết</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono font-bold text-slate-600">
              {dailyData.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "monthly"
                ? "border-[#1b365d] text-[#1b365d] bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>2. Bảng tổng hợp công tháng</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono font-bold text-slate-600">
              {monthlySummary?.data?.length || 0}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("raw")}
            className={`flex items-center gap-2 px-5 py-3 text-xs font-bold border-b-2 transition-all ${
              activeTab === "raw"
                ? "border-[#1b365d] text-[#1b365d] bg-blue-50/50 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Server className="w-4 h-4" />
            <span>3. Nhật ký chấm công máy</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-mono font-bold text-slate-600">
              {rawTotal}
            </span>
          </button>
        </div>

        {/* Refresh button */}
        <button
          onClick={loadAllData}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-xs text-slate-600 hover:text-slate-900 font-semibold"
          title="Tải lại dữ liệu"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#1b365d]" : ""}`} />
          <span>Làm mới</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: BẢNG CHẤM CÔNG CHI TIẾT */}
      {/* ========================================================================= */}
      {activeTab === "daily" && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
            <div className="flex flex-wrap items-center gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Tìm tên, mã nhân viên..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] w-52 sm:w-64 text-slate-800"
                />
              </div>

              {/* Department Filter */}
              <select
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
                className="text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-medium text-slate-700"
              >
                <option value="ALL">Tất cả Ban / Phòng</option>
                {departments.map((d: any) => (
                  <option key={d._id || d.id || d.name} value={d.name}>
                    {d.name}
                  </option>
                ))}
              </select>

              {/* Employee Filter */}
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-medium text-slate-700"
              >
                <option value="ALL">Tất cả Nhân sự</option>
                {employees.map((emp) => (
                  <option key={emp.code || emp.id} value={emp.code || emp.id}>
                    {emp.code || emp.id} - {emp.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500 font-medium">
              Hiển thị <b className="text-slate-900">{filteredDailyData.length}</b> bản ghi
            </div>
          </div>

          {/* Daily Table */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold tracking-wider text-xs">
                  <tr className="divide-x divide-slate-200">
                    <th className="py-3.5 px-4 min-w-[200px]">Nhân sự</th>
                    <th className="py-3.5 px-4 min-w-[140px]">Ngày & Thứ</th>
                    <th className="py-3.5 px-3 text-center min-w-[90px]">Giờ vào</th>
                    <th className="py-3.5 px-3 text-center min-w-[90px]">Giờ ra</th>
                    <th className="py-3.5 px-3 text-center min-w-[95px]">Giờ làm</th>
                    <th className="py-3.5 px-3 text-center min-w-[90px]">Thiếu phút</th>
                    <th className="py-3.5 px-3 text-center min-w-[80px]">Công</th>
                    <th className="py-3.5 px-3 text-center min-w-[120px]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredDailyData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Chưa có dữ liệu chấm công cho bộ lọc này. Hãy bấm <b>"Kéo dữ liệu máy chấm công"</b> hoặc <b>"Nhập file Excel"</b>.
                      </td>
                    </tr>
                  ) : (
                    filteredDailyData.map((row: any, idx: number) => {
                      const isWeekend = row.status === "CUOI_TUAN";
                      const isHoliday = row.status === "NGHI_LE";
                      const isLeave = row.status === "NGHI_PHEP";

                      // Hôm nào thiếu công thì cho vàng nhạt lên 2 ô giờ vào, ra
                      const isThieuCong =
                        !isWeekend &&
                        !isHoliday &&
                        !isLeave &&
                        (row.workCredit < 1.0 ||
                          row.missingMinutes > 0 ||
                          row.status === "THIEU_PHUT" ||
                          row.status === "THIEU_GIO_RA" ||
                          row.status === "THIEU_GIO_VAO" ||
                          row.status === "MISS" ||
                          !row.firstIn ||
                          !row.lastOut);

                      const weekdayText = getWeekdayLabel(row.date, row.weekday);

                      return (
                        <tr
                          key={idx}
                          className={`transition-colors divide-x divide-slate-200 ${
                            isWeekend
                              ? "bg-slate-50/50 hover:bg-slate-100/50 text-slate-500"
                              : "hover:bg-slate-50/80"
                          }`}
                        >
                          {/* 1. Nhân sự */}
                          <td className="py-3.5 px-4 min-w-[200px]">
                            <div>
                              <p className={`font-bold text-sm leading-snug ${isWeekend ? "text-slate-700" : "text-slate-900"}`}>
                                {row.name}
                              </p>
                              <p className="text-xs text-slate-500 font-medium mt-0.5">{row.userId}</p>
                            </div>
                          </td>

                          {/* 2. Ngày & Thứ */}
                          <td className="py-3.5 px-4 min-w-[140px]">
                            <span className="font-semibold text-slate-800 text-[13px]">{row.date}</span>
                            {weekdayText && (
                              <span className={`text-xs font-medium ml-1.5 ${isWeekend ? "text-slate-500" : "text-slate-400"}`}>
                                ({weekdayText})
                              </span>
                            )}
                          </td>

                          {/* 3. Giờ vào */}
                          <td className="py-3.5 px-3 text-center">
                            {row.firstIn ? (
                              <span
                                className={`inline-block px-3 py-1 rounded-lg font-mono font-normal text-[13.5px] transition-colors ${
                                  isThieuCong
                                    ? "bg-[#fef3c7] text-[#92400e] border border-amber-200/80"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {row.firstIn}
                              </span>
                            ) : isThieuCong ? (
                              <span className="inline-block px-3 py-1 rounded-lg bg-[#fef3c7] text-[#b45309] border border-amber-200/80 font-mono font-normal text-[13.5px]">
                                --:--:--
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono font-normal text-[13.5px]">--:--:--</span>
                            )}
                          </td>

                          {/* 4. Giờ ra */}
                          <td className="py-3.5 px-3 text-center">
                            {row.lastOut ? (
                              <span
                                className={`inline-block px-3 py-1 rounded-lg font-mono font-normal text-[13.5px] transition-colors ${
                                  isThieuCong
                                    ? "bg-[#fef3c7] text-[#92400e] border border-amber-200/80"
                                    : "bg-slate-100 text-slate-700"
                                }`}
                              >
                                {row.lastOut}
                              </span>
                            ) : isThieuCong ? (
                              <span className="inline-block px-3 py-1 rounded-lg bg-[#fef3c7] text-[#b45309] border border-amber-200/80 font-mono font-normal text-[13.5px]">
                                --:--:--
                              </span>
                            ) : (
                              <span className="text-slate-300 font-mono font-normal text-[13.5px]">--:--:--</span>
                            )}
                          </td>

                          {/* 5. Giờ làm */}
                          <td className="py-3.5 px-3 text-center font-mono font-normal whitespace-nowrap text-[13.5px] text-slate-700">
                            {isWeekend ? (
                              <span className="text-slate-400 font-normal">-</span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-normal">
                                {formatWorkTime(row)}
                              </span>
                            )}
                          </td>

                          {/* 6. Thiếu phút */}
                          <td className="py-3.5 px-3 text-center font-mono font-normal text-[13.5px]">
                            {isWeekend ? (
                              <span className="text-slate-400 font-normal">-</span>
                            ) : row.missingMinutes > 0 ? (
                              <span className="text-amber-600 font-normal">-{row.missingMinutes}p</span>
                            ) : (
                              <span className="text-emerald-600 font-normal">0p</span>
                            )}
                          </td>

                          {/* 7. Công */}
                          <td className="py-3.5 px-3 text-center font-mono font-normal text-[13.5px]">
                            {isWeekend ? (
                              <span className="text-slate-400 font-normal">-</span>
                            ) : (
                              <span
                                className={
                                  row.workCredit > 0 ? "text-emerald-600 font-normal" : "text-slate-400 font-normal"
                                }
                              >
                                {row.workCredit !== undefined && row.workCredit !== null
                                  ? Number(row.workCredit).toFixed(1)
                                  : "0.0"}
                              </span>
                            )}
                          </td>

                          {/* 8. Ghi chú */}
                          <td
                            className="py-3.5 px-3 text-xs text-slate-600 max-w-[150px] truncate text-center font-normal"
                            title={row.note || "--"}
                          >
                            {isWeekend ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200/80">
                                Nghỉ cuối tuần
                              </span>
                            ) : isHoliday ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                                {row.note || "Nghỉ lễ"}
                              </span>
                            ) : isLeave ? (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {row.note || "Nghỉ phép"}
                              </span>
                            ) : (
                              row.note || "--"
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: BẢNG TỔNG HỢP CÔNG THÁNG */}
      {/* ========================================================================= */}
      {activeTab === "monthly" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-[#1b365d]" />
                  Bảng tổng hợp công Tháng {selectedMonth}
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Chuẩn công tháng: <b className="text-slate-800">{totalStandardDays} ngày</b>. Tổng công = Đi làm + Công tác + Phép.
                </p>
              </div>

              <button
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <Download className="w-4 h-4" />
                <span>Xuất Bảng Lương (.xlsx)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold tracking-wider text-xs">
                  <tr className="divide-x divide-slate-200">
                    <th className="py-3.5 px-3 text-center">STT</th>
                    <th className="py-3.5 px-4">Mã NV</th>
                    <th className="py-3.5 px-3 text-center">Mã CC</th>
                    <th className="py-3.5 px-4 min-w-[200px]">Họ và tên</th>
                    <th className="py-3.5 px-4">Ban / Phòng</th>
                    <th className="py-3.5 px-3 text-center bg-emerald-50/50 text-emerald-800">
                      Công đi làm
                    </th>
                    <th className="py-3.5 px-3 text-center">Công tác</th>
                    <th className="py-3.5 px-3 text-center">Công phép</th>
                    <th className="py-3.5 px-3 text-center bg-blue-50/60 text-[#1b365d]">
                      Tổng công
                    </th>
                    <th className="py-3.5 px-3 text-center">Chuẩn tháng</th>
                    <th className="py-3.5 px-3 text-center">Tỷ lệ đạt</th>
                    <th className="py-3.5 px-3 text-center min-w-[100px]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {!monthlySummary?.data || monthlySummary.data.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="py-12 text-center text-slate-500">
                        Chưa có dữ liệu tổng hợp cho tháng này.
                      </td>
                    </tr>
                  ) : (
                    monthlySummary.data.map((row: any) => {
                      const rate = Math.round((row.tongCong / totalStandardDays) * 100);
                      return (
                        <tr key={row.userId} className="hover:bg-slate-50/80 transition-colors divide-x divide-slate-200">
                          <td className="py-4 px-3 text-center font-bold text-slate-400">
                            {row.stt}
                          </td>
                          <td className="py-4 px-4 font-mono font-bold text-slate-800 text-xs">
                            {row.userId}
                          </td>
                          <td className="py-4 px-3 text-center font-mono font-bold text-[#1b365d]">
                            <span className="px-2 py-1 rounded-lg bg-blue-50 text-[#1b365d] border border-blue-200 text-xs">
                              {row.attendanceCode || "--"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-bold text-slate-900 text-sm">{row.name}</td>
                          <td className="py-4 px-4 text-slate-700 font-medium">{row.department}</td>
                          <td className="py-4 px-3 text-center font-bold font-mono text-emerald-700 bg-emerald-50/30 text-sm">
                            {row.congDiLam.toFixed(1)}
                          </td>
                          <td className="py-4 px-3 text-center font-mono text-slate-600 font-medium">
                            {row.congTac || 0}
                          </td>
                          <td className="py-4 px-3 text-center font-mono text-slate-600 font-medium">
                            {row.congPhep || 0}
                          </td>
                          <td className="py-4 px-3 text-center font-mono font-black text-[#1b365d] bg-blue-50/40 text-base">
                            {row.tongCong.toFixed(1)}
                          </td>
                          <td className="py-4 px-3 text-center font-mono text-slate-600 font-bold">
                            {row.chuanThang}
                          </td>
                          <td className="py-4 px-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                                rate >= 90
                                  ? "bg-emerald-100 text-emerald-800"
                                  : rate >= 60
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {rate}%
                            </span>
                          </td>
                          <td className="py-4 px-3 text-xs text-slate-500 max-w-[120px] truncate text-center font-medium" title={row.ghiChu || "--"}>
                            {row.ghiChu || "--"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: NHẬT KÝ CHẤM CÔNG MÁY (MACHINE LOGS) */}
      {/* ========================================================================= */}
      {activeTab === "raw" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-[#1b365d]" />
                  Nhật ký chấm công máy
                </h3>
              </div>

              <div className="text-xs text-slate-500 font-medium">
                Tổng cộng: <b className="text-[#1b365d] text-sm">{rawTotal}</b> bản ghi
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs border border-slate-200">
                <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold tracking-wider text-xs">
                  <tr className="divide-x divide-slate-200">
                    <th className="py-3.5 px-3 text-center">STT</th>
                    <th className="py-3.5 px-4">Mã NV</th>
                    <th className="py-3.5 px-3 text-center">Mã CC</th>
                    <th className="py-3.5 px-4 min-w-[190px]">Họ và tên</th>
                    <th className="py-3.5 px-4">Thời điểm chấm công</th>
                    <th className="py-3.5 px-3 text-center">Loại xác thực</th>
                    <th className="py-3.5 px-3 text-center">Nguồn dữ liệu</th>
                    <th className="py-3.5 px-4">IP Thiết bị</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {rawLogs.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-slate-500">
                        Chưa có bản ghi nhật ký chấm công nào.
                      </td>
                    </tr>
                  ) : (
                    rawLogs.map((log: any, idx: number) => {
                      const punchType =
                        log.punch === 1
                          ? "Khuôn mặt"
                          : log.punch === 2
                          ? "Thẻ từ"
                          : log.punch === 15
                          ? "Mật mã"
                          : "Vân tay";
                      const isUnmapped =
                        !log.userId ||
                        log.userId === "" ||
                        log.userId === "Chưa gán" ||
                        log.userId === log.attendanceCode ||
                        log.name === "Chưa gán" ||
                        log.name?.startsWith("Mã CC") ||
                        log.name?.startsWith("NV ");

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors divide-x divide-slate-200">
                          <td className="py-3.5 px-3 text-center text-slate-400 font-mono font-bold">
                            {(rawPage - 1) * 50 + idx + 1}
                          </td>
                          <td className="py-3.5 px-4">
                            {isUnmapped ? (
                              <span className="text-slate-400 italic text-xs font-normal">
                                Chưa gán
                              </span>
                            ) : (
                              <span className="font-mono font-bold text-slate-800 text-xs">
                                {log.userId}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-3 text-center font-mono font-bold text-[#1b365d]">
                            <span className="px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200 text-xs">
                              {log.attendanceCode || "--"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 min-w-[190px]">
                            {isUnmapped ? (
                              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                                Chưa gán
                              </span>
                            ) : (
                              <span className="font-bold text-slate-900 text-sm">
                                {log.name}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#1b365d] text-xs">
                            {log.timestamp}
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                              {punchType}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-center">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                                log.source === "device"
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {log.source === "device" ? "Máy chấm công" : "File Excel"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-600 text-xs font-medium">
                            {log.deviceIp || "LAN 192.168.1.201"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Simple Pagination */}
            {rawTotal > 50 && (
              <div className="p-3 px-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                <span className="text-xs text-slate-500">
                  Trang {rawPage} / {Math.ceil(rawTotal / 50)}
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setRawPage((p) => Math.max(1, p - 1))}
                    disabled={rawPage === 1}
                    className="p-1 rounded border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRawPage((p) => p + 1)}
                    disabled={rawPage * 50 >= rawTotal}
                    className="p-1 rounded border border-slate-200 disabled:opacity-40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: KẾT NỐI & ĐỒNG BỘ MÁY CHẤM CÔNG LAN (PORT 4370) */}
      {/* ========================================================================= */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-[#1b365d] text-white">
              <div className="flex items-center gap-2.5">
                <Server className="w-5 h-5 text-blue-300" />
                <div>
                  <h3 className="text-base font-bold">Kéo Dữ Liệu Máy Chấm Công</h3>
                  <p className="text-xs text-blue-200/80">Kết nối máy chấm công qua mạng LAN</p>
                </div>
              </div>
              <button
                onClick={() => setIsDeviceModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* IP / Port Form */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Địa chỉ IP Máy
                  </label>
                  <input
                    type="text"
                    value={deviceIp}
                    onChange={(e) => setDeviceIp(e.target.value)}
                    placeholder="192.168.1.201"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d] font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cổng (Port)
                  </label>
                  <input
                    type="number"
                    value={devicePort}
                    onChange={(e) => setDevicePort(Number(e.target.value))}
                    placeholder="4370"
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mật Mã Kết Nối (Comm Key)
                </label>
                <input
                  type="number"
                  value={deviceCommKey}
                  onChange={(e) => setDeviceCommKey(Number(e.target.value))}
                  placeholder="123456"
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#1b365d] font-mono"
                />
              </div>

              {/* Ping Feedback */}
              {pingStatus !== "idle" && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                    pingStatus === "testing"
                      ? "bg-slate-100 text-slate-700"
                      : pingStatus === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  <Wifi className={`w-4 h-4 ${pingStatus === "testing" ? "animate-pulse" : ""}`} />
                  <span>{pingMessage}</span>
                </div>
              )}

              {/* Sync Feedback */}
              {syncFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs font-medium ${
                    syncFeedback.includes("thành công")
                      ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                      : "bg-rose-50 text-rose-900 border-rose-200"
                  }`}
                >
                  {syncFeedback}
                </div>
              )}

              {/* Actions */}
              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={pingStatus === "testing"}
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Kiểm Tra Kết Nối
                </button>

                <button
                  type="button"
                  onClick={handleSyncDevice}
                  disabled={isSyncing}
                  className="flex-1 px-4 py-2.5 text-xs font-bold rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
                  <span>{isSyncing ? "Đang kéo..." : "Bắt Đầu Đồng Bộ"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: NHẬP FILE EXCEL VỚI SMART MULTI-FORMAT DATETIME PARSER */}
      {/* ========================================================================= */}
      {isExcelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-800 to-teal-900 text-white">
              <div className="flex items-center gap-2.5">
                <FileSpreadsheet className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="text-base font-bold">Nhập Dữ Liệu Chấm Công Từ Excel</h3>
                  <p className="text-xs text-emerald-200/80">Tải lên file Excel xuất từ máy chấm công (.xlsx, .xls)</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsExcelModalOpen(false);
                  setExcelFile(null);
                  setExcelPreview([]);
                  setImportResult(null);
                }}
                className="p-1 rounded-lg text-emerald-300 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">

              {/* Upload Input */}
              <div className="border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
                <input
                  type="file"
                  id="excel-upload-input"
                  accept=".xlsx, .xls"
                  onChange={handleExcelFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="excel-upload-input"
                  className="cursor-pointer flex flex-col items-center justify-center gap-2"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-bold text-sm text-slate-800">
                      {excelFile ? excelFile.name : "Nhấn để chọn file Excel hoặc kéo thả vào đây"}
                    </span>
                    <p className="text-xs text-slate-400 mt-0.5">Hỗ trợ định dạng .xlsx, .xls xuất từ phần mềm chấm công</p>
                  </div>
                </label>
              </div>

              {/* Live Preview Table */}
              {excelPreview.length > 0 && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-emerald-600" />
                    Xem trước các dòng đầu trong file:
                  </span>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-[11px]">
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {excelPreview.map((row: any, rIdx: number) => (
                          <tr key={rIdx} className={rIdx === 0 ? "bg-slate-100 font-bold" : "hover:bg-slate-50"}>
                            {row.slice(0, 5).map((col: any, cIdx: number) => (
                              <td key={cIdx} className="py-1.5 px-3 whitespace-nowrap">
                                {String(col || "")}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Result Summary */}
              {importResult && (
                <div className="p-3.5 rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 text-xs space-y-1">
                  <p className="font-bold">Kết quả xử lý:</p>
                  <p>
                    Tổng số dòng đọc được: <b>{importResult.total}</b> | Thêm mới:{" "}
                    <b className="text-emerald-700">{importResult.inserted}</b> | Bỏ qua do trùng lặp:{" "}
                    <b className="text-slate-600">{importResult.skipped}</b>
                  </p>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsExcelModalOpen(false);
                    setExcelFile(null);
                    setExcelPreview([]);
                  }}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Đóng
                </button>

                <button
                  type="button"
                  onClick={handleImportExcel}
                  disabled={!excelFile || isImporting}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white shadow-sm transition-all flex items-center gap-1.5"
                >
                  <Upload className={`w-3.5 h-3.5 ${isImporting ? "animate-spin" : ""}`} />
                  <span>{isImporting ? "Đang nạp dữ liệu..." : "Nạp Dữ Liệu Vào Hệ Thống"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
