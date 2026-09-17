"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Users,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
  FileText,
  Building,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import Modal from "@/app/components/ui/Modal";

interface EventItem {
  id: string;
  date: string; // YYYY-MM-DD
  title: string;
  time: string;
  category: "meeting" | "holiday" | "training" | "benefit" | "trip";
  badge: string;
  location: string;
  organizer?: string;
  attendees?: string[];
  description?: string;
}

export default function CalendarPage() {
  const { showToast } = useApp();

  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(8); // 0-indexed: 8 = September
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [inspectEvent, setInspectEvent] = useState<EventItem | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<string>("2026-09-15");

  // Initial Events list
  const [events, setEvents] = useState<EventItem[]>([
    {
      id: "evt-1",
      date: "2026-09-02",
      title: "Nghỉ Lễ Quốc Khánh 2/9",
      time: "Cả ngày",
      category: "holiday",
      badge: "Nghỉ lễ",
      location: "Toàn quốc",
      organizer: "Ban Giám Đốc",
      description: "Nghỉ lễ Quốc Khánh theo quy định nhà nước. Toàn thể CBNV được hưởng 100% lương.",
    },
    {
      id: "evt-2",
      date: "2026-09-07",
      title: "Họp rà soát tiến độ dự án ERP miền Nam",
      time: "08:30 - 10:00",
      category: "meeting",
      badge: "Họp ban",
      location: "Phòng Họp 2 (Tầng 2)",
      organizer: "Ban CNTT & Chuyển đổi số",
      attendees: ["Trần Văn Khang", "Nguyễn Đức Kiên", "Lê Thị Mai"],
      description: "Đánh giá tiến độ triển khai các phân hệ nhân sự, chấm công và kho tài liệu nội bộ.",
    },
    {
      id: "evt-3",
      date: "2026-09-10",
      title: "Công tác khảo sát thị trường Chi nhánh Đà Nẵng",
      time: "10/09 - 12/09",
      category: "trip",
      badge: "Công tác",
      location: "Chi nhánh Đà Nẵng",
      organizer: "Ban Kế Hoạch Chiến Lược",
      attendees: ["Phạm Minh Tuấn", "Hoàng Văn Nam"],
      description: "Khảo sát mặt bằng mở rộng văn phòng đại diện và làm việc với các đối tác địa phương.",
    },
    {
      id: "evt-4",
      date: "2026-09-15",
      title: "Họp Giao ban HĐQT & Trưởng/Phó Ban Q4/2026",
      time: "09:00 - 11:30",
      category: "meeting",
      badge: "Giao ban",
      location: "Phòng Họp Lớn (Tầng 3)",
      organizer: "Văn phòng HĐQT",
      attendees: ["Nguyễn Văn A (Chủ tịch)", "Trần Văn Khang", "Tất cả Trưởng/Phó Ban"],
      description: "Đánh giá kết quả hoạt động kinh doanh Q3 và phê duyệt kế hoạch trọng tâm Q4/2026.",
    },
    {
      id: "evt-5",
      date: "2026-09-18",
      title: "Hội thảo: Chiến lược số hóa quản trị doanh nghiệp 2026",
      time: "14:00 - 16:30",
      category: "training",
      badge: "Đào tạo",
      location: "Phòng Trực tuyến & Hội thảo",
      organizer: "Ban Nhân Sự & Đào Tạo",
      attendees: ["Cán bộ quản lý các ban phòng"],
      description: "Chương trình nâng cao năng lực ứng dụng công nghệ trong vận hành chuỗi ứng dụng doanh nghiệp.",
    },
    {
      id: "evt-6",
      date: "2026-09-22",
      title: "Đào tạo Quy trình An toàn thông tin & Bảo mật dữ liệu",
      time: "15:00 - 17:00",
      category: "training",
      badge: "Đào tạo",
      location: "Hội trường Tầng 5 (Zoom Online)",
      organizer: "Ban CNTT",
      description: "Phổ biến các quy định về an toàn thông tin cá nhân và bảo mật dữ liệu khách hàng theo quy chế mới.",
    },
    {
      id: "evt-7",
      date: "2026-09-26",
      title: "Khám sức khỏe định kỳ năm 2026 (Đợt 1)",
      time: "07:30 - 12:00",
      category: "benefit",
      badge: "Phúc lợi",
      location: "Bệnh viện Đa khoa Quốc tế",
      organizer: "Ban HCNS & Công đoàn",
      description: "Chương trình chăm sóc sức khỏe toàn diện hàng năm dành cho CBNV đã ký HĐLD chính thức.",
    },
    {
      id: "evt-8",
      date: "2026-09-30",
      title: "Chốt công & Kê khai bảng lương Tháng 9/2026",
      time: "17:00 deadline",
      category: "meeting",
      badge: "Nội bộ",
      location: "Ban HCNS & Kế toán",
      organizer: "Ban HCNS",
      description: "Hạn chót các Trưởng Ban duyệt đơn nghỉ phép và xác nhận bảng tổng hợp chấm công tháng.",
    },
  ]);

  // Form state for Create Event Modal
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState<EventItem["category"]>("meeting");
  const [newDate, setNewDate] = useState("2026-09-15");
  const [newTime, setNewTime] = useState("09:00 - 10:30");
  const [newLocation, setNewLocation] = useState("Phòng Họp Lớn");
  const [newDescription, setNewDescription] = useState("");

  // Month navigation
  const monthNames = [
    "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
    "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  // Category styling helper
  const getCategoryTheme = (cat: EventItem["category"]) => {
    switch (cat) {
      case "holiday":
        return {
          badge: "Nghỉ lễ",
          badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
          pillClass: "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100",
          dot: "bg-rose-500",
        };
      case "meeting":
        return {
          badge: "Họp ban",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
          pillClass: "bg-blue-50 text-blue-900 border-blue-200 hover:bg-blue-100",
          dot: "bg-blue-600",
        };
      case "training":
        return {
          badge: "Đào tạo",
          badgeClass: "bg-purple-50 text-purple-800 border-purple-200",
          pillClass: "bg-purple-50 text-purple-900 border-purple-200 hover:bg-purple-100",
          dot: "bg-purple-600",
        };
      case "benefit":
        return {
          badge: "Phúc lợi",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
          pillClass: "bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100",
          dot: "bg-emerald-600",
        };
      case "trip":
        return {
          badge: "Công tác",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
          pillClass: "bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100",
          dot: "bg-amber-600",
        };
      default:
        return {
          badge: "Sự kiện",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-200",
          pillClass: "bg-slate-100 text-slate-800 border-slate-200",
          dot: "bg-slate-500",
        };
    }
  };

  // Filtered Events
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (selectedCategory !== "all" && e.category !== selectedCategory) return false;
      return true;
    });
  }, [events, selectedCategory]);

  // Calendar Grid calculation for current Month & Year
  const calendarGrid = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);

    let startingDayOfWeek = firstDay.getDay() - 1; // Convert 0(Sun)...6(Sat) to 0(Mon)...6(Sun)
    if (startingDayOfWeek < 0) startingDayOfWeek = 6;

    const totalDays = lastDay.getDate();
    const cells = [];

    // Previous month padding cells
    const prevMonthLastDay = new Date(currentYear, currentMonth, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      cells.push({
        dayNum: prevMonthLastDay - i,
        isCurrentMonth: false,
        dateStr: "",
      });
    }

    // Current month day cells
    for (let d = 1; d <= totalDays; d++) {
      const monthStr = String(currentMonth + 1).padStart(2, "0");
      const dayStr = String(d).padStart(2, "0");
      const dateStr = `${currentYear}-${monthStr}-${dayStr}`;

      const dayEvents = filteredEvents.filter((evt) => evt.date === dateStr);

      cells.push({
        dayNum: d,
        isCurrentMonth: true,
        dateStr,
        isToday: dateStr === "2026-09-15",
        events: dayEvents,
      });
    }

    // Next month padding cells to complete 35 or 42 grid cells
    const totalSlots = cells.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - cells.length;
    for (let i = 1; i <= remainingSlots; i++) {
      cells.push({
        dayNum: i,
        isCurrentMonth: false,
        dateStr: "",
      });
    }

    return cells;
  }, [currentYear, currentMonth, filteredEvents]);

  // Handle Add New Event
  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      alert("Vui lòng nhập tên sự kiện!");
      return;
    }

    const created: EventItem = {
      id: `evt-${Date.now()}`,
      title: newTitle,
      date: newDate,
      time: newTime,
      category: newCategory,
      badge:
        newCategory === "holiday"
          ? "Nghỉ lễ"
          : newCategory === "meeting"
          ? "Họp ban"
          : newCategory === "training"
          ? "Đào tạo"
          : newCategory === "benefit"
          ? "Phúc lợi"
          : "Công tác",
      location: newLocation || "Văn phòng công ty",
      organizer: "Ban HCNS",
      description: newDescription || "Sự kiện được bổ sung vào lịch công tác.",
    };

    setEvents([created, ...events]);
    setIsCreateModalOpen(false);
    setNewTitle("");
    setNewDescription("");
    showToast(`Đã thêm sự kiện "${created.title}" vào lịch công tác!`);
  };

  return (
    <div className="space-y-6 pb-12 animate-fade-in max-w-7xl mx-auto relative">
      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <CalendarIcon className="w-6 h-6 text-[#1b365d]" />
            Lịch công tác & Sự kiện
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Theo dõi kế hoạch họp giao ban, đào tạo nội bộ và các sự kiện doanh nghiệp
          </p>
        </div>

        {/* Month Navigator & Create CTA */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1 rounded-xl">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Tháng trước"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-bold text-slate-800 px-2 font-mono">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-white transition-all"
              title="Tháng sau"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedDateForCreate("2026-09-15");
              setNewDate("2026-09-15");
              setIsCreateModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-semibold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm sự kiện</span>
          </button>
        </div>
      </div>



      {/* BỘ LỌC TABS CỦA LỊCH */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "Tất cả sự kiện", count: events.length },
            { id: "meeting", label: "Họp & Giao ban", count: events.filter((e) => e.category === "meeting").length },
            { id: "training", label: "Đào tạo & Hội thảo", count: events.filter((e) => e.category === "training").length },
            { id: "trip", label: "Lịch công tác", count: events.filter((e) => e.category === "trip").length },
            { id: "holiday", label: "Nghỉ lễ", count: events.filter((e) => e.category === "holiday").length },
            { id: "benefit", label: "Phúc lợi", count: events.filter((e) => e.category === "benefit").length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
                selectedCategory === tab.id
                  ? "bg-[#1b365d] text-white shadow-xs font-bold"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  selectedCategory === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* MA TRẬN BẢNG LỊCH THẬT (CALENDAR GRID 7 CỘT THÁNG 9/2026) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header Ngày Trong Tuần */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 text-slate-700 text-center font-bold text-xs">
          {["Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ Nhật"].map((day, idx) => (
            <div key={idx} className="py-3 px-2 border-r last:border-r-0 border-slate-200/80">
              {day}
            </div>
          ))}
        </div>

        {/* Lưới Ngày trong Tháng */}
        <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 min-h-[500px]">
          {calendarGrid.map((cell, idx) => {
            return (
              <div
                key={idx}
                onClick={() => {
                  if (cell.isCurrentMonth && cell.dateStr) {
                    setSelectedDateForCreate(cell.dateStr);
                    setNewDate(cell.dateStr);
                  }
                }}
                className={`p-2 min-h-[110px] flex flex-col justify-between transition-colors group relative ${
                  !cell.isCurrentMonth
                    ? "bg-slate-50/50 text-slate-300 pointer-events-none"
                    : cell.isToday
                    ? "bg-blue-50/40 font-bold"
                    : "hover:bg-slate-50/70"
                }`}
              >
                {/* Header Ô ngày */}
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-mono font-bold inline-flex items-center justify-center rounded-lg w-6 h-6 ${
                      cell.isToday
                        ? "bg-[#1b365d] text-white shadow-2xs"
                        : cell.isCurrentMonth
                        ? "text-slate-800"
                        : "text-slate-300"
                    }`}
                  >
                    {cell.dayNum}
                  </span>

                  {cell.isCurrentMonth && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDateForCreate(cell.dateStr);
                        setNewDate(cell.dateStr);
                        setIsCreateModalOpen(true);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-[#1b365d] hover:bg-slate-200/60 rounded-md transition-all"
                      title="Thêm sự kiện vào ngày này"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Danh sách Sự kiện trên Ngày này */}
                <div className="mt-1.5 space-y-1.5 flex-1">
                  {cell.events &&
                    cell.events.map((evt) => {
                      const theme = getCategoryTheme(evt.category);
                      return (
                        <div
                          key={evt.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setInspectEvent(evt);
                          }}
                          className={`p-1.5 rounded-lg border text-left cursor-pointer transition-all ${theme.pillClass} shadow-2xs`}
                          title={`${evt.title} (${evt.time})`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${theme.dot} shrink-0`} />
                            <p className="font-bold text-[11px] leading-tight truncate">
                              {evt.title}
                            </p>
                          </div>
                          <p className="text-[10px] font-mono mt-0.5 text-slate-500 truncate pl-3">
                            {evt.time}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DANH SÁCH CHI TIẾT SỰ KIỆN DẠNG BẢNG / THẺ PHÍA DƯỚI */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 px-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-base font-bold text-slate-900">Danh sách các sự kiện trọng tâm</h2>
          <span className="text-xs text-slate-500 font-medium">Tổng số: {filteredEvents.length} sự kiện</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5">
          {filteredEvents.map((evt) => {
            const theme = getCategoryTheme(evt.category);
            return (
              <div
                key={evt.id}
                onClick={() => setInspectEvent(evt)}
                className="bg-white rounded-xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all cursor-pointer hover:border-[#1b365d]/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${theme.badgeClass}`}>
                      {evt.badge}
                    </span>
                    <span className="text-xs font-mono font-bold text-[#1b365d] bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                      {evt.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 leading-snug mb-2 hover:text-[#1b365d] transition-colors">
                    {evt.title}
                  </h3>

                  <div className="space-y-1 text-xs text-slate-600 font-medium">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-mono">{evt.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{evt.location}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Chủ trì: <b>{evt.organizer || "Ban HCNS"}</b></span>
                  <span className="text-blue-600 font-bold hover:underline">Chi tiết →</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL 1: CHI TIẾT SỰ KIỆN */}
      {inspectEvent && (
        <Modal
          isOpen={Boolean(inspectEvent)}
          onClose={() => setInspectEvent(null)}
          size="lg"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#1b365d] to-[#122440] text-white">
              <div className="flex items-center gap-3">
                <CalendarIcon className="w-6 h-6 text-blue-300" />
                <div>
                  <h3 className="text-base font-bold">Chi tiết sự kiện công tác</h3>
                  <p className="text-xs text-blue-200/80 font-mono">{inspectEvent.date}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectEvent(null)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getCategoryTheme(inspectEvent.category).badgeClass}`}>
                  {inspectEvent.badge}
                </span>
                <span className="font-mono font-bold text-slate-700 text-xs bg-slate-100 px-2.5 py-1 rounded-lg">
                  {inspectEvent.time}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-900 leading-snug">
                {inspectEvent.title}
              </h3>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#1b365d] shrink-0" />
                  <span className="font-semibold">Địa điểm:</span>
                  <span>{inspectEvent.location}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-[#1b365d] shrink-0" />
                  <span className="font-semibold">Đơn vị chủ trì:</span>
                  <span>{inspectEvent.organizer || "Ban HCNS"}</span>
                </div>

                {inspectEvent.attendees && inspectEvent.attendees.length > 0 && (
                  <div className="flex items-start gap-2 pt-1">
                    <Users className="w-4 h-4 text-[#1b365d] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block mb-1">Thành phần tham dự:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {inspectEvent.attendees.map((at, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded bg-blue-100/70 text-blue-900 font-semibold text-[11px]">
                            {at}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {inspectEvent.description && (
                <div>
                  <h4 className="font-bold text-slate-800 text-xs mb-1">Nội dung chi tiết:</h4>
                  <p className="text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-slate-200">
                    {inspectEvent.description}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setInspectEvent(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition-colors"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={() => {
                  showToast(`Đã ghi nhận lịch nhắc sự kiện: ${inspectEvent.title}`);
                  setInspectEvent(null);
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1b365d] hover:bg-[#152a4a] shadow-sm transition-all"
              >
                Thêm vào lịch nhắc cá nhân
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: THÊM SỰ KIỆN MỚI */}
      {isCreateModalOpen && (
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          size="lg"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 via-[#1b365d] to-[#122440] text-white">
              <div className="flex items-center gap-3">
                <Plus className="w-6 h-6 text-blue-300 stroke-[2.5]" />
                <div>
                  <h3 className="text-base font-bold">Thêm sự kiện công tác mới</h3>
                  <p className="text-xs text-blue-200/80">Cập nhật vào lịch chung của doanh nghiệp</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateEventSubmit}>
              <div className="p-6 space-y-4 text-xs">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Tên sự kiện / Tiêu đề họp *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="VD: Họp giao ban phòng Kinh doanh..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Phân loại sự kiện
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as any)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                    >
                      <option value="meeting">Họp ban / Giao ban</option>
                      <option value="training">Đào tạo & Hội thảo</option>
                      <option value="trip">Lịch công tác</option>
                      <option value="holiday">Nghỉ lễ</option>
                      <option value="benefit">Phúc lợi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Ngày diễn ra (YYYY-MM-DD) *
                    </label>
                    <input
                      type="date"
                      required
                      value={newDate}
                      onChange={(e) => setNewDate(e.target.value)}
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Khung giờ *
                    </label>
                    <input
                      type="text"
                      value={newTime}
                      onChange={(e) => setNewTime(e.target.value)}
                      placeholder="09:00 - 11:30"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Địa điểm *
                    </label>
                    <input
                      type="text"
                      value={newLocation}
                      onChange={(e) => setNewLocation(e.target.value)}
                      placeholder="Phòng Họp Lớn (Tầng 3)"
                      className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Ghi chú / Nội dung chi tiết
                  </label>
                  <textarea
                    rows={3}
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="Mô tả chi tiết nội dung sự kiện..."
                    className="w-full p-2.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20"
                  />
                </div>
              </div>

              {/* Modal Footer */}
              <div className="p-4 px-6 border-t border-slate-100 bg-slate-50/80 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200/70 transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-[#1b365d] hover:bg-[#152a4a] shadow-md shadow-[#1b365d]/20 transition-all"
                >
                  Xác nhận thêm sự kiện
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}

