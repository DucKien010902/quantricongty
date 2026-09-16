"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Server,
  Clock,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Cpu,
  Wifi,
  KeyRound,
  FileSpreadsheet,
  Trash2,
  Users,
  Plus,
  Lock,
  UserCheck,
  Award,
  ArrowRight,
  Shield,
  Check,
  X,
  Calendar,
  CalendarDays,
  CalendarOff,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { POSITION_LEVELS, ROLE_GROUPS } from "@/app/data/seed-employees";
import {
  getStoredPermissionMatrix,
  saveStoredPermissionMatrix,
  PermissionGroup,
} from "@/app/utils/permissions";

export default function SettingsPage() {
  const { company, employees, showToast, loadData } = useApp();

  const [activeTab, setActiveTab] = useState<"roles" | "shifts" | "device" | "company" | "security">("roles");

  // ==================== CƠ CẤU CHỨC DANH ====================
  const [positions, setPositions] = useState(POSITION_LEVELS);
  const [isAddingPos, setIsAddingPos] = useState(false);
  const [newPosName, setNewPosName] = useState("");
  const [newPosDesc, setNewPosDesc] = useState("");
  const [newPosRole, setNewPosRole] = useState<"ADMIN" | "LEADER" | "USER">("USER");

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosName.trim()) return;
    const newPos = {
      id: `pos-${Date.now()}`,
      name: newPosName.trim(),
      description: newPosDesc.trim() || "Chức danh phân công tác nghiệp",
      defaultRole: newPosRole,
    };
    setPositions([...positions, newPos]);
    setNewPosName("");
    setNewPosDesc("");
    setIsAddingPos(false);
    showToast(`Đã thêm chức danh "${newPos.name}" vào danh mục cài đặt!`);
  };

  const handleDeletePosition = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa chức danh "${name}" khỏi danh mục?`)) {
      setPositions(positions.filter((p) => p.id !== id));
      showToast(`Đã xóa chức danh "${name}".`);
    }
  };

  // ==================== MA TRẬN PHÂN QUYỀN ====================
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);

  useEffect(() => {
    setPermissions(getStoredPermissionMatrix());
  }, []);

  const togglePermission = (
    groupIndex: number,
    itemIndex: number,
    roleKey: "admin" | "leader" | "employee" | "hr"
  ) => {
    const updated = [...permissions];
    const currentVal = updated[groupIndex].items[itemIndex][roleKey];
    updated[groupIndex].items[itemIndex][roleKey] = !currentVal;
    setPermissions(updated);
  };

  const handleSavePermissions = () => {
    saveStoredPermissionMatrix(permissions);
    showToast("Đã lưu ma trận phân quyền hệ thống thành công!");
  };

  // ==================== DEVICE SETTINGS ====================
  const [deviceIp, setDeviceIp] = useState("192.168.1.201");
  const [devicePort, setDevicePort] = useState(4370);
  const [deviceCommKey, setDeviceCommKey] = useState(123456);
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [pingMessage, setPingMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // ==================== SHIFTS & DAYS OFF SETTINGS ====================
  const [shiftStart, setShiftStart] = useState("08:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [lunchBreakHours, setLunchBreakHours] = useState(1.0);
  const [workRequiredHours, setWorkRequiredHours] = useState(8.0);
  const [maxLateFlexMinutes, setMaxLateFlexMinutes] = useState(60);
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [minHoursFullDay, setMinHoursFullDay] = useState(8);
  const [minHoursHalfDay, setMinHoursHalfDay] = useState(4);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([6, 0]); // 6=Thứ Bảy, 0=Chủ Nhật
  const [holidays, setHolidays] = useState<any[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayType, setNewHolidayType] = useState("le_tet");
  const [isSavingShift, setIsSavingShift] = useState(false);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);

  // ==================== COMPANY SETTINGS ====================
  const [companyName, setCompanyName] = useState(company?.name || "Công ty Cổ phần Đầu tư Đông Hải");
  const [shortName, setShortName] = useState(company?.shortName || "Đông Hải Invest");
  const [taxId, setTaxId] = useState(company?.taxId || "0108998877");
  const [address, setAddress] = useState(company?.address || "Tòa nhà Đông Hải, Số 18 Phố Nguyễn Du, Hà Nội");
  const [phone, setPhone] = useState(company?.phone || "024 3974 8888");
  const [email, setEmail] = useState(company?.email || "contact@donghaiinvest.vn");

  // Fetch shifts config from backend
  const fetchAttendanceConfig = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/attendance/config");
      if (res.ok) {
        const data = await res.json();
        if (data.shiftTimeIn) setShiftStart(data.shiftTimeIn);
        if (data.shiftTimeOut) setShiftEnd(data.shiftTimeOut);
        if (data.lunchTimeStart) setLunchStart(data.lunchTimeStart);
        if (data.lunchTimeEnd) setLunchEnd(data.lunchTimeEnd);
        if (data.lunchBreakHours !== undefined) setLunchBreakHours(data.lunchBreakHours);
        if (data.workRequiredHours !== undefined) setWorkRequiredHours(data.workRequiredHours);
        if (data.maxLateFlexMinutes !== undefined) setMaxLateFlexMinutes(data.maxLateFlexMinutes);
        if (data.graceMinutes !== undefined) setGraceMinutes(data.graceMinutes);
        if (data.minHoursFullDay !== undefined) setMinHoursFullDay(data.minHoursFullDay);
        if (data.minHoursHalfDay !== undefined) setMinHoursHalfDay(data.minHoursHalfDay);
        if (data.weeklyOffDays !== undefined && data.weeklyOffDays !== null) {
          const parsed = String(data.weeklyOffDays)
            .split(",")
            .map((s: string) => parseInt(s.trim(), 10))
            .filter((n: number) => !isNaN(n));
          setWeeklyOffDays(parsed);
        }
      }
    } catch (e) {
      console.error("Error fetching attendance config:", e);
    }
  };

  // Fetch holidays from backend
  const fetchHolidays = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/attendance/holidays");
      if (res.ok) {
        const data = await res.json();
        setHolidays(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Error fetching holidays:", e);
    }
  };

  useEffect(() => {
    fetchAttendanceConfig();
    fetchHolidays();
  }, []);

  // Toggle weekly off day
  const handleToggleWeeklyOff = (dayNum: number) => {
    if (weeklyOffDays.includes(dayNum)) {
      setWeeklyOffDays(weeklyOffDays.filter((d) => d !== dayNum));
    } else {
      setWeeklyOffDays([...weeklyOffDays, dayNum]);
    }
  };

  // Save Shifts & Weekly Off Days
  const handleSaveShifts = async () => {
    setIsSavingShift(true);
    try {
      const res = await fetch("http://localhost:5002/api/attendance/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shiftTimeIn: shiftStart,
          shiftTimeOut: shiftEnd,
          lunchTimeStart: lunchStart,
          lunchTimeEnd: lunchEnd,
          lunchBreakHours: Number(lunchBreakHours),
          workRequiredHours: Number(workRequiredHours),
          maxLateFlexMinutes: Number(maxLateFlexMinutes),
          graceMinutes: Number(graceMinutes),
          minHoursFullDay: Number(minHoursFullDay),
          minHoursHalfDay: Number(minHoursHalfDay),
          weeklyOffDays: weeklyOffDays.join(","),
        }),
      });
      if (res.ok) {
        showToast("Đã lưu quy định ca làm việc & hệ thống đã tự động tính toán lại bảng chấm công!");
      } else {
        showToast("Lỗi khi lưu cấu hình!");
      }
    } catch (e: any) {
      showToast("Không thể kết nối máy chủ: " + e.message);
    } finally {
      setIsSavingShift(false);
    }
  };

  // Add individual holiday
  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHolidayDate || !newHolidayName.trim()) {
      showToast("Vui lòng chọn ngày và nhập tên ngày nghỉ!");
      return;
    }
    setIsAddingHoliday(true);
    try {
      const res = await fetch("http://localhost:5002/api/attendance/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newHolidayDate,
          name: newHolidayName.trim(),
          type: newHolidayType,
          isPaid: true,
        }),
      });
      if (res.ok) {
        showToast(`Đã thêm ngày nghỉ "${newHolidayName.trim()}" (${newHolidayDate})!`);
        setNewHolidayDate("");
        setNewHolidayName("");
        fetchHolidays();
      } else {
        showToast("Lỗi khi thêm ngày nghỉ!");
      }
    } catch (e: any) {
      showToast("Lỗi: " + e.message);
    } finally {
      setIsAddingHoliday(false);
    }
  };

  // Delete individual holiday
  const handleDeleteHoliday = async (id: string, name: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa ngày nghỉ "${name}" khỏi danh mục?`)) return;
    try {
      const res = await fetch(`http://localhost:5002/api/attendance/holidays/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Đã xóa ngày nghỉ "${name}"!`);
        fetchHolidays();
      } else {
        showToast("Lỗi khi xóa ngày nghỉ!");
      }
    } catch (e: any) {
      showToast("Lỗi: " + e.message);
    }
  };

  // Test connection to Attendance Machine
  const handleTestConnection = async () => {
    setPingStatus("testing");
    setPingMessage("Đang mở kết nối TCP Socket 4370 tới thiết bị...");
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

  // Sync attendance logs
  const handleSyncDevice = async () => {
    setIsSyncing(true);
    setPingStatus("idle");
    setPingMessage("");
    try {
      const res = await fetch("http://localhost:5002/api/attendance/device/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: deviceIp, port: Number(devicePort), commKey: Number(deviceCommKey) }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Lỗi khi đồng bộ: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveCompany = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          shortName,
          taxId,
          address,
          phone,
          email,
        }),
      });
      if (res.ok) {
        showToast("Đã cập nhật thông tin doanh nghiệp!");
        loadData();
      }
    } catch {
      showToast("Lỗi khi cập nhật công ty!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#1b365d]" />
            Cài Đặt Hệ Thống & Quản Trị
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Quản lý cơ cấu chức danh, ma trận phân quyền, quy định ca làm việc và máy chấm công
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "roles"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Chức Danh & Phân Quyền</span>
        </button>

        <button
          onClick={() => setActiveTab("shifts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "shifts"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Quy Định Ca & Ngày Nghỉ</span>
        </button>

        <button
          onClick={() => setActiveTab("device")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "device"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Máy Chấm Công & Thiết Bị</span>
        </button>

        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "company"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Thông Tin Doanh Nghiệp</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "security"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Bảo Mật & Xác Thực</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB MỚI: CƠ CẤU CHỨC DANH & MA TRẬN PHÂN QUYỀN */}
      {/* ========================================================= */}
      {activeTab === "roles" && (
        <div className="space-y-8">
          {/* KHỐI 1: DANH MỤC CẤP BẬC CHỨC DANH */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1b365d]" />
                  Danh Mục Cấp Bậc Chức Danh
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Các chức danh chuẩn được dùng khi thêm hoặc phân công nhân sự. Bạn có thể tự do bổ sung thêm chức danh mới khi cần.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPos(!isAddingPos)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm chức danh</span>
              </button>
            </div>

            {/* Form thêm chức danh mới nếu bật */}
            {isAddingPos && (
              <form onSubmit={handleAddPosition} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Thêm cấp bậc chức danh mới vào hệ thống</span>
                  <button type="button" onClick={() => setIsAddingPos(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tên chức danh (*)</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Phó Ban, Trợ Lý HĐQT..."
                      value={newPosName}
                      onChange={(e) => setNewPosName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mô tả nhiệm vụ</label>
                    <input
                      type="text"
                      placeholder="VD: Hỗ trợ điều hành phòng ban..."
                      value={newPosDesc}
                      onChange={(e) => setNewPosDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nhóm quyền gợi ý</label>
                    <select
                      value={newPosRole}
                      onChange={(e) => setNewPosRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                    >
                      <option value="USER">Nhân viên (User)</option>
                      <option value="LEADER">Trưởng ban (Leader)</option>
                      <option value="ADMIN">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPos(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#1b365d] text-white font-semibold hover:bg-[#152a4a]"
                  >
                    Lưu chức danh
                  </button>
                </div>
              </form>
            )}

            {/* Grid các thẻ chức danh */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {positions.map((pos) => (
                <div key={pos.id} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-[#1b365d]/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        {pos.name === "Ban Quản Trị" && "👑"}
                        {pos.name === "Trưởng Ban" && "👔"}
                        {pos.name === "Nhân Viên" && "💼"}
                        {pos.name}
                      </h3>
                      {pos.id !== "board" && pos.id !== "leader" && pos.id !== "staff" && (
                        <button
                          onClick={() => handleDeletePosition(pos.id, pos.name)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Xóa chức danh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{pos.description}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Quyền gợi ý:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md ${
                        pos.defaultRole === "ADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : pos.defaultRole === "LEADER"
                          ? "bg-blue-50 text-[#1b365d] border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {pos.defaultRole}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KHỐI 2: MA TRẬN PHÂN QUYỀN HỆ THỐNG */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Ma Trận Phân Quyền Chi Tiết (Role & Module Permission Matrix)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thiết lập các quyền con theo từng Module cho 4 nhóm: Admin, Trưởng ban, Nhân viên và Phòng HCNS
                </p>
              </div>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu cấu hình quyền</span>
              </button>
            </div>

            {/* Bảng ma trận */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Quyền hạn hệ thống & Chức năng</th>
                    <th className="py-3 px-3 text-center w-24">
                      <span className="inline-block px-2 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[11px]">
                        Admin
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center w-24">
                      <span className="inline-block px-2 py-1 rounded-md bg-blue-50 text-[#1b365d] border border-blue-200 font-bold text-[11px]">
                        Trưởng ban
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center w-24">
                      <span className="inline-block px-2 py-1 rounded-md bg-slate-200/80 text-slate-700 border border-slate-300 font-bold text-[11px]">
                        Nhân viên
                      </span>
                    </th>
                    <th className="py-3 px-3 text-center w-24">
                      <span className="inline-block px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                        Phòng HCNS
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissions.map((grp, gIdx) => (
                    <React.Fragment key={gIdx}>
                      {/* Tiêu đề nhóm Module */}
                      <tr className="bg-slate-100/60">
                        <td colSpan={5} className="py-2.5 px-4 font-bold text-slate-800 bg-slate-100/80">
                          📁 Phân hệ: {grp.module}
                        </td>
                      </tr>
                      {grp.items.map((item, iIdx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{item.label}</div>
                            {item.note && <div className="text-[11px] text-slate-400 mt-0.5">{item.note}</div>}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(item.admin)}
                              onChange={() => togglePermission(gIdx, iIdx, "admin")}
                              className="w-4 h-4 text-[#1b365d] rounded-md focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(item.leader)}
                              onChange={() => togglePermission(gIdx, iIdx, "leader")}
                              className="w-4 h-4 text-[#1b365d] rounded-md focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(item.employee)}
                              onChange={() => togglePermission(gIdx, iIdx, "employee")}
                              className="w-4 h-4 text-[#1b365d] rounded-md focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <input
                              type="checkbox"
                              checked={Boolean(item.hr)}
                              onChange={() => togglePermission(gIdx, iIdx, "hr")}
                              className="w-4 h-4 text-[#1b365d] rounded-md focus:ring-0 cursor-pointer"
                            />
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* KHỐI 3: DANH SÁCH TÀI KHOẢN THỰC TẾ HIỆN TẠI */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Danh Sách Tài Khoản & Phân Quyền Đang Hoạt Động
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Các tài khoản được cấu hình chuẩn trong hệ thống theo chỉ đạo quản trị
                </p>
              </div>
              <a
                href="/employees"
                className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1"
              >
                <span>Quản lý tại trang Nhân sự</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div
                  key={(emp as any)._id || emp.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-[#1b365d]/40 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || "/avatar-kien.png"}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{emp.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{emp.position || "Cán bộ"}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ban / Khối:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">{emp.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Quyền hệ thống:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        (emp as any).role === "ADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : (emp as any).role === "HCNS"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : (emp as any).role === "LEADER"
                          ? "bg-blue-50 text-[#1b365d] border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {(emp as any).role === "ADMIN"
                        ? "Admin (Quản trị)"
                        : (emp as any).role === "HCNS"
                        ? "HCNS (Nhân sự)"
                        : (emp as any).role === "LEADER"
                        ? "Leader (Trưởng ban)"
                        : "User (Nhân viên)"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MÁY CHẤM CÔNG & THIẾT BỊ */}
      {/* ========================================================= */}
      {activeTab === "device" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#1b365d]" />
                Cấu Hình Kết Nối Máy Chấm Công (ZKTeco / Ronand Jack TCP/IP)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết lập địa chỉ IP mạng nội bộ và mật mã kết nối để hệ thống tự động đồng bộ dữ liệu quẹt thẻ
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Giao thức TCP Port 4370
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                Địa chỉ IP Máy Chấm Công
              </label>
              <input
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="192.168.1.201"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cổng kết nối TCP Port
              </label>
              <input
                type="number"
                value={devicePort}
                onChange={(e) => setDevicePort(Number(e.target.value))}
                placeholder="4370"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Mật mã máy (CommKey)
              </label>
              <input
                type="number"
                value={deviceCommKey}
                onChange={(e) => setDeviceCommKey(Number(e.target.value))}
                placeholder="123456"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Feedback message */}
          {pingStatus !== "idle" && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                pingStatus === "testing"
                  ? "bg-blue-50/70 border-blue-200 text-blue-800"
                  : pingStatus === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {pingStatus === "testing" && <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-600 mt-0.5" />}
              {pingStatus === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {pingStatus === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div className="flex-1 font-medium">{pingMessage}</div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={pingStatus === "testing"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <Wifi className="w-3.5 h-3.5 text-slate-500" />
              <span>Kiểm tra kết nối (Test Ping)</span>
            </button>

            <button
              type="button"
              onClick={handleSyncDevice}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-md shadow-[#1b365d]/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu quẹt thẻ ngay"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: QUY ĐỊNH CA LÀM VIỆC & NGÀY NGHỈ */}
      {/* ========================================================= */}
      {activeTab === "shifts" && (
        <div className="space-y-6">
          {/* KHỐI 1: QUY ĐỊNH KHUNG GIỜ CA LÀM VIỆC & TIÊU CHUẨN GIỜ CÔNG (ĐƯA LÊN ĐẦU TIÊN) */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#1b365d]" />
                  1. Quy Định Khung Giờ Ca Làm Việc & Tiêu Chuẩn Giờ Công
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thiết lập khung giờ vào/ra ca hành chính, thời lượng nghỉ trưa, giới hạn cho phép đến muộn bù giờ và số giờ tính công chuẩn
                </p>
              </div>

              {/* Tóm tắt nhanh quy định đang áp dụng */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50 text-[#1b365d] border border-blue-200/80 text-xs font-bold font-mono">
                  Ca: {shiftStart} - {shiftEnd} ({workRequiredHours}h làm việc)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-50 text-purple-700 border border-purple-200/80 text-xs font-bold font-mono">
                  Nghỉ trưa: {lunchStart} - {lunchEnd} ({lunchBreakHours}h)
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-bold font-mono">
                  Muộn tối đa: {maxLateFlexMinutes}p
                </span>
              </div>
            </div>

            {/* Hàng 1: Khung giờ vào / ra & Nghỉ trưa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bắt đầu ca sáng (Giờ vào ca)
                </label>
                <input
                  type="time"
                  value={shiftStart}
                  onChange={(e) => setShiftStart(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Mặc định: 08:00 sáng.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kết thúc ca chiều (Giờ về ca)
                </label>
                <input
                  type="time"
                  value={shiftEnd}
                  onChange={(e) => setShiftEnd(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Mặc định: 17:00 (5h chiều về).</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Bắt đầu nghỉ trưa
                </label>
                <input
                  type="time"
                  value={lunchStart}
                  onChange={(e) => setLunchStart(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Mặc định: 12:00 trưa.</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Kết thúc nghỉ trưa
                </label>
                <input
                  type="time"
                  value={lunchEnd}
                  onChange={(e) => setLunchEnd(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Mặc định: 13:00 (nghỉ đúng 1h).</span>
              </div>
            </div>

            {/* Hàng 2: Thời lượng nghỉ trưa & Số giờ làm việc & Muộn nhất 60p */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Thời lượng nghỉ trưa (Tiếng)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={lunchBreakHours}
                  onChange={(e) => setLunchBreakHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mặc định: 1.0 tiếng (không tính vào giờ làm việc).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số giờ làm việc tiêu chuẩn (Tiếng)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={workRequiredHours}
                  onChange={(e) => setWorkRequiredHours(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mặc định: 8.0 tiếng (từ 8h đến 17h trừ 1h nghỉ trưa).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Thời gian muộn tối đa được bù giờ (Phút)
                </label>
                <input
                  type="number"
                  step="5"
                  value={maxLateFlexMinutes}
                  onChange={(e) => setMaxLateFlexMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mặc định: 60 phút (vào muộn nhất 09:00, ở lại bù đủ 8h vẫn được 1 công).
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Miễn phạt đi muộn (Grace minutes)
                </label>
                <input
                  type="number"
                  step="1"
                  value={graceMinutes}
                  onChange={(e) => setGraceMinutes(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Mặc định: 15 phút (vào trước 08:15 không tính đi muộn).
                </span>
              </div>
            </div>

            {/* Hàng 3: Tiêu chuẩn tính 1.0 công và 0.5 công */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số giờ làm việc để tính 1.0 công (Tiếng)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={minHoursFullDay}
                  onChange={(e) => setMinHoursFullDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Làm đủ từ 8 tiếng trở lên = 1.0 công đầy đủ.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Số giờ làm việc để tính 0.5 công (Tiếng)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={minHoursHalfDay}
                  onChange={(e) => setMinHoursHalfDay(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold font-mono"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Làm từ 4 đến dưới 8 tiếng = tính 0.5 công (nửa ngày).
                </span>
              </div>
            </div>

            {/* Nút lưu cấu hình ca làm việc */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-100 bg-slate-50/50 p-4 rounded-xl">
              <div className="text-xs text-slate-500">
                ⚡ <b>Tự động đồng bộ:</b> Khi bấm lưu, hệ thống sẽ lưu cấu hình vào máy chủ và <b>tự động tính toán lại toàn bộ bảng chấm công chi tiết & tổng hợp</b> theo quy định mới.
              </div>
              <button
                type="button"
                onClick={handleSaveShifts}
                disabled={isSavingShift}
                className="flex items-center justify-center gap-1.5 px-6 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold shadow-md shadow-[#1b365d]/20 transition-all disabled:opacity-50 shrink-0"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingShift ? "Đang tính toán lại bảng công..." : "Lưu quy định ca & Áp dụng ngay"}</span>
              </button>
            </div>
          </div>

          {/* KHỐI 2: CÀI ĐẶT NGÀY NGHỈ MẶC ĐỊNH TRONG TUẦN */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <CalendarOff className="w-4 h-4 text-[#1b365d]" />
                  2. Cài Đặt Ngày Nghỉ Mặc Định Trong Tuần
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Chọn các ngày nghỉ cố định hàng tuần (Thứ 7, Chủ Nhật hoặc cả hai tùy chọn). Nhân viên không đi làm vào các ngày này sẽ không bị trừ công hay tính vắng mặt.
                </p>
              </div>

              {/* Nút chọn nhanh (Presets) */}
              <div className="flex flex-wrap items-center gap-1.5 self-start sm:self-auto">
                <span className="text-[11px] font-semibold text-slate-400 mr-1">Chọn nhanh:</span>
                <button
                  type="button"
                  onClick={() => setWeeklyOffDays([6, 0])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    weeklyOffDays.includes(6) && weeklyOffDays.includes(0) && weeklyOffDays.length === 2
                      ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  Nghỉ T7 & CN (Chuẩn)
                </button>
                <button
                  type="button"
                  onClick={() => setWeeklyOffDays([0])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    weeklyOffDays.includes(0) && weeklyOffDays.length === 1
                      ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  Chỉ nghỉ CN
                </button>
                <button
                  type="button"
                  onClick={() => setWeeklyOffDays([6])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    weeklyOffDays.includes(6) && weeklyOffDays.length === 1
                      ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  Chỉ nghỉ T7
                </button>
                <button
                  type="button"
                  onClick={() => setWeeklyOffDays([])}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all border ${
                    weeklyOffDays.length === 0
                      ? "bg-[#1b365d] text-white border-[#1b365d] shadow-2xs"
                      : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                  }`}
                >
                  Làm cả tuần
                </button>
              </div>
            </div>

            {/* Lưới 7 ngày trong tuần */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
              {[
                { id: 1, label: "Thứ Hai", short: "T2" },
                { id: 2, label: "Thứ Ba", short: "T3" },
                { id: 3, label: "Thứ Tư", short: "T4" },
                { id: 4, label: "Thứ Năm", short: "T5" },
                { id: 5, label: "Thứ Sáu", short: "T6" },
                { id: 6, label: "Thứ Bảy", short: "T7" },
                { id: 0, label: "Chủ Nhật", short: "CN" },
              ].map((day) => {
                const isOff = weeklyOffDays.includes(day.id);
                return (
                  <div
                    key={day.id}
                    onClick={() => handleToggleWeeklyOff(day.id)}
                    className={`cursor-pointer rounded-2xl p-3.5 border transition-all flex flex-col justify-between select-none ${
                      isOff
                        ? "bg-blue-50/70 border-[#1b365d] ring-1 ring-[#1b365d]/40 shadow-xs"
                        : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold font-mono ${
                          isOff
                            ? "bg-[#1b365d] text-white"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {day.short}
                      </span>
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-all ${
                          isOff
                            ? "bg-[#1b365d] border-[#1b365d] text-white"
                            : "border-slate-300 bg-white"
                        }`}
                      >
                        {isOff && <Check className="w-3 h-3" />}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-xs">{day.label}</h4>
                      <p className="text-[11px] mt-0.5">
                        {isOff ? (
                          <span className="font-semibold text-[#1b365d]">Ngày nghỉ</span>
                        ) : (
                          <span className="text-slate-400">Ngày làm</span>
                        )}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* KHỐI 3: CÀI ĐẶT CÁC NGÀY NGHỈ RIÊNG LẺ / LỄ TẾT */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="border-b border-slate-100 pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-[#1b365d]" />
                    3. Cài Đặt Ngày Nghỉ Riêng Lẻ & Dịp Lễ Tết
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Thêm các ngày nghỉ Lễ Quốc Gia (2/9, 30/4, Tết...) hoặc ngày nghỉ sự kiện doanh nghiệp (Du lịch, teambuilding) được hưởng nguyên lương
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {holidays.length} ngày đã thiết lập
                </span>
              </div>
            </div>

            {/* Form thêm ngày nghỉ mới */}
            <form
              onSubmit={handleAddHoliday}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80 space-y-3 text-xs"
            >
              <div className="font-bold text-slate-800 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-[#1b365d]" />
                <span>Thêm ngày nghỉ riêng lẻ / Ngày Lễ mới</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Chọn ngày nghỉ (*)
                  </label>
                  <input
                    type="date"
                    required
                    value={newHolidayDate}
                    onChange={(e) => setNewHolidayDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tên dịp nghỉ / Sự kiện (*)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nghỉ Lễ Quốc Khánh 2/9, Du lịch công ty, Nghỉ Tết..."
                    value={newHolidayName}
                    onChange={(e) => setNewHolidayName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                  />
                </div>

                <div>
                  <button
                    type="submit"
                    disabled={isAddingHoliday}
                    className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-semibold shadow-xs transition-all disabled:opacity-50"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{isAddingHoliday ? "Đang thêm..." : "Thêm ngày nghỉ"}</span>
                  </button>
                </div>
              </div>
            </form>

            {/* Danh sách các ngày nghỉ riêng lẻ đã thiết lập */}
            <div className="rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3 px-3 text-center w-12">STT</th>
                    <th className="py-3 px-4 w-36">Ngày nghỉ</th>
                    <th className="py-3 px-3 w-28">Thứ</th>
                    <th className="py-3 px-4">Tên dịp nghỉ</th>
                    <th className="py-3 px-3 text-center w-36">Chế độ</th>
                    <th className="py-3 px-3 text-center w-20">Xóa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {holidays.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        Chưa có ngày nghỉ riêng lẻ nào được tạo. Hãy chọn ngày ở trên để thêm.
                      </td>
                    </tr>
                  ) : (
                    holidays.map((h: any, idx: number) => {
                      const d = new Date(h.date);
                      const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
                      const weekdayName = weekdays[d.getDay()] || "--";
                      return (
                        <tr key={h._id || idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 text-center font-mono text-slate-400 font-bold">
                            {idx + 1}
                          </td>
                          <td className="py-3 px-4 font-mono font-bold text-slate-800">
                            {h.date}
                          </td>
                          <td className="py-3 px-3 text-slate-600 font-medium">
                            {weekdayName}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {h.name}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Hưởng nguyên lương
                            </span>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <button
                              type="button"
                              onClick={() => handleDeleteHoliday(h._id, h.name)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Xóa ngày nghỉ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
        </div>
      )}


      {/* ========================================================= */}
      {/* TAB 4: THÔNG TIN DOANH NGHIỆP */}
      {/* ========================================================= */}
      {activeTab === "company" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#1b365d]" />
              Hồ Sơ & Thông Tin Doanh Nghiệp
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cập nhật tên giao dịch, mã số thuế, địa chỉ trụ sở và thông tin pháp nhân
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên công ty đầy đủ
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên viết tắt / Thương hiệu
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold text-[#1b365d]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã số thuế doanh nghiệp
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Địa chỉ trụ sở chính
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveCompany}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-md shadow-[#1b365d]/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Cập nhật thông tin công ty</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BẢO MẬT & XÁC THỰC */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Chính Sách Bảo Mật & Xác Thực Tài Khoản
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình chính sách bảo vệ dữ liệu và phương thức đăng nhập an toàn
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-800">Xác thực mã OTP gửi qua Email</p>
                <p className="text-[11px] text-slate-400">Đăng nhập không cần nhớ mật khẩu thông qua mã OTP 6 số</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang bật
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-800">Mã hóa kết nối ZKTeco CommKey</p>
                <p className="text-[11px] text-slate-400">Bảo mật giao thức socket máy chấm công với mã băm 123456</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Chuẩn ZK TCP
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
