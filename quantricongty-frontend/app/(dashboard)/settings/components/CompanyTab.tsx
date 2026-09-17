"use client";

import React, { useState } from "react";
import { Building, Save } from "lucide-react";

interface CompanyTabProps {
  company: any;
  loadData: () => void;
  showToast: (msg: string) => void;
}

export default function CompanyTab({ company, loadData, showToast }: CompanyTabProps) {
  const [companyName, setCompanyName] = useState(company?.name || "Công ty Cổ phần Đầu tư Đông Hải");
  const [shortName, setShortName] = useState(company?.shortName || "Đông Hải Invest");
  const [taxId, setTaxId] = useState(company?.taxId || "0108998877");
  const [address, setAddress] = useState(company?.address || "Tòa nhà Đông Hải, Số 18 Phố Nguyễn Du, Hà Nội");
  const [phone, setPhone] = useState(company?.phone || "024 3974 8888");
  const [email, setEmail] = useState(company?.email || "contact@donghaiinvest.vn");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveCompany = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("http://localhost:5002/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          shortName,
          taxId,
          address,
          phone,
          email,
        }),
      });
      if (res.ok) {
        showToast("Đã cập nhật thông tin doanh nghiệp!");
        loadData();
      } else {
        showToast("Lỗi khi cập nhật thông tin công ty!");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ!");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-5">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
        <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <Building className="w-4 h-4 text-[#1b365d]" />
          Hồ Sơ Doanh Nghiệp
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Tên công ty đầy đủ
          </label>
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Tên viết tắt / Thương hiệu
          </label>
          <input
            type="text"
            value={shortName}
            onChange={(e) => setShortName(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold text-[#1b365d]"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Mã số thuế
          </label>
          <input
            type="text"
            value={taxId}
            onChange={(e) => setTaxId(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800 font-semibold"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Số điện thoại
          </label>
          <input
            type="text"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Địa chỉ trụ sở chính
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-xs font-medium text-slate-700 mb-1">
            Email liên hệ chính thức
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
          />
        </div>
      </div>

      <div className="flex justify-end pt-3 border-t border-slate-100">
        <button
          type="button"
          onClick={handleSaveCompany}
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-medium shadow-xs transition-all disabled:opacity-50 cursor-pointer"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isSaving ? "Đang lưu..." : "Cập nhật thông tin"}</span>
        </button>
      </div>
    </div>
  );
}
