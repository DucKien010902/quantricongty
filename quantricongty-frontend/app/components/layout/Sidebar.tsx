"use client";

import React, { useState, useEffect, useMemo } from "react";
import { API_URL } from "@/app/config/api";
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
  FileSignature,
  Briefcase,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { getUserDisplayName, getUserPosition, getUserSystemRole } from "@/app/utils/user";
import { usePermission } from "@/app/hooks/usePermission";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const {
    currentUser,
    employees,
    setIsCompanyModalOpen,
    isSidebarCollapsed,
  } = useApp();

  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(0);

  const currentEmployee = useMemo(() => {
    if (!currentUser) return null;
    return (
      employees?.find(
        (e) =>
          (e.code && e.code === currentUser.code) ||
          (e.email && e.email.toLowerCase() === (currentUser.email || "").toLowerCase()) ||
          e.name === currentUser.name
      ) || currentUser
    );
  }, [currentUser, employees]);

  // Tab phê duyệt: CHỈ CÓ ADMIN VÀ TRƯỞNG PHÒNG / TRƯỞNG BAN THẤY VÀ VÀO TRANG
  const canAccessApprovals = useMemo(() => {
    const emp = currentEmployee || currentUser;
    if (!emp) return false;
    const role = (emp.role || "").toUpperCase();
    if (role === "ADMIN") return true;

    const pos = (emp.position || emp.jobTitle || "").toLowerCase();
    const level = (emp.positionLevel || "").toLowerCase();

    const isLeaderTitle =
      pos.includes("trưởng") ||
      pos.includes("giám đốc") ||
      pos.includes("phụ trách") ||
      level.includes("trưởng") ||
      level.includes("quản trị");

    return isLeaderTitle || role === "LEADER" || role === "MANAGER";
  }, [currentUser, currentEmployee]);


  useEffect(() => {
    let isMounted = true;
    if (!canAccessApprovals) {
      setPendingApprovalsCount(0);
      return;
    }

    const fetchPending = async () => {
      try {
        const res = await fetch(`${API_URL}/approvals`);
        if (!res.ok) return;
        const approvals = await res.json();
        if (!Array.isArray(approvals) || !isMounted) return;

        const role = (currentUser?.role || currentEmployee?.role || "").toUpperCase();
        const dept = (currentUser?.department || currentEmployee?.department || "").toLowerCase();
        const pos = (currentUser?.position || currentEmployee?.position || currentEmployee?.jobTitle || "").toLowerCase();
        const level = (currentUser?.positionLevel || currentEmployee?.positionLevel || "").toLowerCase();
        const code = currentEmployee?.code || currentUser?.code || "";

        const isLeaderTitle =
          pos.includes("trưởng") ||
          pos.includes("giám đốc") ||
          pos.includes("phụ trách") ||
          level.includes("trưởng") ||
          level.includes("quản trị");

        const isAdminRole = role === "ADMIN";
        const isDepartmentLeader = isLeaderTitle || role === "LEADER" || role === "MANAGER";

        if (!isDepartmentLeader && !isAdminRole) {
          setPendingApprovalsCount(0);
          return;
        }

        // Đơn đang chờ mà người này có thẩm quyền duyệt
        const count = approvals.filter((item: any) => {
          // 1. Không tính đơn do chính mình tạo
          const isMine =
            (item.requesterCode && (item.requesterCode === code || item.requesterCode === currentUser?.id)) ||
            (item.requesterName && item.requesterName === currentUser?.name);
          if (isMine) return false;

          // 2. Nếu là Admin nghiệp vụ:
          // Tính các đơn chờ duyệt Cấp 2 (PENDING_HR) và các đơn đề nghị hủy (REQUEST_CANCEL)
          if (isAdminRole) {
            return item.status === "PENDING_HR" || item.status === "REQUEST_CANCEL";
          }

          // 3. Nếu là Trưởng ban chuyên môn khác (như Ban CNTT):
          // Chỉ tính các đơn thuộc ban mình VÀ đang ở trạng thái PENDING_LEADER (chờ Cấp 1)
          if (isDepartmentLeader) {
            return (item.department || "").toLowerCase() === dept && item.status === "PENDING_LEADER";
          }

          return false;
        }).length;

        setPendingApprovalsCount(count);
      } catch {
        // ignore
      }
    };

    fetchPending();
    const timer = setInterval(fetchPending, 10000);
    const handleApprovalChanged = () => fetchPending();
    window.addEventListener("approval-changed", handleApprovalChanged);

    return () => {
      isMounted = false;
      clearInterval(timer);
      window.removeEventListener("approval-changed", handleApprovalChanged);
    };
  }, [currentUser, currentEmployee, canAccessApprovals]);

  const { can, isSystemAdmin } = usePermission();
  const canViewDashboard = can("dashboard.view");
  const canViewEmployees = can("employees.view");
  const canViewLeaveManagement = can("leave_management.view");
  const canViewContracts = can("contracts.view");

  const navGroups = [
    {
      title: "Bạn",
      items: [
        ...(canViewDashboard ? [{ href: "/", label: "Trang chủ", icon: Home }] : []),
        { href: "/profile", label: "Trang cá nhân", icon: UserCircle },
        { href: "/calendar", label: "Lịch", icon: Calendar },
      ],
    },
    {
      title: "Công ty",
      items: [
        ...(canViewEmployees ? [{ href: "/employees", label: "Quản lý nhân viên", icon: Users }] : []),
        { href: "/departments", label: "Ban / Phòng", icon: Building2 },
        { href: "/documents", label: "Quản lý tài liệu", icon: FileText },
        ...(canViewContracts
          ? [{ href: "/contracts", label: "Công cụ tạo hợp đồng", icon: FileSignature }]
          : []),
        ...(canViewLeaveManagement
          ? [{ href: "/leave-management", label: "Quản lý phép nhân viên", icon: CalendarCheck }]
          : []),
      ],
    },
    {
      title: "Ứng dụng",
      items: [
        { href: "/attendance", label: "Chấm công - Thời gian làm việc", icon: CalendarCheck },
        { href: "/leave", label: "Xin nghỉ phép", icon: Clock },
        { href: "/business-trips", label: "Đăng ký & Lịch Công tác", icon: Briefcase },
        ...(canAccessApprovals
          ? [
            {
              href: "/approvals",
              label: "Phê duyệt",
              icon: ClipboardCheck,
              badge: pendingApprovalsCount > 0 ? String(pendingApprovalsCount) : undefined,
            },
          ]
          : []),
      ],
    },
    ...(isSystemAdmin
      ? [
        {
          title: "Hệ thống",
          items: [
            { href: "/settings", label: "Cài đặt hệ thống", icon: Settings },
          ],
        },
      ]
      : []),
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
      className={`${isSidebarCollapsed
        ? "w-0 min-w-0 opacity-0 pointer-events-none border-r-0 overflow-hidden"
        : "w-72 min-w-[288px] opacity-100"
        } bg-[#f0f4f8] border-r border-slate-200 flex flex-col flex-shrink-0 h-screen sticky top-0 select-none z-30 transition-all duration-200 ease-in-out shadow-[1px_0_6px_rgba(0,0,0,0.02)]`}
    >
      {/* Logo + Tên công ty chuẩn ban đầu */}
      <div className="h-[64px] px-5 flex items-center border-b border-slate-200 bg-[#e9eef4]">
        <Link href={canViewDashboard ? "/" : "/attendance"} className="flex items-center gap-3 min-w-0 flex-1">
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
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3.5 pt-2 pb-1">
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
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[14.5px] transition-all ${
                    isActive
                      ? "bg-[#1b365d] text-white shadow-sm font-semibold"
                      : "text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 font-medium"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon
                      className={`w-4.5 h-4.5 shrink-0 stroke-[2.3] ${
                        isActive ? "text-white" : "text-slate-500"
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? "bg-white/20 text-white"
                          : "bg-slate-200 text-slate-700"
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
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-3.5 pb-1">
            Cài đặt & Tiện ích
          </p>

          {/* Hồ sơ công ty */}
          <button
            type="button"
            onClick={() => setIsCompanyModalOpen(true)}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-[14.5px] font-medium transition-all text-slate-700 hover:text-slate-900 hover:bg-slate-200/70 cursor-pointer"
            title="Hồ sơ công ty"
          >
            <Building className="w-4.5 h-4.5 text-slate-500 stroke-[2.3] shrink-0" />
            <span>Hồ sơ công ty</span>
          </button>
        </div>
      </nav>

      {/* Bottom: avatar nhỏ — click để mở trang cá nhân */}
      <div
        className={`px-4 py-3.5 border-t border-slate-200 flex items-center gap-3 cursor-pointer hover:bg-slate-200/60 transition-colors ${
          pathname.startsWith("/profile") ? "bg-slate-200/80 font-semibold" : ""
        }`}
        onClick={() => router.push("/profile")}
        title={isSystemAdmin ? "Trang cá nhân (Quản trị viên hệ thống)" : "Xem trang cá nhân của bạn"}
      >
        <div
          className={`relative w-9.5 h-9.5 rounded-full overflow-hidden flex-shrink-0 shadow-xs bg-slate-100 transition-all ring-2 ring-[#1b365d] border-2 border-white shadow-xs`}
        >
          <Image
            src={currentUser?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80"}
            alt="Avatar"
            fill
            className="object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-bold text-slate-800 truncate">
            {getUserDisplayName(currentUser)}
          </p>
          <p className="text-[11.5px] text-slate-500 font-semibold truncate">
            {getUserSystemRole(currentUser)}
          </p>
        </div>
      </div>
    </aside>
  );
}
