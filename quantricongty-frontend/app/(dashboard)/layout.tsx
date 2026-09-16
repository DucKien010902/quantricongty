"use client";

import React from "react";
import { AppProvider, useApp } from "@/app/context/AppContext";
import Sidebar from "@/app/components/layout/Sidebar";
import Header from "@/app/components/layout/Header";
import CompanyModal from "@/app/components/company/CompanyModal";
import LoginScreen from "@/app/components/auth/LoginScreen";
import JoinOrganizationScreen from "@/app/components/auth/JoinOrganizationScreen";
import CompanySetupWizard from "@/app/components/auth/CompanySetupWizard";
import { Check } from "lucide-react";

function DashboardShell({ children }: { children: React.ReactNode }) {
  const {
    currentUser,
    isAuthLoaded,
    isJoinActive,
    setIsJoinActive,
    inviteCode,
    isWizardActive,
    setIsWizardActive,
    company,
    handleLogin,
    handleWizardComplete,
    isCompanyModalOpen,
    setIsCompanyModalOpen,
    toastMsg,
    showToast,
    loadData,
  } = useApp();

  if (!isAuthLoaded) return null;

  // LUỒNG 1: MÀN HÌNH NHẬN THƯ MỜI THAM GIA TỔ CHỨC
  if (isJoinActive) {
    return (
      <JoinOrganizationScreen
        companyName={company?.name || "Công ty Cổ phần Đầu tư Đông Hải"}
        inviteCode={inviteCode}
        onJoinSuccess={(user) => {
          setIsJoinActive(false);
          handleLogin(user);
          showToast(`🎉 Chào mừng ${user.name} gia nhập tổ chức!`);
        }}
        onBackToLogin={() => setIsJoinActive(false)}
      />
    );
  }

  // LUỒNG 2: WIZARD KHỞI TẠO CÔNG TY TỪNG BƯỚC
  if (isWizardActive) {
    return (
      <CompanySetupWizard
        currentUser={currentUser}
        onComplete={handleWizardComplete}
        onCancel={() => setIsWizardActive(false)}
      />
    );
  }

  // LUỒNG 3: MÀN HÌNH ĐĂNG NHẬP NẾU CHƯA CÓ PHIÊN
  if (!currentUser) {
    return (
      <LoginScreen
        onLoginSuccess={handleLogin}
        onStartWizard={() => setIsWizardActive(true)}
        onGoToJoin={() => setIsJoinActive(true)}
      />
    );
  }

  // LUỒNG 4: DASHBOARD QUẢN TRỊ ĐIỀU HÀNH CHÍNH
  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex font-sans">
      {/* SIDEBAR */}
      <Sidebar />

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="flex-1 p-7 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* MODAL HỒ SƠ CÔNG TY TOÀN CỤC */}
      <CompanyModal
        company={company}
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onOpenWizard={() => {
          setIsCompanyModalOpen(false);
          setIsWizardActive(true);
        }}
        onUpdate={() => {
          loadData();
          showToast("Đã cập nhật thông tin doanh nghiệp!");
        }}
      />

      {/* TOAST THÔNG BÁO TOÀN HỆ THỐNG */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-[100] animate-fade-in">
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-[#1b365d] text-white shadow-xl text-xs font-medium">
            <div className="w-4 h-4 rounded-full bg-emerald-400 flex items-center justify-center flex-shrink-0">
              <Check className="w-3 h-3 stroke-[3] text-slate-900" />
            </div>
            <span>{toastMsg}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <DashboardShell>{children}</DashboardShell>
    </AppProvider>
  );
}
