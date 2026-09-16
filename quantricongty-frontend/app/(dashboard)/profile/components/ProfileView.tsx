"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  Camera,
  Edit3,
  Copy,
  Check,
  Building2,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  CreditCard,
  FileText,
  Lock,
  Sparkles,
  MapPin,
  Heart,
  Globe,
  Award,
  Download,
  ExternalLink,
} from "lucide-react";
import EditProfileWizardModal from "./EditProfileWizardModal";
import { DepartmentInfo } from "@/app/data/seed-employees";

import DocumentTypeIcon from "@/app/components/ui/DocumentTypeIcon";

interface ProfileViewProps {
  currentUser: any;
  departments: DepartmentInfo[];
  onUpdateUser: (updatedUser: any) => void;
  onGoToTab?: (tab: string) => void;
}

const PROFILE_TABS = [
  { id: "overview", label: "Tóm tắt" },
  { id: "personal", label: "Cá nhân" },
  { id: "job", label: "Công việc" },
  { id: "benefits", label: "Chế độ đãi ngộ" },
  { id: "tax", label: "Tuân thủ & Thuế" },
  { id: "contact", label: "Liên hệ" },
  { id: "documents", label: "Tài liệu" },
  { id: "permissions", label: "Vai trò & Chức năng" },
];

export default function ProfileView({
  currentUser,
  departments,
  onUpdateUser,
}: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string, fieldKey: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldKey);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Avatar change handler
  const handleAvatarChange = () => {
    const newAvatar = prompt(
      "Nhập link URL ảnh đại diện mới của bạn:",
      currentUser?.avatar || ""
    );
    if (newAvatar && newAvatar.trim() !== "") {
      onUpdateUser({ ...currentUser, avatar: newAvatar.trim() });
    }
  };

  const displayName = currentUser?.name || "Nguyễn Đức Kiên";
  const displayCode = currentUser?.code || currentUser?.id || "ĐH0050";
  const displayPosition = currentUser?.position || "Nhân viên IT";
  const displayDepartment = currentUser?.department || "Ban Công nghệ Thông tin & Chuyển đổi số";

  return (
    <div className="space-y-6">
      {/* ======================= PROFILE HEADER BANNER ======================= */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Banner cover */}
        <div className="h-36 sm:h-44 bg-gradient-to-r from-[#1b365d] via-[#24487a] to-[#2c5b96] relative">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
        </div>

        {/* User Info Header Box */}
        <div className="px-6 sm:px-8 pb-6 relative">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-16 sm:-mt-20">
            {/* Avatar with Camera Icon */}
            <div className="relative group w-28 h-28 sm:w-32 sm:h-32 rounded-3xl overflow-hidden ring-4 ring-white shadow-xl bg-slate-100 flex-shrink-0">
              <Image
                src={currentUser?.avatar || "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80"}
                alt={displayName}
                fill
                className="object-cover object-top"
                priority
              />
              <button
                type="button"
                onClick={handleAvatarChange}
                title="Thay đổi ảnh đại diện"
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
              >
                <Camera className="w-6 h-6" />
                <span className="text-[11px] font-medium mt-1">Đổi ảnh</span>
              </button>
            </div>

            {/* Quick Actions Right */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsEditModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-semibold shadow-xs transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Chỉnh sửa hồ sơ</span>
              </button>
            </div>
          </div>

          {/* User Name & Status Badge Line */}
          <div className="mt-4 sm:mt-5 flex flex-wrap items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight">
              {displayName}
            </h1>

            {/* Huy hiệu hoạt động */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Hoạt động</span>
            </div>

            {/* Nút Edit nhỏ cạnh chữ hoạt động đúng như người dùng yêu cầu */}
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              title="Chỉnh sửa thông tin nhanh"
              className="p-1.5 text-slate-400 hover:text-[#1b365d] hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <span className="text-xs font-mono font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200">
              {displayCode}
            </span>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5 text-slate-700 font-semibold">
              <Building2 className="w-4 h-4 text-slate-400" />
              {displayDepartment}
            </span>
            <span>•</span>
            <span className="text-[#1b365d] font-bold">{displayPosition}</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {currentUser?.location || "Hà Nội"}
            </span>
          </div>
        </div>

        {/* Dải Tabs điều hướng mượt mà */}
        <div className="px-6 sm:px-8 border-t border-slate-100 flex items-center gap-1 overflow-x-auto select-none no-scrollbar">
          {PROFILE_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`py-3.5 px-4 text-xs sm:text-sm font-semibold transition-all whitespace-nowrap border-b-2 -mb-px ${
                  isActive
                    ? "border-[#1b365d] text-[#1b365d] font-bold"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ======================= TAB CONTENTS ======================= */}

      {/* TAB 1: TỔNG QUAN / TÓM TẮT */}
      {activeTab === "overview" && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* 4 Stat highlight cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400">Hiệu suất KPI</p>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {currentUser?.performance || 99}%
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Đánh giá xuất sắc</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400">Dự án tham gia</p>
              <p className="text-2xl font-black text-emerald-600 mt-1">
                {currentUser?.projectsCount || 16}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Dự án trọng điểm</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400">Khung lương</p>
              <p className="text-2xl font-black text-indigo-600 mt-1">
                {currentUser?.salaryGrade || "Bậc 10"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Lãnh đạo cấp cao</p>
            </div>

            <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs">
              <p className="text-xs font-semibold text-slate-400">Ngày gia nhập</p>
              <p className="text-xl font-bold text-slate-800 mt-1.5">
                {currentUser?.joinDate || "01/01/2021"}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">Hơn 5 năm cống hiến</p>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1b365d]" />
                Tóm tắt pháp lý & nhân sự
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Mã nhân sự:</span>
                  <span className="font-mono font-bold text-slate-800">{displayCode}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Số CCCD:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {currentUser?.idNumber || "001095012345"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Mã số thuế:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {currentUser?.taxCode || "8492019281"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Số BHXH:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {currentUser?.socialInsuranceNo || "7916291029"}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-4">
              <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-600" />
                Tài khoản ngân hàng & Liên hệ
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Số tài khoản:</span>
                  <span className="font-mono font-bold text-slate-800">
                    {currentUser?.bankAccount || "1903482910299"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Ngân hàng:</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser?.bankName || "Techcombank"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Điện thoại:</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser?.phone || "0912 345 678"}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-100">
                  <span className="text-slate-500">Email:</span>
                  <span className="font-semibold text-slate-800">
                    {currentUser?.email || "kien.nguyen@donghaiinvest.vn"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: CÁ NHÂN (Theo đúng layout ảnh người dùng cung cấp) */}
      {activeTab === "personal" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Thông tin cá nhân</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {/* Mã nhân viên */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Mã nhân viên</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:w-2/3">
                <span className="font-mono">{displayCode}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(displayCode, "code")}
                  title="Sao chép mã"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                >
                  {copiedField === "code" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Họ và tên */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Họ và tên</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {displayName}
              </span>
            </div>

            {/* Ngày sinh */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Ngày sinh</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.dob || "15/08/1995"}
              </span>
            </div>

            {/* Giới tính */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Giới tính</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.gender || "Nam"}
              </span>
            </div>

            {/* Email công việc */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Email công việc</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:w-2/3">
                <span>{currentUser?.email || "kien.nguyen@donghaiinvest.vn"}</span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentUser?.email || "", "email")}
                  title="Sao chép email"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                >
                  {copiedField === "email" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Tình trạng hôn nhân */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Tình trạng hôn nhân</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.maritalStatus === "Độc thân" || !currentUser?.maritalStatus
                  ? "SINGLE (Độc thân)"
                  : currentUser?.maritalStatus}
              </span>
            </div>

            {/* Quốc tịch */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Quốc tịch</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3 flex items-center gap-2">
                <span>🇻🇳</span>
                <span>{currentUser?.nationality || "Việt Nam"}</span>
              </span>
            </div>

            {/* Dân tộc */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Dân tộc</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.ethnic || "Kinh"}
              </span>
            </div>

            {/* Tôn giáo */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Tôn giáo</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.religion || "Không"}
              </span>
            </div>

            {/* Quê quán / Nguyên quán */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Nguyên quán</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.hometown || "Hà Nội"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: CÔNG VIỆC */}
      {activeTab === "job" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Thông tin công việc & Hợp đồng</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Ban / Khối chuyên môn</span>
              <span className="text-sm font-bold text-slate-800 sm:w-2/3">
                {displayDepartment}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Chức danh / Vị trí</span>
              <span className="text-sm font-bold text-[#1b365d] sm:w-2/3">
                {displayPosition}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Cấp bậc quản lý</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.workLevel || "Lãnh đạo cấp cao (C-Level)"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Loại hợp đồng lao động</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.contractType || "Hợp đồng lao động không xác định thời hạn"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Ngày bắt đầu vào làm</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.joinDate || "01/01/2021"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Người quản lý trực tiếp</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.directManager || "Đại hội đồng Cổ đông / HĐQT"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Địa điểm công tác</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.location || "Trụ sở chính Hà Nội"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Trình độ học vấn</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.education || "Thạc sĩ Quản trị Kinh doanh (MBA)"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: CHẾ ĐỘ ĐÃI NGỘ & NGÂN HÀNG */}
      {activeTab === "benefits" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Chế độ đãi ngộ & Tài khoản ngân hàng</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Bậc lương hiện tại</span>
              <span className="text-sm font-bold text-slate-800 sm:w-2/3">
                {currentUser?.salaryGrade || "Bậc 10 (Executive)"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Lương cơ bản</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.baseSalary || "Thỏa thuận Lãnh đạo cấp cao"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Số tài khoản nhận lương</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:w-2/3">
                <span className="font-mono font-bold text-[#1b365d]">
                  {currentUser?.bankAccount || "1903482910299"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentUser?.bankAccount || "1903482910299", "bankAccount")}
                  title="Sao chép số tài khoản"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                >
                  {copiedField === "bankAccount" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Ngân hàng thụ hưởng</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.bankName || "Techcombank (Ngân hàng TMCP Kỹ thương Việt Nam)"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Chi nhánh ngân hàng</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.bankBranch || "Hội sở Ba Đình - TP. Hà Nội"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TUÂN THỦ, ĐỊNH DANH & THUẾ */}
      {activeTab === "tax" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">
              Định danh pháp lý, Thuế & Bảo hiểm xã hội
            </h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {/* CCCD */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Số Căn cước công dân (CCCD)</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:w-2/3">
                <span className="font-mono font-bold text-slate-900">
                  {currentUser?.idNumber || "001095012345"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentUser?.idNumber || "001095012345", "idNumber")}
                  title="Sao chép số CCCD"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                >
                  {copiedField === "idNumber" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Ngày cấp */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Ngày cấp</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.idIssueDate || "12/04/2021"}
              </span>
            </div>

            {/* Nơi cấp */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Nơi cấp</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.idIssuePlace || "Cục Cảnh sát QLHC về trật tự xã hội"}
              </span>
            </div>

            {/* MST */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Mã số thuế cá nhân (MST)</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:w-2/3">
                <span className="font-mono font-bold text-slate-900">
                  {currentUser?.taxCode || "8492019281"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentUser?.taxCode || "8492019281", "taxCode")}
                  title="Sao chép MST"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                >
                  {copiedField === "taxCode" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Cơ quan thuế */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Cơ quan thuế quản lý</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.taxAuthority || "Chi cục Thuế TP. Hà Nội"}
              </span>
            </div>

            {/* BHXH */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Mã số Bảo hiểm xã hội (BHXH)</span>
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-800 sm:w-2/3">
                <span className="font-mono font-bold text-slate-900">
                  {currentUser?.socialInsuranceNo || "7916291029"}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(currentUser?.socialInsuranceNo || "7916291029", "socialInsuranceNo")}
                  title="Sao chép BHXH"
                  className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                >
                  {copiedField === "socialInsuranceNo" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* BHYT */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Mã số thẻ BHYT</span>
              <span className="text-sm font-mono font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.healthInsuranceNo || "DN4791629102901"}
              </span>
            </div>

            {/* Bệnh viện */}
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Nơi ĐK khám chữa bệnh ban đầu</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.hospital || "Bệnh viện Hữu Nghị Việt Đức - Hà Nội"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: LIÊN HỆ */}
      {activeTab === "contact" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden animate-in fade-in duration-150">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Thông tin liên hệ & Địa chỉ cư trú</h3>
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              Chỉnh sửa
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Số điện thoại di động</span>
              <a
                href={`tel:${currentUser?.phone || "0912345678"}`}
                className="text-sm font-bold text-blue-600 hover:underline sm:w-2/3"
              >
                {currentUser?.phone || "0912 345 678"}
              </a>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Email công việc</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.email || "kien.nguyen@donghaiinvest.vn"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Email cá nhân</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.personalEmail || "kien8438@gmail.com"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Địa chỉ thường trú</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.permanentAddress || "Số 68 Phố Huế, P. Hàng Bài, Q. Hoàn Kiếm, TP. Hà Nội"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Địa chỉ hiện tại / tạm trú</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.currentAddress || "Biệt thự Hoa Lan, Vinhomes Riverside, P. Phúc Đồng, Long Biên, Hà Nội"}
              </span>
            </div>

            <div className="px-6 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-1 hover:bg-slate-50/60 transition-colors">
              <span className="text-sm text-slate-500 sm:w-1/3">Người liên hệ khẩn cấp</span>
              <span className="text-sm font-semibold text-slate-800 sm:w-2/3">
                {currentUser?.emergencyContactName || "Nguyễn Văn Nam (Bố ruột) - 0903 219 888"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: TÀI LIỆU HỒ SƠ */}
      {activeTab === "documents" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-4 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-lg font-bold text-slate-800">Hồ sơ & Tài liệu đính kèm</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Các bản scan hợp đồng, giấy tờ định danh và bằng cấp chứng chỉ
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {[
              {
                name: "Hợp đồng lao động bổ nhiệm CEO",
                size: "2.4 MB",
                date: "01/01/2021",
                type: "PDF",
              },
              {
                name: "Bản sao CCCD gắn chip (2 mặt)",
                size: "1.1 MB",
                date: "12/04/2021",
                type: "PDF",
              },
              {
                name: "Bằng Thạc sĩ Quản trị Kinh doanh (MBA)",
                size: "3.8 MB",
                date: "15/10/2020",
                type: "PDF",
              },
              {
                name: "Quyết định thành lập & Bổ nhiệm Chủ tịch HĐQT",
                size: "1.9 MB",
                date: "02/01/2021",
                type: "PDF",
              },
              {
                name: "Sơ yếu lý lịch cán bộ lãnh đạo",
                size: "850 KB",
                date: "10/01/2021",
                type: "PDF",
              },
            ].map((doc, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 hover:shadow-xs transition-all flex items-start justify-between"
              >
                <div className="flex items-start gap-3 min-w-0">
                  <DocumentTypeIcon type={doc.type} size="sm" showLabelBadge={false} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate" title={doc.name}>
                      {doc.name}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {doc.size} • {doc.date}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  title="Tải tài liệu"
                  className="p-1.5 text-slate-400 hover:text-[#1b365d] rounded-lg transition-colors flex-shrink-0"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: VAI TRÒ & CHỨC NĂNG */}
      {activeTab === "permissions" && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-lg font-bold text-slate-800">Quyền hạn & Vai trò hệ thống</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Phân quyền quản trị nội bộ trong hệ thống Công ty Đông Hải
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-100 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-bold text-blue-800 uppercase tracking-wider">
                Cấp độ phân quyền cao nhất
              </span>
              <h4 className="text-base font-extrabold text-[#1b365d]">
                Quản trị viên tối cao (SUPER_ADMIN / CHAIRMAN)
              </h4>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-800">Các đặc quyền được cấp:</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                "Toàn quyền quản trị nhân sự và tài khoản nội bộ",
                "Phê duyệt và ký điện tử các tài liệu quan trọng",
                "Quản lý cơ cấu Ban / Phòng và phân công chức danh",
                "Xem và xuất báo cáo tài chính, chấm công toàn công ty",
                "Cấu hình hệ thống, gửi email OTP và kiểm soát Whitelist",
                "Khởi tạo tổ chức và thiết lập quy chế công ty",
              ].map((perm, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2.5 p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 text-xs sm:text-sm font-medium text-slate-700"
                >
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[2.5]" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ======================= EDIT PROFILE WIZARD MODAL ======================= */}
      <EditProfileWizardModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        currentUser={currentUser}
        departments={departments}
        onSave={onUpdateUser}
      />
    </div>
  );
}
