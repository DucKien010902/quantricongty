"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Clock,
  CheckCircle2,
  FileSpreadsheet,
  Server,
  RefreshCw,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Employee } from "@/app/data/seed-employees";
import { usePermission } from "@/app/hooks/usePermission";

import AttendanceHeader from "./AttendanceHeader";
import AttendanceStatsCards from "./AttendanceStatsCards";
import AttendanceDailyTable from "./AttendanceDailyTable";
import AttendanceMonthlyTable from "./AttendanceMonthlyTable";
import AttendanceRawLogsTable from "./AttendanceRawLogsTable";
import DeviceSyncModal from "./DeviceSyncModal";
import ExcelImportModal from "./ExcelImportModal";

interface AttendanceViewProps {
  employees: Employee[];
  departments?: any[];
  currentUser?: any;
}

export default function AttendanceView({
  employees,
  departments = [],
  currentUser,
}: AttendanceViewProps) {
  // Quyền từ Ma trận phân quyền hệ thống (RBAC)
  const { can } = usePermission();
  const canViewAll = can("attendance.view_all");
  const canManage = can("attendance.manage");
  const canExport = can("attendance.export");

  // Phạm vi xem: Toàn công ty (Admin, HCNS) hoặc Cá nhân (Nhân viên)
  const isHRAdmin = canViewAll;

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

  const myCode = currentEmployee?.code || currentUser?.code || "";
  const myAttendanceCode = currentEmployee?.attendanceCode || currentUser?.attendanceCode || "";

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

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Load Data on tab or month change
  useEffect(() => {
    loadAllData();
  }, [selectedMonth, filterDept, filterUser, rawPage, isHRAdmin, myCode]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const queryUser = isHRAdmin ? filterUser : myCode || "NONE";
      const queryDept = isHRAdmin ? filterDept : "ALL";

      // 1. Daily data
      const dailyRes = await fetch(
        `http://localhost:5002/api/attendance/daily?month=${selectedMonth}&userId=${queryUser}&department=${queryDept}`
      );
      if (dailyRes.ok) {
        setDailyData(await dailyRes.json());
      }

      // 2. Monthly summary
      const monthlyRes = await fetch(
        `http://localhost:5002/api/attendance/monthly-summary?month=${selectedMonth}&userId=${queryUser}&department=${queryDept}`
      );
      if (monthlyRes.ok) {
        setMonthlySummary(await monthlyRes.json());
      }

      // 3. Raw logs
      const rawRes = await fetch(
        `http://localhost:5002/api/attendance/raw-logs?month=${selectedMonth}&userId=${queryUser}&page=${rawPage}&limit=50`
      );
      if (rawRes.ok) {
        const data = await rawRes.json();
        setRawLogs(data.logs || []);
        setRawTotal(data.total || 0);
      }
    } catch (e) {
      console.warn("Backend attendance endpoint not reachable, keeping local state:", e);
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all data (Reset to zero)
  const handleClearAll = async () => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn XÓA SẠCH toàn bộ dữ liệu chấm công (kể cả dữ liệu mẫu) để kiểm thử dữ liệu thực tế không?"
      )
    )
      return;
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

  // Mock / Seed sync simulation
  const handleSeedData = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("http://localhost:5002/api/attendance/seed", { method: "POST" });
      if (res.ok) {
        showToast("Đã đồng bộ lại dữ liệu chấm công Tháng 9/2026 thành công!");
        await loadAllData();
        setIsDeviceModalOpen(false);
      }
    } catch {
      alert("Lỗi khi nạp dữ liệu mẫu!");
    } finally {
      setIsSyncing(false);
    }
  };

  // Export Detail or Monthly Excel
  const handleExportExcel = () => {
    if (activeTab === "monthly" && (isHRAdmin ? monthlySummary?.data : displayMonthlyData)) {
      const source = isHRAdmin ? monthlySummary.data : displayMonthlyData;
      const exportRows = source.map((item: any) => ({
        STT: item.stt,
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
      const sheetName = isHRAdmin ? `TongHopCong_${selectedMonth}` : `Cong_${myCode}_${selectedMonth}`;
      const fileName = isHRAdmin
        ? `Bang_Tong_Hop_Cong_${selectedMonth}.xlsx`
        : `Bang_Cong_Ca_Nhan_${myCode}_${selectedMonth}.xlsx`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
      showToast("Đã xuất file Bảng Tổng Hợp Công Tháng thành công!");
    } else {
      const exportRows = filteredDailyData.map((d: any, idx: number) => ({
        STT: idx + 1,
        "Mã Nhân Viên": d.userId,
        "Họ và Tên": d.name,
        "Ban / Phòng": d.department,
        Ngày: d.date,
        Thứ: d.weekday,
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
      const sheetName = isHRAdmin ? `ChiTiet_${selectedMonth}` : `ChiTiet_${myCode}_${selectedMonth}`;
      const fileName = isHRAdmin
        ? `Bang_Chi_Tiet_Cham_Cong_${selectedMonth}.xlsx`
        : `Bang_Chi_Tiet_Cham_Cong_Ca_Nhan_${myCode}_${selectedMonth}.xlsx`;
      XLSX.utils.book_append_sheet(wb, ws, sheetName);
      XLSX.writeFile(wb, fileName);
      showToast("Đã xuất file Báo Cáo Chi Tiết Chấm Công thành công!");
    }
  };

  // Filter daily data by search query and enforce personal filter for non-HR
  const filteredDailyData = useMemo(() => {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const currentMonthStr = `${yyyy}-${mm}`;

    return dailyData.filter((item) => {
      if (item.date && selectedMonth === currentMonthStr && item.date > todayStr) {
        return false;
      }
      if (!isHRAdmin) {
        const isMine =
          (item.userId && item.userId === myCode) ||
          (item.attendanceCode && item.attendanceCode === myAttendanceCode) ||
          (currentEmployee?.name && item.name === currentEmployee.name);
        if (!isMine) return false;
      }
      return (
        searchQuery === "" ||
        item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.userId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.date?.includes(searchQuery)
      );
    });
  }, [dailyData, searchQuery, selectedMonth, isHRAdmin, myCode, myAttendanceCode, currentEmployee]);

  // Display Monthly summary data (filtered to self if non-HR)
  const displayMonthlyData = useMemo(() => {
    if (!monthlySummary?.data) return [];
    if (!isHRAdmin) {
      return monthlySummary.data.filter(
        (row: any) =>
          row.userId === myCode ||
          row.attendanceCode === myAttendanceCode ||
          (currentEmployee?.name && row.name === currentEmployee.name)
      );
    }
    return monthlySummary.data;
  }, [monthlySummary, isHRAdmin, myCode, myAttendanceCode, currentEmployee]);

  // Display Raw Logs data (filtered to self if non-HR)
  const displayRawLogs = useMemo(() => {
    if (!isHRAdmin) {
      return rawLogs.filter(
        (l: any) =>
          l.userId === myCode ||
          l.attendanceCode === myAttendanceCode ||
          (currentEmployee?.name && l.name === currentEmployee.name)
      );
    }
    return rawLogs;
  }, [rawLogs, isHRAdmin, myCode, myAttendanceCode, currentEmployee]);

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

  const formatWorkTime = (row: any): string => {
    if (row.workTimeText && row.workTimeText !== "0h") return row.workTimeText;
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
        // fallback
      }
    }
    if (row.workHours !== undefined && row.workHours !== null && Number(row.workHours) > 0) {
      const num = Number(row.workHours);
      const h = Math.floor(num);
      const m = Math.round((num - h) * 60);
      return `${h}h ${String(m).padStart(2, "0")}p`;
    }
    return "0h";
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "DU_CONG":
        return "Đủ công (1.0)";
      case "CONG_TAC":
        return "Đi công tác (CT)";
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
        return "Nghỉ phép (P)";
      default:
        return status;
    }
  };

  // Summary counts
  const totalStandardDays = monthlySummary?.standardDays || 0;
  const statsSource = isHRAdmin ? dailyData : filteredDailyData;
  const totalDuCong = statsSource.filter((d) => d.status === "DU_CONG").length;
  const totalThieuPhut = statsSource.filter(
    (d) => d.status === "THIEU_PHUT" || d.status === "THIEU_GIO_RA" || d.status === "THIEU_GIO_VAO"
  ).length;
  const totalPunchRecords = isHRAdmin ? rawTotal || 0 : displayRawLogs.length;

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
      <AttendanceHeader
        isHRAdmin={isHRAdmin}
        canManage={canManage}
        canExport={canExport}
        canViewAll={canViewAll}
        currentEmployee={currentEmployee}
        currentUser={currentUser}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
        onOpenDeviceModal={() => setIsDeviceModalOpen(true)}
        onOpenExcelModal={() => setIsExcelModalOpen(true)}
        onExportExcel={handleExportExcel}
        onClearAll={handleClearAll}
      />

      {/* TOP 4 STATS CARDS */}
      <AttendanceStatsCards
        totalStandardDays={totalStandardDays}
        weekendDays={monthlySummary?.weekendDays || 8}
        holidayDays={monthlySummary?.holidayDays || 0}
        totalDuCong={totalDuCong}
        totalThieuPhut={totalThieuPhut}
        totalPunchRecords={totalPunchRecords}
      />

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
              {filteredDailyData.length}
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
              {displayMonthlyData.length}
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
              {isHRAdmin ? rawTotal : displayRawLogs.length}
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

      {/* TAB CONTENT */}
      {activeTab === "daily" && (
        <AttendanceDailyTable
          filteredDailyData={filteredDailyData}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterDept={filterDept}
          onFilterDeptChange={setFilterDept}
          filterUser={filterUser}
          onFilterUserChange={setFilterUser}
          isHRAdmin={isHRAdmin}
          departments={departments}
          employees={employees}
          currentEmployee={currentEmployee}
          currentUser={currentUser}
          myCode={myCode}
          myAttendanceCode={myAttendanceCode}
          formatWorkTime={formatWorkTime}
          getWeekdayLabel={getWeekdayLabel}
        />
      )}

      {activeTab === "monthly" && (
        <AttendanceMonthlyTable
          displayMonthlyData={displayMonthlyData}
          selectedMonth={selectedMonth}
          totalStandardDays={totalStandardDays}
          onExportExcel={handleExportExcel}
        />
      )}

      {activeTab === "raw" && (
        <AttendanceRawLogsTable
          displayRawLogs={displayRawLogs}
          rawTotal={rawTotal}
          rawPage={rawPage}
          onPageChange={setRawPage}
          isHRAdmin={isHRAdmin}
        />
      )}

      {/* DEVICE SYNC MODAL */}
      <DeviceSyncModal
        isOpen={isDeviceModalOpen}
        onClose={() => setIsDeviceModalOpen(false)}
        deviceIp={deviceIp}
        setDeviceIp={setDeviceIp}
        devicePort={devicePort}
        setDevicePort={setDevicePort}
        deviceCommKey={deviceCommKey}
        setDeviceCommKey={setDeviceCommKey}
        pingStatus={pingStatus}
        pingMessage={pingMessage}
        isSyncing={isSyncing}
        syncFeedback={syncFeedback}
        onTestConnection={handleTestConnection}
        onSyncDevice={handleSyncDevice}
        onSeedData={handleSeedData}
      />

      {/* EXCEL IMPORT MODAL */}
      <ExcelImportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        onSuccess={() => {
          showToast("Nhập dữ liệu từ Excel thành công!");
          loadAllData();
        }}
        onDownloadTemplate={() => {
          window.open("http://localhost:5002/api/attendance/export-template", "_blank");
          showToast("Đang tải file mẫu chấm công...");
        }}
      />
    </div>
  );
}
