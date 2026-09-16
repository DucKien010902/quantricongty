"use client";

import React from "react";
import {
  Home,
  UserCircle,
  Calendar,
  Users,
  Building2,
  FileText,
  CalendarCheck,
  Clock,
  Settings,
  Building,
  ClipboardCheck,
  Sparkles,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { getUserDisplayName, getUserPosition, getUserSystemRole } from "@/app/utils/user";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    setIsCompanyModalOpen,
    setIsWizardActive,
    isSidebarCollapsed,
  } = useApp();

  const navGroups = [
    {
      title: "Bạn",
      items: [
        { href: "/", label: "Trang chủ", icon: Home },
        { href: "/profile", label: "Trang cá nhân", icon: UserCircle },
        { href: "/calendar", label: "Lịch", icon: Calendar },
      ],
    },
    {
      title: "Công ty",
      items: [
        { href: "/employees", label: "Quản lý nhân viên", icon: Users },
        { href: "/departments", label: "Ban / Phòng", icon: Building2 },
        { href: "/documents", label: "Quản lý tài liệu", icon: FileText },
        { href: "/leave-management", label: "Quản lý phép nhân viên", icon: CalendarCheck },
      ],
    },
    {
      title: "Ứng dụng",
      items: [
        { href: "/attendance", label: "Chấm công - Thời gian làm việc", icon: CalendarCheck },
        { href: "/leave", label: "Xin nghỉ phép", icon: Clock },
        { href: "/approvals", label: "Phê duyệt", icon: ClipboardCheck, badge: "5" },
      ],
    },
    {
      title: "Hệ thống",
      items: [
        { href: "/settings", label: "Cài đặt hệ thống", icon: Settings },
      ],
    },
  ];

  const getIsActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/dashboard";
    }
    if (href === "/leave") {
      return pathname === "/leave";
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`${
        isSidebarCollapsed
          ? "w-0 min-w-0 opacity-0 pointer-events-none border-r-0 overflow-hidden"
          : "w-72 min-w-[288px] opacity-100"
      } bg-[#f0f4f8] border-r border-slate-200 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none z-30 transition-all duration-200 ease-in-out shadow-[1px_0_6px_rgba(0,0,0,0.02)]`}
    >
      {/* Logo + Tên công ty chuẩn ban đầu */}
      <div className="h-[64px] px-5 flex items-center border-b border-slate-200 bg-[#e9eef4]">
        <Link href="/" className="flex items-center gap-3 min-w-0 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 shadow-xs">
            <Image
              src="/donghai-logo.png"
              alt="Logo Đông Hải"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-base font-bold tracking-tight text-[#1b365d] leading-tight">
              ĐÔNG HẢI
            </span>
            <span className="text-xs text-slate-500 font-medium mt-0.5">
              Quản trị nội bộ
            </span>
          </div>
        </Link>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3.5 py-3 space-y-3.5 overflow-y-auto">
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} className="space-y-1">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3.5 pt-2 pb-0.5">
              {group.title}
            </p>

            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = getIsActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? "bg-[#1b365d] text-white shadow-sm font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive ? "text-white" : "text-slate-400"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Separator / Tiện ích */}
        <div className="pt-2 border-t border-slate-200 space-y-1">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3.5 pb-0.5">
            Cài đặt & Tiện ích
          </p>

          {/* Hồ sơ công ty */}
          <button
            type="button"
            onClick={() => setIsCompanyModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 cursor-pointer"
            title="Hồ sơ công ty"
          >
            <Building className="w-4 h-4 text-slate-400 shrink-0" />
            <span>Hồ sơ công ty</span>
          </button>

          {/* Wizard Khởi tạo */}
          <button
            type="button"
            onClick={() => setIsWizardActive(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all text-[#1b365d] bg-blue-100/60 hover:bg-blue-100/90 cursor-pointer"
            title="Wizard Khởi Tạo"
          >
            <Sparkles className="w-4 h-4 text-[#1b365d] shrink-0" />
            <span>Wizard Khởi Tạo</span>
          </button>
        </div>
      </nav>

      {/* Bottom: avatar nhỏ — click để mở trang cá nhân */}
      <div
        className={`px-4 py-3.5 border-t border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-200/60 transition-colors ${
          pathname.startsWith("/profile") ? "bg-slate-200/80 font-semibold" : ""
        }`}
        onClick={() => router.push("/profile")}
        title="Xem trang cá nhân của bạn"
      >
        <div className="relative w-9 h-9 rounded-full overflow-hidden ring-2 ring-slate-200/90 flex-shrink-0 shadow-xs bg-slate-100">
          <Image
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80"}
            alt="Avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold text-slate-800 truncate">
            {getUserDisplayName(currentUser)}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold truncate">
            {getUserSystemRole(currentUser)}
          </p>
        </div>
      </div>
    </aside>
  );
}
