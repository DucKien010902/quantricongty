"use client";

import React from "react";
import { Palmtree, Calendar, ShieldCheck, UserCheck, Plus } from "lucide-react";
import { UserLeaveStats } from "../types";

interface LeaveQuotaWidgetProps {
  stats: UserLeaveStats;
  userName: string;
  isHRAdmin: boolean;
  isLeader: boolean;
  onOpenCreateLeave: () => void;
  onOpenCreateOther: () => void;
}

export const LeaveQuotaWidget: React.FC<LeaveQuotaWidgetProps> = ({
  stats,
  userName,
  isHRAdmin,
  isLeader,
  onOpenCreateLeave,
  onOpenCreateOther,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-3.5">
      {/* Card 1: Quỹ Phép Được Cấp */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Quỹ Phép Của Tôi (2026)
          </span>
          <span className="p-1.5 rounded-lg bg-blue-50 text-[#1b365d]">
            <Palmtree className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-slate-900 font-mono">
            {stats.totalAllowed}
          </span>
          <span className="text-xs text-slate-500 font-medium">ngày phép</span>
        </div>
        <p className="text-[10.5px] text-slate-400 mt-1">
          Gồm {stats.quota} ngày năm nay + {stats.carried} ngày tồn
        </p>
      </div>

      {/* Card 2: Đã sử dụng */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            Số Ngày Đã Nghỉ
          </span>
          <span className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
            <Calendar className="w-4 h-4" />
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black text-amber-600 font-mono">
            {stats.used}
          </span>
          <span className="text-xs text-slate-500 font-medium">ngày đã trừ</span>
        </div>
        <p className="text-[10.5px] text-slate-400 mt-1">Tự động trừ khi HCNS duyệt chốt</p>
      </div>

      {/* Card 3: Số ngày còn lại (Nổi bật) */}
      <div className="bg-gradient-to-br from-[#1b365d] to-[#122440] text-white p-4 rounded-2xl shadow-md flex flex-col justify-between relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-blue-200 font-bold uppercase tracking-wider">
              Phép Năm Còn Lại
            </span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Khả dụng
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white font-mono">
              {stats.remaining}
            </span>
            <span className="text-xs text-blue-200 font-medium">ngày có thể xin</span>
          </div>
          <p className="text-[10.5px] text-blue-200/70 mt-1">
            Nhân sự: <strong className="text-white">{userName || "Tài khoản"}</strong>
          </p>
        </div>
        <div className="absolute -right-2 -bottom-4 w-20 h-20 bg-white/5 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Card 4: Thẩm Quyền Phê Duyệt & Nút Tạo Đơn */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">
              Thẩm Quyền Phê Duyệt
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-1.5">
            {isHRAdmin ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                <UserCheck className="w-3.5 h-3.5" />
                Trưởng Ban HCNS (Cấp 2)
              </span>
            ) : isLeader ? (
              <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                <UserCheck className="w-3.5 h-3.5" />
                Trưởng Ban (Cấp 1)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                Nhân Viên
              </span>
            )}
          </div>
        </div>

        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={onOpenCreateLeave}
            className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-bold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nghỉ phép</span>
          </button>
          <button
            type="button"
            onClick={onOpenCreateOther}
            className="px-3 py-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition-all"
            title="Tạo đề xuất công tác hoặc up tài liệu"
          >
            <span>Khác</span>
          </button>
        </div>
      </div>
    </div>
  );
};
