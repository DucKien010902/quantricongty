"use client";

import React from "react";
import { ShieldCheck, Lock, KeyRound, Smartphone, CheckCircle2 } from "lucide-react";

export default function SecurityTab() {
  return (
    <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
      <div className="border-b border-slate-200/60 pb-3">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Chính Sách Bảo Mật & Xác Thực
        </h2>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Xác thực mã OTP qua Email</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Đăng nhập không cần mật khẩu với OTP 6 số</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Đang bật
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Mã hóa kết nối ZKTeco CommKey</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Bảo mật giao thức socket máy chấm công với khóa kết nối nội bộ</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-[#1b365d] border border-blue-200">
            ZK TCP Active
          </span>
        </div>

        <div className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200/70">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-100 shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800">Kiểm soát phiên đăng nhập (JWT Session)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Thời hạn phiên 7 ngày, tự động thu hồi khi đăng xuất</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-sky-50 text-sky-800 border border-sky-200">
            JWT Active
          </span>
        </div>
      </div>
    </div>
  );
}
