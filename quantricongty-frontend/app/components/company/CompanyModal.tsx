"use client";

import React, { useState } from "react";
import Image from "next/image";
import { X, Building, ShieldCheck, Save, Loader2, MapPin, Mail, Phone, Sparkles } from "lucide-react";
import Modal from "@/app/components/ui/Modal";

interface CompanyModalProps {
  company: any;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: any) => void;
  onOpenWizard?: () => void;
}

export default function CompanyModal({
  company,
  isOpen,
  onClose,
  onUpdate,
  onOpenWizard,
}: CompanyModalProps) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    name: company?.name || "Công ty Cổ phần Đầu tư Đông Hải",
    brandName: company?.brandName || "DONG HAI INVEST",
    taxCode: company?.taxCode || "0109988776",
    businessSector:
      company?.businessSector || "Đầu tư tài chính, Bất động sản và Phát triển dự án",
    address:
      company?.address ||
      "Tòa nhà DHI Tower, Số 18 Đường Hoàng Đạo Thúy, Cầu Giấy, Hà Nội",
    email: company?.email || "contact@donghaiinvest.vn",
    phone: company?.phone || "024 3888 9999",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSuccessMsg(false);

    try {
      const res = await fetch("http://localhost:5002/api/company/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      onUpdate(data);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 2500);
    } catch (err) {
      alert("Không thể lưu thông tin công ty!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hideHeader
      className="p-0 overflow-hidden"
    >
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Xanh Đen Đồng Bộ (#1b365d) */}
        <div className="p-5 px-6 border-b border-slate-100 bg-[#1b365d] text-white flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-white p-1.5 flex items-center justify-center ring-2 ring-white/20 shadow-sm shrink-0">
              <Image
                src="/donghai-logo.png"
                alt="Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                Hồ Sơ Doanh Nghiệp
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 font-normal">
                Thông tin pháp nhân nội bộ • DONG HAI INVEST
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form với chữ to rõ ràng (text-sm sm:text-base) */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-7 space-y-4 text-sm sm:text-base text-slate-700">
          {successMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-2.5 text-sm sm:text-base shadow-xs">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Đã lưu cập nhật thông tin doanh nghiệp thành công!</span>
            </div>
          )}

          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
              Tên Doanh Nghiệp Đăng Ký *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all text-sm sm:text-base shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
                Tên Thương Hiệu *
              </label>
              <input
                type="text"
                required
                value={formData.brandName}
                onChange={(e) =>
                  setFormData({ ...formData, brandName: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all text-sm sm:text-base shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
                Mã Số Thuế (MST) *
              </label>
              <input
                type="text"
                required
                value={formData.taxCode}
                onChange={(e) =>
                  setFormData({ ...formData, taxCode: e.target.value })
                }
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-mono font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all text-sm sm:text-base shadow-2xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
              Lĩnh Vực Hoạt Động
            </label>
            <input
              type="text"
              value={formData.businessSector}
              onChange={(e) =>
                setFormData({ ...formData, businessSector: e.target.value })
              }
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all text-sm sm:text-base shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
              Địa Chỉ Trụ Sở Chính
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all text-sm sm:text-base shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
                Email Doanh Nghiệp
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all text-sm sm:text-base shadow-2xs"
              />
            </div>

            <div>
              <label className="block text-sm sm:text-base font-bold text-slate-800 mb-1.5">
                Hotline Trụ Sở
              </label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50/50 font-mono font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all text-sm sm:text-base shadow-2xs"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
            {onOpenWizard ? (
              <button
                type="button"
                onClick={onOpenWizard}
                className="text-sm font-bold text-[#1b365d] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#1b365d]" /> Mở Wizard Khởi Tạo Lại
              </button>
            ) : <div />}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 sm:px-6 sm:py-3 rounded-xl border border-slate-200 font-bold text-slate-700 hover:bg-slate-100 transition-colors text-sm cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 px-6 py-2.5 sm:px-7 sm:py-3 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-bold shadow-md shadow-[#1b365d]/25 disabled:opacity-50 transition-all text-sm cursor-pointer"
              >
                {isSaving ? (
                  <Loader2 className="w-4.5 h-4.5 animate-spin" />
                ) : (
                  <Save className="w-4.5 h-4.5" />
                )}
                <span>{isSaving ? "Đang lưu..." : "Lưu Thông Tin"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
