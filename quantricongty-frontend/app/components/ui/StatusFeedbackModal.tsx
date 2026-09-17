"use client";

import React from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";

export type FeedbackType = "success" | "error" | "info";

interface StatusFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  type?: FeedbackType;
  title: string;
  message: string;
  buttonText?: string;
  autoCloseMs?: number;
}

export const StatusFeedbackModal: React.FC<StatusFeedbackModalProps> = ({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
  buttonText = "Hoàn tất",
  autoCloseMs,
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (isOpen && autoCloseMs && autoCloseMs > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseMs);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseMs, onClose]);

  if (!isOpen || !mounted) return null;

  const getTypeConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-10 h-10 text-emerald-600 animate-in zoom-in-50 duration-200" />,
          iconContainer: "bg-emerald-50 border-emerald-100 ring-8 ring-emerald-50/50",
          titleColor: "text-emerald-950",
          btnBg: "bg-[#1b365d] hover:bg-[#152a4a] text-white shadow-[#1b365d]/20",
          badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
          badgeText: "Thành công",
        };
      case "error":
        return {
          icon: <XCircle className="w-10 h-10 text-rose-600 animate-in zoom-in-50 duration-200" />,
          iconContainer: "bg-rose-50 border-rose-100 ring-8 ring-rose-50/50",
          titleColor: "text-rose-950",
          btnBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
          badge: "bg-rose-50 text-rose-700 border-rose-200",
          badgeText: "Thất bại",
        };
      default:
        return {
          icon: <Info className="w-10 h-10 text-blue-600 animate-in zoom-in-50 duration-200" />,
          iconContainer: "bg-blue-50 border-blue-100 ring-8 ring-blue-50/50",
          titleColor: "text-blue-950",
          btnBg: "bg-[#1b365d] hover:bg-[#152a4a] text-white shadow-[#1b365d]/20",
          badge: "bg-blue-50 text-blue-700 border-blue-200",
          badgeText: "Thông báo",
        };
    }
  };

  const cfg = getTypeConfig();

  return createPortal(
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl overflow-hidden text-center p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Big Icon */}
        <div className={`w-20 h-20 rounded-full border flex items-center justify-center mx-auto my-2 transition-transform duration-300 ${cfg.iconContainer}`}>
          {cfg.icon}
        </div>

        {/* Status Badge */}
        <div>
          <span className={`inline-block px-3 py-0.5 rounded-full text-[11px] font-bold border ${cfg.badge}`}>
            {cfg.badgeText}
          </span>
        </div>

        {/* Text Details */}
        <div className="space-y-1.5">
          <h3 className={`text-lg font-bold tracking-tight ${cfg.titleColor}`}>
            {title}
          </h3>
          <p className="text-xs text-slate-500 font-medium leading-relaxed px-2">
            {message}
          </p>
        </div>

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onClose}
            className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer ${cfg.btnBg}`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
