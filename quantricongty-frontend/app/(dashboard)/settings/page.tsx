"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  ShieldAlert,
  Home,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useApp } from "@/app/context/AppContext";
import { usePermission } from "@/app/hooks/usePermission";
import { POSITION_LEVELS, PositionLevel, Employee } from "@/app/data/seed-employees";
import {
  getStoredPermissionMatrix,
  saveStoredPermissionMatrix,
  PermissionGroup,
} from "@/app/utils/permissions";

// Sub-components
import SettingsNav, { SettingsTabId } from "./components/SettingsNav";
import RolesTab from "./components/RolesTab";
import ShiftsTab from "./components/ShiftsTab";
import DeviceTab from "./components/DeviceTab";
import CompanyTab from "./components/CompanyTab";
import SecurityTab from "./components/SecurityTab";

export default function SettingsPage() {
  const { company, employees, showToast, loadData, currentUser, isAuthLoaded } = useApp();
  const {
    isSystemAdmin,
    systemAdmins,
    assignSystemAdmin,
    transferSystemAdmin,
    revokeSystemAdmin,
  } = usePermission();

  const [activeTab, setActiveTab] = useState<SettingsTabId>("roles");
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);

  // ==================== CƠ CẤU CHỨC DANH ====================
  const [positions, setPositions] = useState<PositionLevel[]>(POSITION_LEVELS);

  const handleAddPosition = (newPos: PositionLevel) => {
    setPositions((prev) => [...prev, newPos]);
    showToast(`Đã thêm chức danh "${newPos.name}" vào danh mục cài đặt!`);
  };

  const handleDeletePosition = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa chức danh "${name}" khỏi danh mục?`)) {
      setPositions((prev) => prev.filter((p) => p.id !== id));
      showToast(`Đã xóa chức danh "${name}".`);
    }
  };

  // ==================== MA TRẬN PHÂN QUYỀN ====================
  const [permissions, setPermissions] = useState<PermissionGroup[]>([]);

  useEffect(() => {
    setPermissions(getStoredPermissionMatrix());
  }, []);

  const handleTogglePermission = (
    groupIndex: number,
    itemIndex: number,
    roleKey: "admin" | "leader" | "employee" | "hr"
  ) => {
    const updated = [...permissions];
    const currentVal = updated[groupIndex].items[itemIndex][roleKey];
    updated[groupIndex].items[itemIndex][roleKey] = !currentVal;
    setPermissions(updated);
  };

  const handleSavePermissions = () => {
    saveStoredPermissionMatrix(permissions);
    showToast("Đã lưu ma trận phân quyền hệ thống thành công!");
  };

  // Handlers for System Admin
  const handleAssignAdmin = (employee: Employee) => {
    const res = assignSystemAdmin(employee);
    showToast(res.message);
  };

  const handleTransferAdmin = (fromCode: string, toEmployee: Employee) => {
    const res = transferSystemAdmin(fromCode, toEmployee);
    showToast(res.message);
  };

  const handleRevokeAdmin = (code: string) => {
    if (confirm("Bạn có chắc chắn muốn thu hồi Quyền quản trị viên hệ thống của tài khoản này không?")) {
      const res = revokeSystemAdmin(code);
      showToast(res.message);
    }
  };

  // Bảo vệ đường dẫn: Chỉ Quản trị viên hệ thống mới có quyền truy cập
  if (isAuthLoaded && currentUser && !isSystemAdmin) {
    return (
      <div className="min-h-[65vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200/90 shadow-xl p-8 text-center space-y-5 animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100 shadow-inner">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              Giới hạn quyền truy cập
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed font-normal">
              Khu vực <b>Cài đặt hệ thống</b> chỉ dành riêng cho <b>Quản trị viên Hệ thống (System Admin)</b> để thiết lập cấu hình kỹ thuật, kết nối thiết bị và phân quyền toàn doanh nghiệp.
            </p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 font-medium text-left">
            <div>Tài khoản: <b className="text-slate-900">{currentUser?.name}</b></div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Vai trò hệ thống: <span className="text-slate-700 font-semibold">USER (Người dùng thông thường)</span>
            </div>
          </div>
          <div className="pt-2">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold transition-all shadow-md shadow-[#1b365d]/20"
            >
              <Home className="w-4 h-4" />
              <span>Quay về trang chủ</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-3.5">
        <h1 className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#1b365d]" />
          <span>Cài Đặt Hệ Thống</span>
        </h1>
      </div>

      {/* Main 2-Column Sidebar Layout */}
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Left Sub-Sidebar Navigation */}
        <SettingsNav
          activeTab={activeTab}
          onChangeTab={setActiveTab}
          isCollapsed={isNavCollapsed}
          onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
        />

        {/* Right Tab Content */}
        <div className="flex-1 w-full min-w-0">
          {activeTab === "roles" && (
            <RolesTab
              employees={employees}
              systemAdmins={systemAdmins}
              onAssignAdmin={handleAssignAdmin}
              onTransferAdmin={handleTransferAdmin}
              onRevokeAdmin={handleRevokeAdmin}
              positions={positions}
              onAddPosition={handleAddPosition}
              onDeletePosition={handleDeletePosition}
              permissions={permissions}
              onTogglePermission={handleTogglePermission}
              onSavePermissions={handleSavePermissions}
            />
          )}

          {activeTab === "shifts" && (
            <ShiftsTab showToast={showToast} />
          )}

          {activeTab === "device" && (
            <DeviceTab showToast={showToast} />
          )}

          {activeTab === "company" && (
            <CompanyTab
              company={company}
              loadData={loadData}
              showToast={showToast}
            />
          )}

          {activeTab === "security" && (
            <SecurityTab />
          )}
        </div>
      </div>
    </div>
  );
}
