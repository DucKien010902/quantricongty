"use client";

import React from "react";

export interface DocumentTypeIconProps {
  type: "PDF" | "DOCX" | "DOC" | "XLSX" | "XLS" | "PPTX" | "PPT" | "ZIP" | "RAR" | string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLabelBadge?: boolean;
}

const SIZE_MAP = {
  sm: "w-7 h-9 text-[9px]",
  md: "w-9 h-11 text-[10px]",
  lg: "w-11 h-13 text-[11px]",
  xl: "w-14 h-16 text-[12px]",
};

export const PdfIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-sm transition-transform hover:scale-105`}>
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pdfGrad" x1="0" y1="0" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#EF4444" />
          <stop offset="1" stopColor="#B91C1C" />
        </linearGradient>
      </defs>
      {/* Page Body */}
      <path
        d="M5 0C2.23858 0 0 2.23858 0 5V43C0 45.7614 2.23858 48 5 48H35C37.7614 48 40 45.7614 40 43V12L28 0H5Z"
        fill="url(#pdfGrad)"
      />
      {/* Page Fold Corner */}
      <path d="M28 0V9C28 10.6569 29.3431 12 31 12H40L28 0Z" fill="#9F1239" />
      <path d="M28 12L40 12L28 0V12Z" fill="black" fillOpacity="0.15" />
      
      {/* Document Lines Placeholder */}
      <rect x="8" y="10" width="14" height="2" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="8" y="15" width="18" height="2" rx="1" fill="white" fillOpacity="0.6" />

      {/* PDF Main Banner */}
      <rect x="3" y="24" width="34" height="17" rx="3.5" fill="#881337" />
      <text
        x="20"
        y="36.5"
        textAnchor="middle"
        fill="white"
        fontSize="10.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.6"
      >
        PDF
      </text>
    </svg>
  </div>
);

export const WordIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-sm transition-transform hover:scale-105`}>
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="wordGrad" x1="0" y1="0" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#3B82F6" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path
        d="M5 0C2.23858 0 0 2.23858 0 5V43C0 45.7614 2.23858 48 5 48H35C37.7614 48 40 45.7614 40 43V12L28 0H5Z"
        fill="url(#wordGrad)"
      />
      <path d="M28 0V9C28 10.6569 29.3431 12 31 12H40L28 0Z" fill="#1E40AF" />
      <path d="M28 12L40 12L28 0V12Z" fill="black" fillOpacity="0.15" />
      
      <rect x="8" y="10" width="14" height="2" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="8" y="15" width="18" height="2" rx="1" fill="white" fillOpacity="0.6" />

      <rect x="3" y="24" width="34" height="17" rx="3.5" fill="#1E3A8A" />
      <text
        x="20"
        y="36.5"
        textAnchor="middle"
        fill="white"
        fontSize="9.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.4"
      >
        WORD
      </text>
    </svg>
  </div>
);

export const ExcelIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-sm transition-transform hover:scale-105`}>
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="excelGrad" x1="0" y1="0" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#10B981" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <path
        d="M5 0C2.23858 0 0 2.23858 0 5V43C0 45.7614 2.23858 48 5 48H35C37.7614 48 40 45.7614 40 43V12L28 0H5Z"
        fill="url(#excelGrad)"
      />
      <path d="M28 0V9C28 10.6569 29.3431 12 31 12H40L28 0Z" fill="#065F46" />
      <path d="M28 12L40 12L28 0V12Z" fill="black" fillOpacity="0.15" />
      
      {/* Spreadsheet Grid Lines */}
      <rect x="8" y="10" width="18" height="2" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="8" y="15" width="8" height="2" rx="1" fill="white" fillOpacity="0.6" />
      <rect x="18" y="15" width="8" height="2" rx="1" fill="white" fillOpacity="0.6" />

      <rect x="3" y="24" width="34" height="17" rx="3.5" fill="#064E3B" />
      <text
        x="20"
        y="36.5"
        textAnchor="middle"
        fill="white"
        fontSize="9"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.4"
      >
        EXCEL
      </text>
    </svg>
  </div>
);

export const PptIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-sm transition-transform hover:scale-105`}>
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pptGrad" x1="0" y1="0" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F97316" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <path
        d="M5 0C2.23858 0 0 2.23858 0 5V43C0 45.7614 2.23858 48 5 48H35C37.7614 48 40 45.7614 40 43V12L28 0H5Z"
        fill="url(#pptGrad)"
      />
      <path d="M28 0V9C28 10.6569 29.3431 12 31 12H40L28 0Z" fill="#9A3412" />
      <path d="M28 12L40 12L28 0V12Z" fill="black" fillOpacity="0.15" />
      
      <rect x="8" y="10" width="14" height="2" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="8" y="15" width="18" height="2" rx="1" fill="white" fillOpacity="0.6" />

      <rect x="3" y="24" width="34" height="17" rx="3.5" fill="#7C2D12" />
      <text
        x="20"
        y="36.5"
        textAnchor="middle"
        fill="white"
        fontSize="10.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.6"
      >
        PPT
      </text>
    </svg>
  </div>
);

