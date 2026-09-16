"use client";

import React, { useState } from "react";
import {
  Users,
  UserCheck,
  Clock,
  Building2,
  TrendingUp,
  Bell,
  Pin,
  CheckCircle2,
  ChevronRight,
  BarChart3,
  PieChart,
  PlusCircle,
  CheckSquare,
  FolderKanban,
  ShieldCheck,
  CalendarDays,
  UserPlus,
  X,
  Sparkles,
  ArrowUpRight,
  LayoutDashboard,
} from "lucide-react";
import { Employee } from "@/app/data/seed-employees";

interface DashboardViewProps {
  employees: Employee[];
  departments: any[];
  company: any;
  onGoToEmployees: () => void;
  onGoToDepartments: () => void;
}

interface Notice {
  id: string;
  category: "Lãnh đạo" | "Nhân sự" | "Pháp chế" | "Công đoàn";
  title: string;
  summary: string;
  content: string;
  date: string;
  author: string;
  isPinned?: boolean;
  priority: "high" | "normal";
}

export default function DashboardView({
  employees,
  departments,
  company,
  onGoToEmployees,
  onGoToDepartments,
}: DashboardViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [readingNotice, setReadingNotice] = useState<Notice | null>(null);

  const total = employees.length > 0 ? employees.length : 12;
  const activeCount = employees.filter((e) => e.status === "active").length || 10;
  const probationCount = employees.filter((e) => e.status === "probation").length || 2;
  const deptCount = departments.length > 0 ? departments.length : 6;

  // Dữ liệu biểu đồ chuyên cần tuần (biểu đồ hiện đại thanh lịch)
  const weeklyAttendanceData = [
    { day: "Thứ 2", rate: 100, present: 12, total: 12, note: "Đủ 12/12" },
    { day: "Thứ 3", rate: 92, present: 11, total: 12, note: "11/12 (1 phép)" },
    { day: "Thứ 4", rate: 100, present: 12, total: 12, note: "Đủ 12/12" },
    { day: "Thứ 5", rate: 92, present: 11, total: 12, note: "11/12 (1 công tác)" },
    { day: "Thứ 6", rate: 96, present: 11.5, total: 12, note: "11.5/12" },
    { day: "Thứ 7", rate: 85, present: 10, total: 12, note: "Luân phiên" },
  ];

  // Dữ liệu phân bổ phòng ban với dải màu hiện đại thanh lịch
  const deptDistribution = [
    { name: "Ban CNTT & Chuyển Đổi Số", count: 4, percent: 33, barGradient: "from-blue-500 to-indigo-600", badgeBg: "bg-blue-50 text-blue-700 border-blue-200" },
    { name: "Ban Nhân Sự & Đào Tạo", count: 3, percent: 25, barGradient: "from-indigo-500 to-purple-600", badgeBg: "bg-indigo-50 text-indigo-700 border-indigo-200" },
    { name: "Ban Tài Chính Kế Toán", count: 3, percent: 25, barGradient: "from-emerald-500 to-teal-600", badgeBg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    { name: "Ban Dự Án & Kế Hoạch", count: 2, percent: 17, barGradient: "from-amber-400 to-orange-500", badgeBg: "bg-amber-50 text-amber-700 border-amber-200" },
  ];

  // Thông báo nội bộ chính thức
  const notices: Notice[] = [
    {
      id: "TB-01",
      category: "Lãnh đạo",
      isPinned: true,
      priority: "high",
      title: "Triển khai Kế hoạch công tác Quý IV/2026 & Giao ban toàn thể",
      summary: "Triệu tập phiên họp giao ban định kỳ vào 09:00 Thứ Ba ngày 15/09 tại Phòng Họp Lớn (Tầng 3).",
      content:
        "Căn cứ kế hoạch sản xuất kinh doanh năm 2026 của Công ty Đông Hải, Ban Giám đốc thông báo:\n1. Triệu tập toàn thể Trưởng/Phó các Ban tham dự họp Giao ban đánh giá kết quả Quý III và chỉ tiêu Quý IV/2026.\n2. Thời gian: 09:00 - 11:30 Thứ Ba, ngày 15/09/2026 tại Phòng Họp Lớn (Tầng 3).",
      date: "14/09/2026",
      author: "Văn phòng HĐQT & Ban Giám đốc",
    },
    {
      id: "TB-02",
      category: "Nhân sự",
      priority: "normal",
      title: "Khám sức khỏe định kỳ năm 2026 & Gia hạn Bảo hiểm sức khỏe",
      summary: "Tổ chức khám sức khỏe định kỳ cho toàn thể CBCNV vào ngày 26-27/09/2026 tại Bệnh viện Quốc tế.",
      content:
        "Công ty Đông Hải thông báo chương trình khám sức khỏe định kỳ năm 2026:\n- Đối tượng: Toàn bộ cán bộ nhân viên chính thức và thử việc.\n- Địa điểm: Bệnh viện Đa khoa Quốc tế (Xe đưa đón tại trụ sở).",
      date: "12/09/2026",
      author: "Ban Nhân sự & Đào Tạo",
    },
    {
      id: "TB-03",
      category: "Pháp chế",
      priority: "high",
      title: "Ban hành Quy chế Bảo mật thông tin số và An toàn dữ liệu",
      summary: "Áp dụng tiêu chuẩn bảo mật dữ liệu khách hàng và quy định sử dụng tài nguyên số.",
      content:
        "Kể từ ngày 15/09/2026, toàn thể CBCNV thực hiện nghiêm túc Quy chế bảo mật dữ liệu doanh nghiệp.",
      date: "10/09/2026",
      author: "Ban Pháp chế & Chuyển đổi số",
    },
  ];

  const filteredNotices =
    selectedCategory === "all"
      ? notices
      : notices.filter((n) => n.category === selectedCategory);

  // Hoạt động gần đây
  const recentActivities = [
    {
      icon: UserCheck,
      color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      text: "Đã phê duyệt hoàn tất 2 đơn xin nghỉ phép năm",
      time: "30 phút trước",
    },
    {
      icon: Bell,
      color: "text-blue-600 bg-blue-50 border-blue-100",
      text: "Phát hành thông báo họp Giao ban HĐQT Quý IV/2026",
      time: "2 giờ trước",
    },
    {
      icon: CheckCircle2,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
      text: "Cập nhật thành công sơ đồ chức danh Ban CNTT & CĐS",
      time: "Hôm qua",
    },
  ];

  return (
    <div className="space-y-6 text-slate-800">
      {/* 1. HEADER KHU VỰC TỔNG QUAN — Nền Trắng Sạch Sẽ, Thoáng Đãng (Bỏ Khối Đen Đậm) */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString("vi-VN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Tổng Quan Vận Hành Doanh Nghiệp
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Báo cáo chỉ số chuyên cần, tình hình quân số và phân bổ nguồn lực Công ty Đông Hải.
          </p>
        </div>

        {/* Nút hành động nhanh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onGoToEmployees}
            className="px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all border border-slate-200 shadow-2xs flex items-center gap-1.5 cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-slate-600" /> Nhân sự mới
          </button>
          <a
            href="/leave"
            className="px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-slate-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-[#1b365d]/15"
          >
            <PlusCircle className="w-3.5 h-3.5" /> Tạo đơn phép
          </a>
        </div>
      </div>

      {/* 2. THỐNG KÊ TỔNG QUAN (4 METRIC CARDS TINH TẾ) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div
          onClick={onGoToEmployees}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-blue-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tổng Quân Số
              </span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">
                {total}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1b365d] flex items-center justify-center font-bold border border-blue-100 group-hover:bg-[#1b365d] group-hover:text-white transition-colors">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Chính thức: <strong>{activeCount}</strong></span>
            <span className="text-slate-600 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              Thử việc: {probationCount}
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-emerald-300 shadow-2xs hover:shadow-xs transition-all">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Tỷ Lệ Có Mặt
              </span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">
                91.6%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold border border-emerald-100">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Có mặt: <strong>11/12 cán bộ</strong></span>
            <span className="text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Đúng giờ
            </span>
          </div>
        </div>

        {/* Card 3 */}
        <a
          href="/approvals"
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-amber-300 shadow-2xs hover:shadow-xs transition-all group block"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Chờ Phê Duyệt
              </span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">
                3
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-colors">
              <CheckSquare className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Hồ sơ chờ duyệt</span>
            <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Cần xử lý
            </span>
          </div>
        </a>

        {/* Card 4 */}
        <div
          onClick={onGoToDepartments}
          className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer group"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Khối Chuyên Môn
              </span>
              <div className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1 font-mono">
                {deptCount}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-600 font-medium">Ban phòng công ty</span>
            <span className="text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
              Vận hành
            </span>
          </div>
        </div>
      </div>

      {/* 3. BIỂU ĐỒ HIỆN ĐẠI (MODERN SLEEK CHARTS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* BIỂU ĐỒ 1: CHUYÊN CẦN NGÀY TRONG TUẦN (Thanh Cột Gradient Thanh Lịch) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#1b365d] flex items-center justify-center">
                <BarChart3 className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Chuyên Cần Ngày Trong Tuần
                </h3>
                <p className="text-xs text-slate-500 font-normal">Tỷ lệ có mặt tính trên tổng quân số 12 cán bộ</p>
              </div>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> TB: 94.1%
            </span>
          </div>

          {/* Modern Visual Bar Chart with Gradient Pillars */}
          <div className="pt-6 pb-2">
            <div className="h-44 flex items-end justify-between gap-3 px-3 relative">
              {/*Dotted Grid background lines */}
              <div className="absolute inset-x-3 top-2 border-b border-dashed border-slate-200/60 pointer-events-none" />
              <div className="absolute inset-x-3 top-1/2 border-b border-dashed border-slate-200/60 pointer-events-none" />

              {weeklyAttendanceData.map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] font-bold px-2 py-1 rounded shadow-md pointer-events-none whitespace-nowrap z-20">
                    {item.day}: {item.rate}% ({item.note})
                  </div>

                  {/* Percentage label above bar */}
                  <span className="text-xs font-extrabold text-slate-700 font-mono">
                    {item.rate}%
                  </span>

                  {/* Modern Slim Bar Track Container */}
                  <div className="w-full bg-slate-100/80 rounded-2xl h-32 flex items-end justify-center overflow-hidden p-1">
                    <div
                      className={`w-7 sm:w-9 rounded-xl bg-gradient-to-t ${
                        item.rate >= 95
                          ? "from-blue-600 via-indigo-500 to-sky-400"
                          : item.rate >= 90
                          ? "from-teal-600 via-emerald-500 to-teal-300"
                          : "from-amber-500 via-orange-400 to-amber-300"
                      } transition-all duration-500 group-hover:scale-[1.03] group-hover:brightness-110 shadow-xs`}
                      style={{ height: `${item.rate}%` }}
                    />
                  </div>

                  {/* Day label */}
                  <span className="text-xs font-bold text-slate-600">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Dữ liệu điểm danh tuần 38/2026</span>
            <span className="font-semibold text-slate-700">12/12 nhân sự tham gia</span>
          </div>
        </div>

        {/* BIỂU ĐỒ 2: ĐỊNH BIÊN NHÂN SỰ THEO BAN (Thanh Phân Bổ Nhiều Màu Hiện Đại) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
                <PieChart className="w-4.5 h-4.5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Định Biên Nhân Sự Theo Ban
                </h3>
                <p className="text-xs text-slate-500 font-normal">Cơ cấu định biên 4 khối chính</p>
              </div>
            </div>
            <button
              onClick={onGoToDepartments}
              className="text-xs text-[#1b365d] font-bold hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {/* Modern Colored Progress Breakdown */}
          <div className="space-y-3.5 py-3">
            {deptDistribution.map((dept, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">
                    {dept.name}
                  </span>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded-md border ${dept.badgeBg}`}>
                    {dept.count} ns ({dept.percent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`bg-gradient-to-r ${dept.barGradient} h-2.5 rounded-full transition-all duration-500 shadow-2xs`}
                    style={{ width: `${dept.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-slate-50/90 border border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span>Tổng số khối chuyên môn: <strong className="font-bold text-slate-900">4 Ban</strong></span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              100% Đã phủ kín
            </span>
          </div>
        </div>
      </div>

      {/* 4. THAO TÁC NHANH & DANH SÁCH THÔNG BÁO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* TRÁI: THAO TÁC NHANH */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FolderKanban className="w-4.5 h-4.5 text-[#1b365d]" />
              Thao Tác Nhanh
            </h3>
            <span className="text-xs text-slate-400 font-medium">Lối tắt</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <a
              href="/leave"
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                <PlusCircle className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Tạo Đơn Phép</span>
            </a>

            <a
              href="/approvals"
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1b365d] flex items-center justify-center border border-blue-100 group-hover:bg-[#1b365d] group-hover:text-white transition-colors">
                <CheckSquare className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Duyệt Hồ Sơ</span>
            </a>

            <a
              href="/attendance"
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <Clock className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Bảng Chấm Công</span>
            </a>

            <a
              href="/calendar"
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all flex flex-col items-center text-center gap-2 group"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <CalendarDays className="w-4.5 h-4.5" />
              </div>
              <span className="text-xs font-bold text-slate-800">Lịch Sự Kiện</span>
            </a>
          </div>
        </div>

        {/* GIỮA: THÔNG BÁO MỚI NHẤT */}
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5 space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Bell className="w-4.5 h-4.5 text-[#1b365d]" />
              Thông Báo Điều Hành
            </h3>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-slate-200 bg-slate-50 text-slate-700 cursor-pointer focus:outline-none"
            >
              <option value="all">Tất cả thông báo</option>
              <option value="Lãnh đạo">Ban Giám đốc</option>
              <option value="Nhân sự">Nhân sự</option>
              <option value="Pháp chế">Pháp chế</option>
            </select>
          </div>

          <div className="space-y-2.5">
            {filteredNotices.map((notice) => (
              <div
                key={notice.id}
                onClick={() => setReadingNotice(notice)}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/40 hover:bg-slate-100/70 transition-all cursor-pointer group flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    {notice.isPinned && (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-50 text-rose-600 border border-rose-200 flex items-center gap-1">
                        <Pin className="w-3 h-3 rotate-45" /> Ghim
                      </span>
                    )}
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1b365d] border border-blue-200">
                      {notice.category}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {notice.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#1b365d] transition-colors leading-snug truncate">
                    {notice.title}
                  </h4>
                  <p className="text-xs text-slate-500 truncate font-normal">
                    {notice.summary}
                  </p>
                </div>
                <div className="text-xs font-bold text-slate-600 flex items-center gap-0.5 shrink-0 self-center group-hover:text-[#1b365d] transition-colors">
                  Chi tiết <ChevronRight className="w-3.5 h-3.5" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. DÒNG HOẠT ĐỘNG HỆ THỐNG */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-5">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-[#1b365d]" />
            Dòng Hoạt Động Gần Đây
          </h3>
          <span className="text-xs text-slate-400 font-medium">Hệ thống ghi nhận</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3">
          {recentActivities.map((act, idx) => {
            const Icon = act.icon;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/70 bg-slate-50/50 flex items-start gap-3"
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${act.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-snug">
                    {act.text}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    {act.time}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: XEM CHI TIẾT THÔNG BÁO */}
      {readingNotice && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[85vh]">
            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-50 text-[#1b365d] border border-blue-200">
                    {readingNotice.category}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {readingNotice.date}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
                  {readingNotice.title}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setReadingNotice(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-sm text-slate-600 leading-relaxed font-normal">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-slate-700 italic text-xs sm:text-sm">
                {readingNotice.summary}
              </div>

              <div className="whitespace-pre-line text-slate-700">
                {readingNotice.content}
              </div>

              <div className="pt-4 border-t border-slate-100 text-xs text-slate-500">
                <span className="font-semibold text-slate-700">Đơn vị ban hành: </span>
                {readingNotice.author}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setReadingNotice(null)}
                className="px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
              >
                Đã tiếp nhận thông báo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
