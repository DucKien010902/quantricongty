"use client";

import React from "react";
import { Search } from "lucide-react";

interface AttendanceDailyTableProps {
  filteredDailyData: any[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filterDept: string;
  onFilterDeptChange: (d: string) => void;
  filterUser: string;
  onFilterUserChange: (u: string) => void;
  isHRAdmin: boolean;
  departments: any[];
  employees: any[];
  currentEmployee: any;
  currentUser: any;
  myCode: string;
  myAttendanceCode: string;
  formatWorkTime: (row: any) => string;
  getWeekdayLabel: (dateStr: string, fallback?: string) => string;
}

export default function AttendanceDailyTable({
  filteredDailyData,
  searchQuery,
  onSearchChange,
  filterDept,
  onFilterDeptChange,
  filterUser,
  onFilterUserChange,
  isHRAdmin,
  departments,
  employees,
  currentEmployee,
  currentUser,
  myCode,
  myAttendanceCode,
  formatWorkTime,
  getWeekdayLabel,
}: AttendanceDailyTableProps) {
  return (
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
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-9 pr-3.5 py-2.5 text-xs font-medium rounded-xl border border-slate-200 bg-slate-50/70 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] w-52 sm:w-64 text-slate-800"
            />
          </div>

          {/* Department & Employee Filters (Chỉ hiển thị cho Admin và HCNS) */}
          {isHRAdmin ? (
            <>
              {/* Department Filter */}
              <select
                value={filterDept}
                onChange={(e) => onFilterDeptChange(e.target.value)}
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
                onChange={(e) => onFilterUserChange(e.target.value)}
                className="text-xs py-2.5 px-3.5 rounded-xl border border-slate-200 bg-slate-50/70 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 font-medium text-slate-700"
              >
                <option value="ALL">Tất cả Nhân sự</option>
                {employees.map((emp) => (
                  <option key={emp.code || emp.id} value={emp.code || emp.id}>
                    {emp.code || emp.id} - {emp.name}
                  </option>
                ))}
              </select>
            </>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium text-slate-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>
                  Ban: <b>{currentEmployee?.department || currentUser?.department || "Chuyên môn"}</b>
                </span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-50 border border-blue-200 text-xs font-semibold text-blue-800">
                <span>
                  Mã NV: <b>{myCode}</b>
                </span>
                {myAttendanceCode && (
                  <span>
                    • Mã máy: <b>{myAttendanceCode}</b>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Hiển thị <b className="text-slate-900">{filteredDailyData.length}</b> ngày công
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
                <th className="py-3.5 px-3 text-center min-w-[100px]">Giờ vào</th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">Giờ ra</th>
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
                    Chưa có dữ liệu chấm công cho bộ lọc này. Hãy bấm <b>"Kéo dữ liệu máy chấm công"</b> hoặc{" "}
                    <b>"Nhập file Excel"</b>.
                  </td>
                </tr>
              ) : (
                filteredDailyData.map((row: any, idx: number) => {
                  const isWeekend = row.status === "CUOI_TUAN";
                  const isHoliday = row.status === "NGHI_LE";
                  const isLeave = row.status === "NGHI_PHEP";
                  const isTrip = row.status === "CONG_TAC";

                  // Hôm nào thiếu công thì vàng TOÀN BỘ Ô CẢ CỘT GIỜ VÀO VÀ GIỜ RA
                  const isThieuCong =
                    !isWeekend &&
                    !isHoliday &&
                    !isLeave &&
                    !isTrip &&
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
                          : isThieuCong
                          ? "bg-[#fffbeb] hover:bg-amber-100/60"
                          : "hover:bg-slate-50/80"
                      }`}
                    >
                      {/* 1. Nhân sự */}
                      <td className="py-3.5 px-4 min-w-[200px]">
                        <div>
                          <p
                            className={`font-bold text-sm leading-snug ${
                              isWeekend ? "text-slate-700" : "text-slate-900"
                            }`}
                          >
                            {row.name}
                          </p>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">{row.userId}</p>
                        </div>
                      </td>

                      {/* 2. Ngày & Thứ */}
                      <td className="py-3.5 px-4 min-w-[140px]">
                        <span className="font-semibold text-slate-800 text-[13px]">{row.date}</span>
                        {weekdayText && (
                          <span
                            className={`text-xs font-medium ml-1.5 ${
                              isWeekend ? "text-slate-500" : "text-slate-400"
                            }`}
                          >
                            ({weekdayText})
                          </span>
                        )}
                      </td>

                      {/* 3. Giờ vào (VÀNG TOÀN BỘ Ô CHỮ NẾU THIẾU CÔNG) */}
                      <td
                        className={`py-3.5 px-3 text-center transition-colors ${
                          isThieuCong
                            ? "bg-[#fef3c7] text-[#92400e] font-semibold border-x border-amber-200/80"
                            : ""
                        }`}
                      >
                        {row.firstIn ? (
                          <span className="font-mono text-[13.5px] font-semibold">{row.firstIn}</span>
                        ) : isThieuCong ? (
                          <span className="font-mono text-[13.5px] font-semibold text-[#b45309]">
                            --:--:--
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono font-normal text-[13.5px]">--:--:--</span>
                        )}
                      </td>

                      {/* 4. Giờ ra (VÀNG TOÀN BỘ Ô CHỮ NẾU THIẾU CÔNG) */}
                      <td
                        className={`py-3.5 px-3 text-center transition-colors ${
                          isThieuCong
                            ? "bg-[#fef3c7] text-[#92400e] font-semibold border-x border-amber-200/80"
                            : ""
                        }`}
                      >
                        {row.lastOut ? (
                          <span className="font-mono text-[13.5px] font-semibold">{row.lastOut}</span>
                        ) : isThieuCong ? (
                          <span className="font-mono text-[13.5px] font-semibold text-[#b45309]">
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
                          <span className="px-2.5 py-1 rounded-lg bg-slate-100/90 text-slate-800 font-medium">
                            {formatWorkTime(row)}
                          </span>
                        )}
                      </td>

                      {/* 6. Thiếu phút */}
                      <td className="py-3.5 px-3 text-center font-mono text-[13.5px]">
                        {isWeekend ? (
                          <span className="text-slate-400 font-normal">-</span>
                        ) : row.missingMinutes > 0 ? (
                          <span className="text-amber-700 font-bold">-{row.missingMinutes}p</span>
                        ) : (
                          <span className="text-emerald-600 font-normal">0p</span>
                        )}
                      </td>

                      {/* 7. Công */}
                      <td className="py-3.5 px-3 text-center font-mono text-[13.5px]">
                        {isWeekend ? (
                          <span className="text-slate-400 font-normal">-</span>
                        ) : (
                          <span
                            className={
                              row.workCredit >= 1.0
                                ? "text-emerald-600 font-bold"
                                : row.workCredit > 0
                                ? "text-amber-700 font-bold"
                                : "text-rose-600 font-bold"
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
                        ) : isTrip ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {row.note || "Đi công tác"}
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
  );
}
