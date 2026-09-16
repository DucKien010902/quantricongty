"use client";

import React from "react";
import { Users, UserCheck, Clock, Mail } from "lucide-react";
import { Employee } from "@/app/data/seed-employees";

interface StatsOverviewProps {
  employees: Employee[];
}

export default function StatsOverview({ employees }: StatsOverviewProps) {
  const total = employees.length;
  const activeCount = employees.filter((e) => e.status === "active").length;
  const probationCount = employees.filter((e) => e.status === "probation").length;
  const invitedCount = employees.filter((e) => (e as any).status === "invited").length;

  const stats = [
    {
      label: "Tổng số nhân sự",
      value: total,
      desc: "Toàn bộ cán bộ công ty",
      icon: Users,
      color: "bg-blue-50/80 text-[#1b365d]",
    },
    {
      label: "Chính thức",
      value: activeCount,
      desc: "Nhân viên hợp đồng",
      icon: UserCheck,
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Thử việc",
      value: probationCount,
      desc: "Đang trong kỳ thử việc",
      icon: Clock,
      color: "bg-amber-50 text-amber-700",
    },
    {
      label: "Đã gửi thư mời",
      value: invitedCount,
      desc: "Chờ tham gia hệ thống",
      icon: Mail,
      color: "bg-indigo-50 text-indigo-700",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between hover:shadow-sm transition-shadow"
          >
            <div className="space-y-0.5">
              <span className="text-xs font-medium text-slate-500">
                {item.label}
              </span>
              <p className="text-2xl font-semibold text-[#1b365d] tracking-tight">
                {item.value}
              </p>
              <p className="text-[11px] text-slate-400 font-normal">{item.desc}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
              <Icon className="w-5 h-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