export const ZipIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-sm transition-transform hover:scale-105`}>
    <svg viewBox="0 0 40 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="zipGrad" x1="0" y1="0" x2="40" y2="48" gradientUnits="userSpaceOnUse">
          <stop stopColor="#A855F7" />
          <stop offset="1" stopColor="#6D28D9" />
        </linearGradient>
      </defs>
      <path
        d="M5 0C2.23858 0 0 2.23858 0 5V43C0 45.7614 2.23858 48 5 48H35C37.7614 48 40 45.7614 40 43V12L28 0H5Z"
        fill="url(#zipGrad)"
      />
      <path d="M28 0V9C28 10.6569 29.3431 12 31 12H40L28 0Z" fill="#5B21B6" />
      <path d="M28 12L40 12L28 0V12Z" fill="black" fillOpacity="0.15" />
      
      <rect x="8" y="10" width="14" height="2" rx="1" fill="white" fillOpacity="0.8" />
      <rect x="8" y="15" width="18" height="2" rx="1" fill="white" fillOpacity="0.6" />

      <rect x="3" y="24" width="34" height="17" rx="3.5" fill="#4C1D95" />
      <text
        x="20"
        y="36.5"
        textAnchor="middle"
        fill="white"
        fontSize="10.5"
        fontWeight="900"
        fontFamily="system-ui, -apple-system, sans-serif"
        letterSpacing="0.6"
      >
        ZIP
      </text>
    </svg>
  </div>
);

export default function DocumentTypeIcon({
  type,
  size = "md",
  className = "",
  showLabelBadge = true,
}: DocumentTypeIconProps) {
  const normalizedType = type?.toUpperCase() || "FILE";

  let IconComponent = PdfIcon;
  let badgeStyle = "bg-rose-50 text-rose-700 border-rose-200/90";
  let labelText = "PDF";

  if (normalizedType.includes("XLS") || normalizedType.includes("EXCEL")) {
    IconComponent = ExcelIcon;
    badgeStyle = "bg-emerald-50 text-emerald-800 border-emerald-200/90";
    labelText = "EXCEL";
  } else if (normalizedType.includes("DOC") || normalizedType.includes("WORD")) {
    IconComponent = WordIcon;
    badgeStyle = "bg-blue-50 text-blue-800 border-blue-200/90";
    labelText = "WORD";
  } else if (normalizedType.includes("PPT") || normalizedType.includes("POWERPOINT")) {
    IconComponent = PptIcon;
    badgeStyle = "bg-amber-50 text-amber-900 border-amber-200/90";
    labelText = "PPT";
  } else if (normalizedType.includes("ZIP") || normalizedType.includes("RAR")) {
    IconComponent = ZipIcon;
    badgeStyle = "bg-purple-50 text-purple-900 border-purple-200/90";
    labelText = "ZIP";
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <IconComponent size={size} />
      {showLabelBadge && (
        <span
          className={`px-2 py-0.5 rounded-md text-[11px] font-extrabold border font-mono tracking-wide shadow-2xs ${badgeStyle}`}
        >
          {labelText}
        </span>
      )}
    </div>
  );
}
