"use client";

import React from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, CheckCircle2, XCircle, RotateCcw, X, Loader2 } from "lucide-react";

export type ConfirmVariant = "primary" | "success" | "danger" | "warning";

interface ActionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  itemDetails?: {
    label: string;
    value: string;
  }[];
  confirmText?: string;
  cancelText?: string;
  variant?: ConfirmVariant;
  isLoading?: boolean;
  noteValue?: string;
  onNoteChange?: (val: string) => void;
  notePlaceholder?: string;
  requireNote?: boolean;
}

export const ActionConfirmModal: React.FC<ActionConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemDetails,
  confirmText = "Xác nhận",
  cancelText = "Hủy bỏ",
  variant = "primary",
  isLoading = false,
  noteValue,
  onNoteChange,
  notePlaceholder = "Nhập ghi chú hoặc lý do...",
  requireNote = false,
}) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "success":
        return {
          icon: <CheckCircle2 className="w-8 h-8 text-emerald-600" />,
          iconBg: "bg-emerald-50 border-emerald-100",
          btnBg: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20",
          accentColor: "text-emerald-700",
        };
      case "danger":
        return {
          icon: <XCircle className="w-8 h-8 text-rose-600" />,
          iconBg: "bg-rose-50 border-rose-100",
          btnBg: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20",
          accentColor: "text-rose-700",
        };
      case "warning":
        return {
          icon: <RotateCcw className="w-8 h-8 text-amber-600" />,
          iconBg: "bg-amber-50 border-amber-100",
          btnBg: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/20",
          accentColor: "text-amber-700",
        };
      default:
        return {
          icon: <AlertTriangle className="w-8 h-8 text-[#1b365d]" />,
          iconBg: "bg-blue-50 border-blue-100",
          btnBg: "bg-[#1b365d] hover:bg-[#152a4a] text-white shadow-[#1b365d]/20",
          accentColor: "text-[#1b365d]",
        };
    }
  };

  const vStyles = getVariantStyles();

  return createPortal(
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 pb-4 text-center relative border-b border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="absolute right-4 top-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className={`w-14 h-14 rounded-2xl ${vStyles.iconBg} border shadow-inner flex items-center justify-center mx-auto mb-3`}>
            {vStyles.icon}
          </div>

          <h3 className="text-base font-bold text-slate-900 tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed px-2">
            {description}
          </p>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {itemDetails && itemDetails.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              {itemDetails.map((detail, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">{detail.label}:</span>
                  <span className="font-bold text-slate-800 text-right truncate max-w-[200px]">
                    {detail.value}
                  </span>
                </div>
              ))}
            </div>
          )}

          {onNoteChange !== undefined && (
            <div className="space-y-1.5">
              <label className="block font-bold text-slate-700">
                Ghi chú / Ý kiến xử lý {requireNote ? "*" : "(Không bắt buộc)"}:
              </label>
              <textarea
                rows={2}
                value={noteValue || ""}
                onChange={(e) => onNoteChange(e.target.value)}
                placeholder={notePlaceholder}
                className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 px-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-semibold text-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading || (requireNote && !noteValue?.trim())}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 ${vStyles.btnBg}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
