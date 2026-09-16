"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { usePermission } from "@/app/hooks/usePermission";
import DashboardView from "./components/DashboardView";

export default function DashboardPage() {
  const router = useRouter();
  const { employees, departments, company, currentUser, isAuthLoaded } = useApp();
  const { can } = usePermission();

  const canViewDashboard = can("dashboard.view");

  useEffect(() => {
    if (isAuthLoaded && currentUser && !canViewDashboard) {
      router.replace("/attendance");
    }
  }, [isAuthLoaded, currentUser, canViewDashboard, router]);

  if (!isAuthLoaded || !currentUser) {
    return null;
  }

  if (!canViewDashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          Bạn không có quyền truy cập Trang chủ
        </h2>
        <p className="text-sm text-slate-500 mb-4 max-w-md">
          Tài khoản cán bộ nhân viên được chuyển hướng trực tiếp đến trang Chấm công & Ứng dụng.
        </p>
        <button
          onClick={() => router.replace("/attendance")}
          className="px-4 py-2 bg-[#1b365d] text-white text-xs font-semibold rounded-xl hover:bg-[#152a4a] transition-all"
        >
          Đi tới Chấm công & Thời gian làm việc
        </button>
      </div>
    );
  }

  return (
    <DashboardView
      employees={employees}
      departments={departments}
      company={company}
      onGoToEmployees={() => router.push("/employees")}
      onGoToDepartments={() => router.push("/departments")}
    />
  );
}
