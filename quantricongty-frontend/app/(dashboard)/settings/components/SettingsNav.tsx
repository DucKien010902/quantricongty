"use client";

import React from "react";
import {
  ShieldCheck,
  Clock,
  Server,
  Building,
  Lock,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export type SettingsTabId = "roles" | "shifts" | "device" | "company" | "security";

interface SettingsNavProps {
  activeTab: SettingsTabId;
  onChangeTab: (tab: SettingsTabId) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
}

const SETTINGS_ITEMS: {
  id: SettingsTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: "roles",
    label: "Phân Quyền & Chức Danh",
    icon: ShieldCheck,
  },
  {
    id: "shifts",
    label: "Quy Định Ca & Nghỉ Lễ",
    icon: Clock,
  },
  {
    id: "device",
    label: "Máy Chấm Công",
    icon: Server,
  },
  {
    id: "company",
    label: "Thông Tin Doanh Nghiệp",
    icon: Building,
  },
  {
    id: "security",
    label: "Bảo Mật & Xác Thực",
    icon: Lock,
  },
];

export default function SettingsNav({
  activeTab,
  onChangeTab,
  isCollapsed,
  onToggleCollapse,
}: SettingsNavProps) {
  return (
    <div
      className={`bg-transparent transition-all duration-200 flex-shrink-0 flex flex-col justify-between ${
        isCollapsed ? "w-14" : "w-full lg:w-64"
      }`}
    >
      <div className="space-y-2">
        <div className="px-3.5 py-1.5 flex items-center justify-between">
          {!isCollapsed && (
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Cài Đặt Hệ Thống
            </span>
          )}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={isCollapsed ? "Mở rộng" : "Thu gọn"}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors mx-auto lg:mx-0 cursor-pointer"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        <div className="space-y-2">
          {SETTINGS_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-left transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#1b365d] text-white shadow-sm font-semibold"
                    : "text-slate-700 hover:bg-slate-200/70 hover:text-slate-900 font-medium"
                }`}
              >
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 stroke-[2.3] transition-colors ${
                    isActive ? "text-white" : "text-slate-500"
                  }`}
                />

                {!isCollapsed && (
                  <span className="text-[14.5px] truncate">{item.label}</span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
