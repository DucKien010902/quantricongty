"use client";

import React, { useState, useRef, useEffect } from "react";
import { API_URL } from "@/app/config/api";
import Image from "next/image";
import {
  Mail,
  Sparkles,
  Loader2,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (user: any) => void;
  onGoToJoin?: () => void;
}

export default function LoginScreen({
  onLoginSuccess,
  onGoToJoin,
}: LoginScreenProps) {
  const [step, setStep] = useState<"input" | "verify">("input");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const tokenClientRef = useRef<any>(null);

  // Helper decode Google JWT Token
  const parseGoogleJwt = (token: string) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  // Khởi tạo Google OAuth2 Token Client (mở popup chọn tài khoản Google thật)
  useEffect(() => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) return;

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const g = (window as any).google;
      if (g?.accounts?.oauth2) {
        clearInterval(interval);
        tokenClientRef.current = g.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: "openid email profile",
          callback: async (tokenResponse: any) => {
            if (tokenResponse?.access_token) {
              try {
                const userInfo = await fetch(
                  "https://www.googleapis.com/oauth2/v3/userinfo",
                  { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                ).then(r => r.json());
                if (userInfo?.email) {
                  await handleAuthenticateGoogleEmail(
                    userInfo.email,
                    userInfo.name,
                    userInfo.picture
                  );
                }
              } catch {
                setErrorMsg("Không thể lấy thông tin tài khoản Google!");
              } finally {
                setIsGoogleLoading(false);
              }
            } else {
              setIsGoogleLoading(false);
            }
          },
          error_callback: () => {
            setIsGoogleLoading(false);
            setErrorMsg("Đăng nhập Google bị hủy hoặc thất bại!");
          },
        });
      } else if (attempts > 50) {
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // Click nút Google → mở popup chọn tài khoản
  const handleGoogleClick = () => {
    if (!tokenClientRef.current) {
      setErrorMsg("Google SDK chưa sẵn sàng, vui lòng thử lại sau giây lát!");
      return;
    }
    setIsGoogleLoading(true);
    setErrorMsg(null);
    tokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  };

  // Authenticate chosen Google email
  const handleAuthenticateGoogleEmail = async (emailToAuth: string, name?: string, picture?: string) => {
    if (!emailToAuth || !emailToAuth.includes("@")) {
      setErrorMsg("Vui lòng nhập địa chỉ Gmail hợp lệ!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_URL}/auth/google-whitelist`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailToAuth.trim(),
          name: name || emailToAuth.split("@")[0],
          picture: picture,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Bạn không có trong tổ chức này!");
      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || "Bạn không có trong tổ chức này. Vui lòng liên hệ Quản trị viên!");
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setErrorMsg("Vui lòng nhập địa chỉ email hợp lệ!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await fetch(`${API_URL}/auth/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Bạn không có trong tổ chức này!");
      }

      setSuccessMsg(data.message || "Đã gửi mã xác thực OTP về hòm thư Gmail của bạn!");
      setStep("verify");
      setCountdown(60);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: any) {
      setErrorMsg(err.message || "Bạn không có trong tổ chức này. Vui lòng liên hệ Quản trị viên!");
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.trim().length < 4) {
      setErrorMsg("Vui lòng nhập đầy đủ mã OTP đã nhận trong email!");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(`${API_URL}/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          otp: otp.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Mã OTP không chính xác hoặc đã hết hạn!");
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      setErrorMsg(err.message || "Mã OTP không chính xác hoặc đã hết hạn!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/90 flex flex-col justify-center items-center p-4 font-sans text-slate-800 relative">
      {/* CARD ĐĂNG NHẬP CHÍNH */}
      <div className="max-w-lg w-full bg-white rounded-3xl p-8 sm:p-9 border border-slate-200/90 shadow-2xl space-y-6 sm:space-y-7 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 p-2 mx-auto flex items-center justify-center shadow-xs ring-4 ring-slate-50">
            <Image
              src="/donghai-logo.png"
              alt="Logo"
              width={54}
              height={54}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              Cổng Đăng Nhập Doanh Nghiệp
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
              Hệ thống xác thực thành viên nội bộ công ty
            </p>
          </div>
        </div>

        {/* Thông báo Lỗi */}
        {errorMsg && (
          <div className="p-4 rounded-2xl bg-rose-50 text-rose-800 border border-rose-200 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-fade-in shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{errorMsg}</div>
          </div>
        )}

        {/* Thông báo Thành công */}
        {successMsg && (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-semibold flex items-start gap-3 animate-fade-in shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{successMsg}</div>
          </div>
        )}

        {/* BƯỚC 1: LỰA CHỌN GOOGLE HOẶC NHẬP MAIL */}
        {step === "input" && (
          <div className="space-y-6">
            {/* LỰA CHỌN 1: NÚT GOOGLE CUSTOM (full width, đẹp, cùng style với OTP) */}
            <div>
              <button
                type="button"
                onClick={handleGoogleClick}
                disabled={isGoogleLoading || isLoading}
                className="w-full py-3.5 px-5 rounded-2xl bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 hover:border-slate-400 text-slate-800 font-bold text-sm sm:text-base shadow-sm hover:shadow-md flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <>
                    <svg className="w-5 h-5 animate-spin text-slate-400" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    <span className="text-slate-500">Đang mở Google...</span>
                  </>
                ) : (
                  <>
                    {/* Google logo SVG chính hãng */}
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                    </svg>
                    <span>Tiếp Tục Với Tài Khoản Google</span>
                  </>
                )}
              </button>
              <p className="text-xs text-slate-400 text-center mt-2 font-medium">
                Tự động kiểm tra quyền thành viên trong tổ chức
              </p>
            </div>

            {/* ĐƯỜNG PHÂN CÁCH HOẶC */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-3 text-xs font-bold text-slate-400 uppercase tracking-wider">
                Hoặc
              </span>
            </div>

            {/* LỰA CHỌN 2: NHẬP EMAIL ĐỂ NHẬN MÃ OTP */}
            <form onSubmit={handleSendOtp} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="font-bold text-slate-800 block mb-1.5 text-sm sm:text-base">
                  Nhập địa chỉ Email của bạn
                </label>
                <div className="relative">
                  <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="email.nhanvien@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 font-semibold text-sm sm:text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all shadow-2xs"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-2xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-sm sm:text-base font-bold shadow-md shadow-[#1b365d]/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <KeyRound className="w-5 h-5" />
                )}
                <span>Gửi Mã Xác Thực OTP Về Email</span>
              </button>
            </form>
          </div>
        )}

        {/* BƯỚC 2: NHẬP MÃ OTP */}
        {step === "verify" && (
          <form onSubmit={handleVerifyOtp} className="space-y-5 text-xs sm:text-sm animate-fade-in">
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-slate-800 space-y-1">
              <p className="font-bold text-[#1b365d] text-sm">
                Kiểm tra hòm thư Gmail của bạn:
              </p>
              <p className="text-xs text-slate-600 font-mono font-medium">
                Mã OTP 6 số đã được gửi tới: <strong className="text-slate-900">{email}</strong>
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-800 block mb-1.5 text-sm">
                Nhập mã OTP (6 chữ số)
              </label>
              <input
                type="text"
                required
                maxLength={6}
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-center tracking-[10px] font-mono text-2xl py-3.5 rounded-xl bg-slate-50/80 border border-slate-300 text-slate-900 font-extrabold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d] transition-all shadow-2xs"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm sm:text-base font-bold shadow-md shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
              )}
              <span>Xác Thực OTP & Vào Hệ Thống</span>
            </button>

            <div className="flex items-center justify-between pt-2 text-xs">
              <button
                type="button"
                onClick={() => {
                  setStep("input");
                  setErrorMsg(null);
                }}
                className="text-slate-500 hover:text-slate-900 flex items-center gap-1 font-bold cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Đổi email khác
              </button>

              <button
                type="button"
                disabled={countdown > 0}
                onClick={handleSendOtp}
                className={`font-bold ${
                  countdown > 0
                    ? "text-slate-400 cursor-not-allowed"
                    : "text-[#1b365d] hover:underline cursor-pointer"
                }`}
              >
                {countdown > 0 ? `Gửi lại sau (${countdown}s)` : "Gửi lại mã OTP"}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Overlay loading khi đang xác thực Google */}
      {isLoading && (
        <div className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 flex items-center gap-4 shadow-2xl">
            <Loader2 className="w-6 h-6 animate-spin text-[#1b365d]" />
            <span className="text-sm font-bold text-slate-800">Đang xác thực tài khoản...</span>
          </div>
        </div>
      )}
    </div>
  );
}
