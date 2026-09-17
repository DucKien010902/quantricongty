"use client";

import React, { useState, useEffect } from "react";
import {
  Clock,
  CalendarOff,
  CalendarDays,
  Plus,
  Trash2,
  Check,
  Save,
} from "lucide-react";

interface HolidayItem {
  _id?: string;
  date: string;
  name: string;
  type?: string;
  isPaid?: boolean;
}

interface ShiftsTabProps {
  showToast: (msg: string) => void;
}

export default function ShiftsTab({ showToast }: ShiftsTabProps) {
  // Working shifts state
  const [shiftStart, setShiftStart] = useState("08:00");
  const [shiftEnd, setShiftEnd] = useState("17:00");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:00");
  const [lunchBreakHours, setLunchBreakHours] = useState(1.0);
  const [workRequiredHours, setWorkRequiredHours] = useState(8.0);
  const [maxLateFlexMinutes, setMaxLateFlexMinutes] = useState(60);
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [minHoursFullDay, setMinHoursFullDay] = useState(8.0);
  const [minHoursHalfDay, setMinHoursHalfDay] = useState(4.0);
  const [weeklyOffDays, setWeeklyOffDays] = useState<number[]>([6, 0]); // 6 = T7, 0 = CN

  // Holidays state
  const [holidays, setHolidays] = useState<HolidayItem[]>([]);
  const [newHolidayDate, setNewHolidayDate] = useState("");
  const [newHolidayName, setNewHolidayName] = useState("");
  const [newHolidayType, setNewHolidayType] = useState("le_tet");
  const [isSavingShift, setIsSavingShift] = useState(false);
  const [isAddingHoliday, setIsAddingHoliday] = useState(false);

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
        showToast("Đã lưu quy định ca làm việc!");
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
        showToast(`Đã thêm ngày nghỉ "${newHolidayName.trim()}"!`);
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

  return (
    <div className="space-y-5">
      {/* KHỐI 1: QUY ĐỊNH KHUNG GIỜ CA LÀM VIỆC */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#1b365d]" />
            1. Khung Giờ Ca & Tiêu Chuẩn Công
          </h2>

          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-[#1b365d] border border-blue-200/60 text-xs font-medium font-mono">
              Ca: {shiftStart} - {shiftEnd} ({workRequiredHours}h)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/60 text-xs font-medium font-mono">
              Trưa: {lunchStart} - {lunchEnd} ({lunchBreakHours}h)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/60 text-xs font-medium font-mono">
              Bù tối đa: {maxLateFlexMinutes}p
            </span>
          </div>
        </div>

        {/* Hàng 1: Giờ vào / ra & Nghỉ trưa */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Bắt đầu ca sáng
            </label>
            <input
              type="time"
              value={shiftStart}
              onChange={(e) => setShiftStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kết thúc ca chiều
            </label>
            <input
              type="time"
              value={shiftEnd}
              onChange={(e) => setShiftEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Bắt đầu nghỉ trưa
            </label>
            <input
              type="time"
              value={lunchStart}
              onChange={(e) => setLunchStart(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Kết thúc nghỉ trưa
            </label>
            <input
              type="time"
              value={lunchEnd}
              onChange={(e) => setLunchEnd(e.target.value)}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>
        </div>

        {/* Hàng 2: Thời lượng & linh hoạt */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nghỉ trưa (Giờ)
            </label>
            <input
              type="number"
              step="0.5"
              value={lunchBreakHours}
              onChange={(e) => setLunchBreakHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Giờ làm tiêu chuẩn
            </label>
            <input
              type="number"
              step="0.5"
              value={workRequiredHours}
              onChange={(e) => setWorkRequiredHours(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Muộn tối đa bù giờ (Phút)
            </label>
            <input
              type="number"
              step="5"
              value={maxLateFlexMinutes}
              onChange={(e) => setMaxLateFlexMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Miễn phạt muộn (Phút)
            </label>
            <input
              type="number"
              step="1"
              value={graceMinutes}
              onChange={(e) => setGraceMinutes(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>
        </div>

        {/* Hàng 3: Tiêu chuẩn 1 công / 0.5 công */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Giờ tối thiểu tính 1.0 công
            </label>
            <input
              type="number"
              step="0.5"
              value={minHoursFullDay}
              onChange={(e) => setMinHoursFullDay(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Giờ tối thiểu tính 0.5 công
            </label>
            <input
              type="number"
              step="0.5"
              value={minHoursHalfDay}
              onChange={(e) => setMinHoursHalfDay(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold font-mono"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSaveShifts}
            disabled={isSavingShift}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-medium shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingShift ? "Đang lưu..." : "Lưu quy định ca"}</span>
          </button>
        </div>
      </div>

      {/* KHỐI 2: CÀI ĐẶT NGÀY NGHỈ TRONG TUẦN */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/60 pb-3">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <CalendarOff className="w-4 h-4 text-[#1b365d]" />
            2. Ngày Nghỉ Trong Tuần
          </h2>

          {/* Presets */}
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={() => setWeeklyOffDays([6, 0])}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                weeklyOffDays.includes(6) && weeklyOffDays.includes(0) && weeklyOffDays.length === 2
                  ? "bg-[#1b365d] text-white border-[#1b365d]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              Nghỉ T7 & CN
            </button>
            <button
              type="button"
              onClick={() => setWeeklyOffDays([0])}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                weeklyOffDays.includes(0) && weeklyOffDays.length === 1
                  ? "bg-[#1b365d] text-white border-[#1b365d]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              Chỉ nghỉ CN
            </button>
            <button
              type="button"
              onClick={() => setWeeklyOffDays([6])}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                weeklyOffDays.includes(6) && weeklyOffDays.length === 1
                  ? "bg-[#1b365d] text-white border-[#1b365d]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              Chỉ nghỉ T7
            </button>
            <button
              type="button"
              onClick={() => setWeeklyOffDays([])}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all border cursor-pointer ${
                weeklyOffDays.length === 0
                  ? "bg-[#1b365d] text-white border-[#1b365d]"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              Làm cả tuần
            </button>
          </div>
        </div>

        {/* Lưới 7 ngày trong tuần */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
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
                className={`cursor-pointer rounded-xl p-3 border transition-all flex flex-col justify-between select-none ${
                  isOff
                    ? "bg-blue-50/60 border-[#1b365d] ring-1 ring-[#1b365d]/30"
                    : "bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/40"
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span
                    className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-semibold font-mono ${
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
                  <h4 className="font-semibold text-slate-800 text-xs">{day.label}</h4>
                  <p className="text-[10px] mt-0.5">
                    {isOff ? (
                      <span className="font-medium text-[#1b365d]">Nghỉ</span>
                    ) : (
                      <span className="text-slate-400">Làm</span>
                    )}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KHỐI 3: NGÀY NGHỈ RIÊNG LẺ / LỄ TẾT */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <CalendarDays className="w-4 h-4 text-[#1b365d]" />
            3. Ngày Nghỉ Lễ & Sự Kiện
          </h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
            {holidays.length} ngày
          </span>
        </div>

        {/* Form thêm ngày nghỉ mới */}
        <form
          onSubmit={handleAddHoliday}
          className="p-3.5 rounded-xl bg-slate-50/60 border border-slate-200 space-y-3 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="font-medium text-slate-700 block mb-1">
                Ngày nghỉ (*)
              </label>
              <input
                type="date"
                required
                value={newHolidayDate}
                onChange={(e) => setNewHolidayDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-medium text-slate-700 block mb-1">
                Tên dịp nghỉ (*)
              </label>
              <input
                type="text"
                required
                placeholder="VD: Nghỉ Lễ Quốc Khánh 2/9..."
                value={newHolidayName}
                onChange={(e) => setNewHolidayName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isAddingHoliday}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-medium shadow-xs transition-all disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{isAddingHoliday ? "Đang thêm..." : "Thêm"}</span>
              </button>
            </div>
          </div>
        </form>

        {/* Danh sách ngày nghỉ */}
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50/80 text-slate-600 border-b border-slate-200 font-semibold">
              <tr>
                <th className="py-2.5 px-3 text-center w-12">STT</th>
                <th className="py-2.5 px-4 w-36">Ngày</th>
                <th className="py-2.5 px-3 w-28">Thứ</th>
                <th className="py-2.5 px-4">Tên dịp nghỉ</th>
                <th className="py-2.5 px-3 text-center w-36">Chế độ</th>
                <th className="py-2.5 px-3 text-center w-16">Xóa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {holidays.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    Chưa có ngày nghỉ nào được thiết lập.
                  </td>
                </tr>
              ) : (
                holidays.map((h: HolidayItem, idx: number) => {
                  const d = new Date(h.date);
                  const weekdays = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
                  const weekdayName = weekdays[d.getDay()] || "--";
                  return (
                    <tr key={h._id || idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-3 text-center font-mono text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-2.5 px-4 font-mono font-medium text-slate-800">
                        {h.date}
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {weekdayName}
                      </td>
                      <td className="py-2.5 px-4 font-medium text-slate-800">
                        {h.name}
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Nguyên lương
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteHoliday(h._id || "", h.name)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
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
  );
}
