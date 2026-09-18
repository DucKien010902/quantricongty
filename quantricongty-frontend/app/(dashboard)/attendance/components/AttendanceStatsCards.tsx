"use client";

import React from "react";
import { Calendar, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface AttendanceStatsCardsProps {
  totalStandardDays: number;
  weekendDays?: number;
  holidayDays?: number;
  totalDuCong: number;
  totalThieuPhut: number;
  totalPunchRecords: number;
}

export default function AttendanceStatsCards({
  totalStandardDays,
  weekendDays = 8,
  holidayDays = 0,
  totalDuCong,
  totalThieuPhut,
  totalPunchRecords,
}: AttendanceStatsCardsProps) {
  return (
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
          <p className="text-xs text-slate-500 mt-1 font-medium">
            Trừ {weekendDays} ngày nghỉ T7/CN
            {holidayDays > 0 ? ` & ${holidayDays} ngày Lễ` : ""}
          </p>
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
  );
}
