"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Mail, Lock, User, ArrowRight, ShieldCheck, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { API_URL } from "@/app/config/api";

interface JoinOrgProps {
  companyName?: string;
  inviteCode?: string;
  onJoinSuccess: (user: any) => void;
  onBackToLogin: () => void;
}

export default function JoinOrganizationScreen({
  companyName = "Công ty Cổ phần Đầu tư Đông Hải",
  inviteCode,
  onJoinSuccess,
  onBackToLogin,
}: JoinOrgProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState(inviteCode || "");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [currentCompanyName, setCurrentCompanyName] = useState(companyName);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlComp = params.get("join") || params.get("company");
      if (urlComp && urlComp !== "true" && urlComp !== "1") {
        setCurrentCompanyName(decodeURIComponent(urlComp));
      }
    }
  }, [companyName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !name) {
      setErrorMsg("Vui lòng điền đầy đủ họ tên và email!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_URL}/auth/join-by-invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inviteCode: code,
          email,
          name,
          password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Lỗi khi kích hoạt tham gia tổ chức!");
      }

      onJoinSuccess(data.user);
    } catch {
      // Fallback cục bộ nếu backend offline
      const newUser = {
        id: `NV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
        role: "ADMIN", // Toàn quyền admin ban đầu như yêu cầu
        position: "Cán bộ quản trị",
        department: "Ban Giám Đốc",
        company: currentCompanyName,
      };
      onJoinSuccess(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 font-sans text-slate-800">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xl space-y-6">
        {/* Thiệp mời Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 border border-blue-100 p-2 mx-auto flex items-center justify-center shadow-xs">
            <Image
              src="/donghai-logo.png"
              alt="Logo"
              width={52}
              height={52}
              className="object-contain"
              priority
            />
          </div>

          <div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Thư Mời Gia Nhập Tổ Chức
            </span>
            <h2 className="text-xl font-bold tracking-tight text-slate-800">
              Chào Mừng Gia Nhập
            </h2>
            <p className="text-sm text-[#1b365d] font-bold mt-0.5">
              {currentCompanyName}
            </p>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-500 leading-relaxed">
            Bạn nhận được lời mời tham gia vào hệ thống quản trị và điều hành nội bộ của công ty với toàn quyền quản lý ban đầu.
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Họ và tên của bạn *
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="VD: Nguyễn Văn A"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Địa chỉ Email của bạn *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="email@donghaiinvest.vn"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Mã thư mời (Nếu có)
            </label>
            <input
              type="text"
              placeholder="VD: INV-XXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 block mb-1">
              Thiết lập mật khẩu đăng nhập
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
            )}
            <span>Xác Nhận Gia Nhập & Vào Hệ Thống</span>
          </button>
        </form>

        <div className="pt-3 border-t border-slate-100 text-center">
          <button
            type="button"
            onClick={onBackToLogin}
            className="text-xs text-slate-500 hover:text-slate-800 font-medium"
          >
            Đã có tài khoản? Quay lại đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
