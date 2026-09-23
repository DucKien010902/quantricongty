"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export type ModalSize =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  size?: ModalSize;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  showCloseButton?: boolean;
  closeOnBackdropClick?: boolean;
  closeOnEsc?: boolean;
  hideHeader?: boolean;
  headerContent?: React.ReactNode;
}

const SIZE_CLASSES: Record<ModalSize, string> = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
  "7xl": "max-w-7xl",
  full: "max-w-[96vw]",
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  title,
  description,
  size = "xl",
  className = "",
  headerClassName = "",
  bodyClassName = "",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEsc = true,
  hideHeader = false,
  headerContent,
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Khóa cuộn trang nền khi modal đang mở
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Đóng modal khi nhấn phím Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && closeOnEsc) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, closeOnEsc, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidthClass = SIZE_CLASSES[size] || SIZE_CLASSES.xl;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in select-none"
      onClick={() => {
        if (closeOnBackdropClick) onClose();
      }}
      aria-modal="true"
      role="dialog"
    >
      <div
        className={`bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full ${maxWidthClass} overflow-hidden flex flex-col max-h-[92vh] my-auto select-text animate-in fade-in zoom-in-95 duration-150 ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Custom hoặc Default Header */}
        {!hideHeader && (
          <div
            className={`p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0 ${headerClassName}`}
          >
            {headerContent ? (
              headerContent
            ) : (
              <div className="min-w-0 flex-1 pr-3">
                {title && (
                  <h3 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-slate-500 mt-0.5 font-medium leading-relaxed">
                    {description}
                  </p>
                )}
              </div>
            )}

            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors shrink-0 cursor-pointer"
                aria-label="Đóng"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className={`flex-1 overflow-y-auto min-h-0 ${bodyClassName}`}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Modal;
