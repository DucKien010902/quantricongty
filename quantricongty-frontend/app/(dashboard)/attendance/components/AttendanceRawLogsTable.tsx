"use client";

import React from "react";
import { Server, ChevronLeft, ChevronRight } from "lucide-react";

interface AttendanceRawLogsTableProps {
  displayRawLogs: any[];
  rawTotal: number;
  rawPage: number;
  onPageChange: (p: number) => void;
  isHRAdmin: boolean;
}

export default function AttendanceRawLogsTable({
  displayRawLogs,
  rawTotal,
  rawPage,
  onPageChange,
  isHRAdmin,
}: AttendanceRawLogsTableProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Server className="w-5 h-5 text-[#1b365d]" />
              Nhật ký quẹt thẻ thô từ máy chấm công LAN (TCP Socket 4370)
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Dữ liệu gốc chưa qua xử lý, được lưu trữ theo thời gian thực từ phần cứng máy chấm công.
            </p>
          </div>

          <div className="text-xs text-slate-500 font-medium">
            Tổng cộng: <b className="text-[#1b365d] text-sm">{isHRAdmin ? rawTotal : displayRawLogs.length}</b> bản ghi
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs border border-slate-200">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold tracking-wider text-xs">
              <tr className="divide-x divide-slate-200">
                <th className="py-3.5 px-3 text-center w-12">STT</th>
                <th className="py-3.5 px-4 min-w-[140px]">Mã Chấm Công</th>
                <th className="py-3.5 px-4 min-w-[180px]">Nhân sự đối soát</th>
                <th className="py-3.5 px-4 text-center min-w-[180px]">Thời Gian Quẹt (Timestamp)</th>
                <th className="py-3.5 px-3 text-center min-w-[120px]">Phương thức quẹt</th>
                <th className="py-3.5 px-3 text-center min-w-[130px]">Nguồn dữ liệu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {displayRawLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    Chưa có nhật ký quẹt thẻ thô nào. Hãy bấm <b>"Kéo dữ liệu máy chấm công"</b> hoặc <b>"Nhập file Excel"</b>.
                  </td>
                </tr>
              ) : (
                displayRawLogs.map((log: any, idx: number) => {
                  const methodText =
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
                    log.userId === "CHUA_ANXUAT" ||
                    log.userId === "KHONG_XAC_DINH";

                  return (
                    <tr key={idx} className="hover:bg-slate-50/80 transition-colors divide-x divide-slate-200">
                      <td className="py-3.5 px-3 text-center font-mono font-bold text-slate-400">
                        {(rawPage - 1) * 50 + idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-sm">
                        {log.attendanceCode || log.userId || log.userCode || "--"}
                      </td>
                      <td className="py-3.5 px-4">
                        {isUnmapped ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
                            Chưa khớp hồ sơ NV
                          </span>
                        ) : (
                          <div>
                            <span className="font-bold text-slate-800 text-xs">{log.name}</span>
                            <span className="text-slate-400 text-[11px] ml-1.5 font-mono">({log.userId})</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800 text-sm bg-slate-50/40">
                        {log.timestamp || `${log.date} ${log.time}`}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
                          {methodText}
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
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Simple Pagination */}
        {isHRAdmin && rawTotal > 50 && (
          <div className="p-3 px-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <span className="text-xs text-slate-500">
              Trang {rawPage} / {Math.ceil(rawTotal / 50)}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onPageChange(Math.max(1, rawPage - 1))}
                disabled={rawPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => onPageChange(rawPage + 1)}
                disabled={rawPage * 50 >= rawTotal}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-slate-600"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
