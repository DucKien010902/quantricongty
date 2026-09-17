"use client";

import React from "react";
import { FileSpreadsheet, Download } from "lucide-react";

interface AttendanceMonthlyTableProps {
  displayMonthlyData: any[];
  selectedMonth: string;
  totalStandardDays: number;
  onExportExcel: () => void;
}

export default function AttendanceMonthlyTable({
  displayMonthlyData,
  selectedMonth,
  totalStandardDays,
  onExportExcel,
}: AttendanceMonthlyTableProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-[#1b365d]" />
              Bảng tổng hợp công Tháng {selectedMonth}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Chuẩn công tháng: <b className="text-slate-800">{totalStandardDays} ngày</b>. Tổng công = Đi làm +
              Công tác + Phép.
            </p>
          </div>

          <button
            onClick={onExportExcel}
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
                <th className="py-3.5 px-3 text-center w-12">STT</th>
                <th className="py-3.5 px-4 min-w-[200px]">Họ và Tên & Mã NV</th>
                <th className="py-3.5 px-4 min-w-[140px]">Ban / Phòng</th>
                <th className="py-3.5 px-3 text-center min-w-[90px] bg-blue-50/70 text-blue-900">Công đi làm</th>
                <th className="py-3.5 px-3 text-center min-w-[80px]">Công tác</th>
                <th className="py-3.5 px-3 text-center min-w-[80px]">Công phép</th>
                <th className="py-3.5 px-3 text-center min-w-[90px] bg-emerald-50/70 text-emerald-900">
                  TỔNG CÔNG
                </th>
                <th className="py-3.5 px-3 text-center min-w-[90px]">Chuẩn tháng</th>
                <th className="py-3.5 px-3 text-center min-w-[90px]">Tỷ lệ (%)</th>
                <th className="py-3.5 px-3 text-center min-w-[90px]">Thiếu phút</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayMonthlyData.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-500">
                    Chưa có dữ liệu tổng hợp công cho tháng này.
                  </td>
                </tr>
              ) : (
                displayMonthlyData.map((row: any, idx: number) => {
                  const rate =
                    row.chuanThang > 0 ? Math.round((row.tongCong / row.chuanThang) * 100) : 0;
                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors divide-x divide-slate-200">
                      <td className="py-4 px-3 text-center font-mono font-bold text-slate-500">{row.stt || idx + 1}</td>
                      <td className="py-4 px-4 min-w-[200px]">
                        <p className="font-bold text-slate-900 text-sm">{row.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{row.userId}</p>
                      </td>
                      <td className="py-4 px-4 text-slate-700 font-medium">{row.department}</td>
                      <td className="py-4 px-3 text-center font-mono font-bold text-blue-700 bg-blue-50/20">
                        {row.congDiLam}
                      </td>
                      <td className="py-4 px-3 text-center font-mono text-slate-700">{row.congTac || 0}</td>
                      <td className="py-4 px-3 text-center font-mono text-purple-700">{row.congPhep || 0}</td>
                      <td className="py-4 px-3 text-center font-mono font-black text-sm text-emerald-700 bg-emerald-50/30">
                        {row.tongCong}
                      </td>
                      <td className="py-4 px-3 text-center font-mono text-slate-600 font-bold">{row.chuanThang}</td>
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
                      <td className="py-4 px-3 text-center font-mono text-xs">
                        {row.missingMinutes > 0 ? (
                          <span className="text-amber-700 font-bold">-{row.missingMinutes}p</span>
                        ) : (
                          <span className="text-slate-400">0p</span>
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
