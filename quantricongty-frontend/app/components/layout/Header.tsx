"use client";

import React, { useState } from "react";
import { Search, Bell, ShieldCheck, LogOut, PanelLeftClose, PanelLeftOpen, X } from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { usePermission } from "@/app/hooks/usePermission";
import { getUserDisplayName, getUserPosition } from "@/app/utils/user";

const ROUTE_TITLES: Record<string, string> = {
  "/": "Tổng quan",
  "/dashboard": "Tổng quan",
  "/employees": "Quản lý nhân viên",
  "/departments": "Ban / Phòng",
  "/documents": "Quản lý tài liệu",
  "/attendance": "Chấm công & Điểm danh",
  "/profile": "Trang cá nhân",
  "/approvals": "Trung tâm phê duyệt",
  "/calendar": "Lịch công tác & Sự kiện",
  "/leave": "Xin nghỉ phép",
  "/leave-management": "Quản lý phép nhân viên",
  "/settings": "Cài đặt hệ thống",
};

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    handleLogout,
    searchQuery,
    setSearchQuery,
    isSidebarCollapsed,
    toggleSidebar,
  } = useApp();
  const { isSystemAdmin } = usePermission();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const displayName = getUserDisplayName(currentUser);
  const displayPosition = getUserPosition(currentUser);

  const currentTitle =
    ROUTE_TITLES[pathname] ||
    Object.entries(ROUTE_TITLES).find(([route]) => route !== "/" && pathname.startsWith(route))?.[1] ||
    "Hệ thống điều hành";

  return (
    <>
      <header className="h-[64px] px-5 bg-[#f0f4f8]/95 backdrop-blur-md border-b border-slate-200 flex items-center justify-between sticky top-0 z-20 gap-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Left: Button đóng/mở sidebar + breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-200/80 rounded-xl transition-all shrink-0 cursor-pointer shadow-2xs border border-slate-200/60 bg-white/80"
            title={isSidebarCollapsed ? "Mở rộng thanh menu (Sidebar)" : "Thu gọn thanh menu (Sidebar)"}
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-5 h-5 stroke-[2] text-[#1b365d]" />
            ) : (
              <PanelLeftClose className="w-5 h-5 stroke-[1.8] text-slate-700" />
            )}
          </button>

          <div className="h-5 w-px bg-slate-200" />

          {/* Breadcrumb */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500 font-medium">Đông Hải</span>
            <span className="text-slate-300">/</span>
            <span className="text-base font-bold text-slate-800">
              {currentTitle}
            </span>
          </div>
        </div>

        {/* Middle: search — chỉ hiện khi ở trang nhân sự */}
        {pathname.startsWith("/employees") && (
          <div className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Tìm theo tên, email, phòng ban..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl text-sm bg-white border border-slate-200 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/15 focus:border-[#1b365d]/40 transition-all shadow-2xs"
              />
            </div>
          </div>
        )}

        {/* Right: User account area */}
        <div className="flex items-center gap-3.5 ml-auto">
          {/* Icon chuông thông báo có số badge đỏ phía trên */}
          <button
            type="button"
            title="Thông báo hệ thống"
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded-full transition-colors focus:outline-none"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 min-w-[19px] h-[18px] px-1 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-[#f0f4f8] shadow-xs">
              9+
            </span>
          </button>

          {/* Vạch ngăn cách mờ */}
          <div className="h-6 w-px bg-slate-200/90" />

          {/* Cụm thông tin tài khoản: Icon/Avatar + Tên thật + Chức danh */}
          <div
            onClick={() => router.push("/profile")}
            className="flex items-center gap-2.5 select-none cursor-pointer hover:opacity-85 transition-opacity"
            title={isSystemAdmin ? "Trang cá nhân (Quản trị viên hệ thống)" : "Xem trang cá nhân của bạn"}
          >
            <div
              className={`relative w-9 h-9 rounded-full overflow-hidden flex-shrink-0 shadow-xs bg-slate-100 transition-all ring-2 ring-[#1b365d] border-2 border-white shadow-xs`}
            >
              <Image
                src={
                  currentUser?.avatar ||
                  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80"
                }
                alt={displayName}
                fill
                className="object-cover"
              />
            </div>

            <div className="hidden sm:flex flex-col text-left leading-tight">
              <span className="text-[14px] font-bold text-slate-800 leading-tight">
                {displayName}
              </span>
              <span className="text-[11px] text-slate-500 font-medium leading-normal">
                {displayPosition}
              </span>
            </div>
          </div>

          {/* Nút Đăng xuất riêng biệt ở ngoài cùng bên phải */}
          <button
            type="button"
            onClick={() => setShowLogoutConfirm(true)}
            title="Đăng xuất khỏi hệ thống"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200/90 bg-rose-50/80 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition-all hover:shadow-xs ml-1"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-600" />
            <span className="hidden md:inline">Đăng xuất</span>
          </button>
        </div>
      </header>

      {/* Modal xác nhận đăng xuất đồng bộ giao diện */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 animate-scale-up">
            {/* Header màu xanh đen đồng bộ (#1b365d) */}
            <div className="bg-[#1b365d] p-5 px-6 text-white flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-300 flex items-center justify-center border border-rose-400/30 shrink-0">
                  <LogOut className="w-5.5 h-5.5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold tracking-tight">
                    Xác Nhận Đăng Xuất
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-200 font-normal">
                    Kết thúc phiên làm việc hiện tại trên hệ thống
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nội dung chữ to rõ */}
            <div className="p-6 sm:p-7 text-center space-y-3">
              <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-semibold">
                Bạn có chắc chắn muốn đăng xuất khỏi hệ thống điều hành cho tài khoản{" "}
                <strong className="text-[#1b365d] font-extrabold text-lg sm:text-xl underline decoration-[#1b365d]/30 underline-offset-4">{displayName}</strong>?
              </p>
              <p className="text-xs sm:text-sm text-slate-500 font-medium">
                Mọi dữ liệu làm việc dở dang của phiên làm việc này sẽ được lưu an toàn.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="p-5 px-7 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="px-6 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutConfirm(false);
                  handleLogout();
                }}
                className="px-6 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold shadow-md shadow-rose-600/25 transition-all flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-4.5 h-4.5" />
                <span>Đăng xuất ngay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
