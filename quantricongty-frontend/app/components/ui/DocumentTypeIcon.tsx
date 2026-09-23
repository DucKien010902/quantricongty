"use client";

import React from "react";

export interface DocumentTypeIconProps {
  type: "PDF" | "DOCX" | "DOC" | "XLSX" | "XLS" | "PPTX" | "PPT" | "ZIP" | "RAR" | "PNG" | "JPG" | string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  showLabelBadge?: boolean;
}

const SIZE_MAP = {
  sm: "w-8 h-10 text-[9px]",
  md: "w-10 h-12 text-[10px]",
  lg: "w-12 h-14 text-[11px]",
  xl: "w-16 h-18 text-[12px]",
};

/**
 * PDF ICON 3D LUXURY - Thiết kế chuẩn Adobe Acrobat ribbon trắng nổi bật
 */
export const PdfIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-md transition-transform hover:scale-105 select-none`}>
    <svg viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pdfBodyGrad" x1="0" y1="0" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF4D4D" />
          <stop offset="0.6" stopColor="#E60000" />
          <stop offset="1" stopColor="#990000" />
        </linearGradient>
        <linearGradient id="pdfFoldGrad" x1="32" y1="0" x2="44" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF8080" />
          <stop offset="1" stopColor="#B30000" />
        </linearGradient>
        <filter id="pdfShadow" x="0" y="0" width="44" height="52" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="1.5" floodColor="#000" floodOpacity="0.25" />
        </filter>
      </defs>
      {/* Thân file PDF 3D */}
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V46C0 49.3137 2.68629 52 6 52H38C41.3137 52 44 49.3137 44 46V14L30 0H6Z"
        fill="url(#pdfBodyGrad)"
      />
      {/* Góc gấp 3D */}
      <path d="M30 0V10C30 12.2091 31.7909 14 34 14H44L30 0Z" fill="url(#pdfFoldGrad)" />
      <path d="M30 14L44 14L30 0V14Z" fill="black" fillOpacity="0.18" />

      {/* Biểu tượng uốn lượn uốn khúc Acrobat Ribbon chuẩn */}
      <path
        d="M27.5 25.5C26.2 24.2 24.1 23.5 21.8 23.5C18.2 23.5 15.1 25.2 13.5 27.8C12.4 29.6 12.1 31.8 13.1 33.5C13.9 34.8 15.4 35.5 17.1 35.5C20.5 35.5 24.2 32.8 27.2 28.5C29.8 32.2 32.8 34.5 35.2 34.5C36.4 34.5 37.3 33.9 37.7 32.8C38.2 31.5 37.6 29.8 36.1 28.5C33.8 26.5 30.3 25.8 27.5 25.5ZM16.2 33.2C15.4 33.2 14.8 32.8 14.5 32.2C14.1 31.3 14.4 29.9 15.2 28.6C16.4 26.7 18.8 25.3 21.5 25.1C18.9 30.5 17.2 33.2 16.2 33.2ZM35.8 32.5C35.5 33.0 35.1 33.2 34.6 33.2C33.1 33.2 30.8 31.3 28.6 28.1C31 28.3 33.8 29.1 35.5 30.6C36.3 31.3 36.3 32.0 35.8 32.5Z"
        fill="white"
        fillOpacity="0.95"
      />
      <circle cx="22" cy="16" r="2.5" fill="white" fillOpacity="0.8" />
    </svg>
  </div>
);

/**
 * WORD ICON 3D LUXURY - Chuẩn Microsoft Word 3D với khối thẻ W dập nổi
 */
export const WordIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-md transition-transform hover:scale-105 select-none`}>
    <svg viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="wordBodyGrad" x1="0" y1="0" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#2B7CD3" />
          <stop offset="0.6" stopColor="#106EBE" />
          <stop offset="1" stopColor="#004578" />
        </linearGradient>
        <linearGradient id="wordFoldGrad" x1="32" y1="0" x2="44" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#60A5FA" />
          <stop offset="1" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V46C0 49.3137 2.68629 52 6 52H38C41.3137 52 44 49.3137 44 46V14L30 0H6Z"
        fill="url(#wordBodyGrad)"
      />
      <path d="M30 0V10C30 12.2091 31.7909 14 34 14H44L30 0Z" fill="url(#wordFoldGrad)" />
      <path d="M30 14L44 14L30 0V14Z" fill="black" fillOpacity="0.18" />

      {/* Khối thẻ W Microsoft Word dập nổi 3D */}
      <rect x="5" y="20" width="22" height="22" rx="4" fill="#005A9E" />
      <path
        d="M9 25L12 37H14.5L16.5 29L18.5 37H21L24 25H21.5L19.5 33.5L17.5 25H15.5L13.5 33.5L11.5 25H9Z"
        fill="white"
        fontWeight="bold"
      />

      {/* Đường vạch tài liệu ở vế phải */}
      <rect x="30" y="24" width="9" height="2" rx="1" fill="white" fillOpacity="0.7" />
      <rect x="30" y="29" width="10" height="2" rx="1" fill="white" fillOpacity="0.7" />
      <rect x="30" y="34" width="7" height="2" rx="1" fill="white" fillOpacity="0.5" />
    </svg>
  </div>
);

/**
 * EXCEL ICON 3D LUXURY - Chuẩn Microsoft Excel 3D với khối thẻ X bọc lưới
 */
export const ExcelIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-md transition-transform hover:scale-105 select-none`}>
    <svg viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="excelBodyGrad" x1="0" y1="0" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#21A366" />
          <stop offset="0.6" stopColor="#107C41" />
          <stop offset="1" stopColor="#0B552C" />
        </linearGradient>
        <linearGradient id="excelFoldGrad" x1="32" y1="0" x2="44" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#34D399" />
          <stop offset="1" stopColor="#047857" />
        </linearGradient>
      </defs>
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V46C0 49.3137 2.68629 52 6 52H38C41.3137 52 44 49.3137 44 46V14L30 0H6Z"
        fill="url(#excelBodyGrad)"
      />
      <path d="M30 0V10C30 12.2091 31.7909 14 34 14H44L30 0Z" fill="url(#excelFoldGrad)" />
      <path d="M30 14L44 14L30 0V14Z" fill="black" fillOpacity="0.18" />

      {/* Khối thẻ X Microsoft Excel dập nổi 3D */}
      <rect x="5" y="20" width="22" height="22" rx="4" fill="#0E5C2F" />
      <path
        d="M10.5 25H13L16 30.5L19 25H21.5L17.5 31L21.5 37H19L16 31.5L13 37H10.5L14.5 31L10.5 25Z"
        fill="white"
      />

      {/* Lưới bảng tính Excel vế phải */}
      <rect x="30" y="23" width="10" height="4" fill="white" fillOpacity="0.3" />
      <rect x="30" y="29" width="10" height="4" fill="white" fillOpacity="0.3" />
      <rect x="30" y="35" width="10" height="4" fill="white" fillOpacity="0.3" />
    </svg>
  </div>
);

/**
 * POWERPOINT ICON 3D LUXURY - Chuẩn Microsoft PowerPoint 3D với biểu đồ tròn P
 */
export const PptIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-md transition-transform hover:scale-105 select-none`}>
    <svg viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="pptBodyGrad" x1="0" y1="0" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#F2572B" />
          <stop offset="0.6" stopColor="#D83B01" />
          <stop offset="1" stopColor="#992900" />
        </linearGradient>
        <linearGradient id="pptFoldGrad" x1="32" y1="0" x2="44" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FDBA74" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V46C0 49.3137 2.68629 52 6 52H38C41.3137 52 44 49.3137 44 46V14L30 0H6Z"
        fill="url(#pptBodyGrad)"
      />
      <path d="M30 0V10C30 12.2091 31.7909 14 34 14H44L30 0Z" fill="url(#pptFoldGrad)" />
      <path d="M30 14L44 14L30 0V14Z" fill="black" fillOpacity="0.18" />

      {/* Khối thẻ P PowerPoint 3D */}
      <rect x="5" y="20" width="22" height="22" rx="4" fill="#A82A00" />
      <path
        d="M11 25H16.5C18.5 25 20 26.2 20 28.2C20 30.2 18.5 31.5 16.5 31.5H13.5V37H11V25ZM13.5 27V29.5H16.2C17.2 29.5 17.8 29 17.8 28.2C17.8 27.5 17.2 27 16.2 27H13.5Z"
        fill="white"
      />

      {/* Biểu đồ Slide vế phải */}
      <circle cx="35" cy="30" r="4.5" fill="white" fillOpacity="0.4" />
      <path d="M35 30L38.5 27.5V30H35Z" fill="white" />
    </svg>
  </div>
);

/**
 * ZIP ARCHIVE ICON 3D LUXURY - Khóa kéo khóa Zip 3D tím ấn tượng
 */
export const ZipIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-md transition-transform hover:scale-105 select-none`}>
    <svg viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="zipBodyGrad" x1="0" y1="0" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#9333EA" />
          <stop offset="0.6" stopColor="#7E22CE" />
          <stop offset="1" stopColor="#581C87" />
        </linearGradient>
        <linearGradient id="zipFoldGrad" x1="32" y1="0" x2="44" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#C084FC" />
          <stop offset="1" stopColor="#6B21A8" />
        </linearGradient>
      </defs>
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V46C0 49.3137 2.68629 52 6 52H38C41.3137 52 44 49.3137 44 46V14L30 0H6Z"
        fill="url(#zipBodyGrad)"
      />
      <path d="M30 0V10C30 12.2091 31.7909 14 34 14H44L30 0Z" fill="url(#zipFoldGrad)" />
      <path d="M30 14L44 14L30 0V14Z" fill="black" fillOpacity="0.18" />

      {/* Dây khóa kéo dập nổi Zip */}
      <rect x="20" y="8" width="4" height="3" fill="#FDE047" rx="0.5" />
      <rect x="18" y="12" width="4" height="3" fill="#FDE047" rx="0.5" />
      <rect x="20" y="16" width="4" height="3" fill="#FDE047" rx="0.5" />
      <rect x="18" y="20" width="4" height="3" fill="#FDE047" rx="0.5" />

      {/* Củ khóa Zipper */}
      <rect x="17" y="24" width="8" height="12" rx="2" fill="#EAB308" />
      <circle cx="21" cy="30" r="2" fill="#713F12" />
      <path d="M21 32V39" stroke="#EAB308" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  </div>
);

/**
 * IMAGE ICON 3D LUXURY - Tệp hình ảnh PNG/JPG 3D sắc nét
 */
export const ImageIcon: React.FC<{ size?: keyof typeof SIZE_MAP; className?: string }> = ({
  size = "md",
  className = "",
}) => (
  <div className={`relative shrink-0 ${SIZE_MAP[size]} ${className} drop-shadow-md transition-transform hover:scale-105 select-none`}>
    <svg viewBox="0 0 44 52" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <defs>
        <linearGradient id="imgBodyGrad" x1="0" y1="0" x2="44" y2="52" gradientUnits="userSpaceOnUse">
          <stop stopColor="#0EA5E9" />
          <stop offset="0.6" stopColor="#0284C7" />
          <stop offset="1" stopColor="#0369A1" />
        </linearGradient>
        <linearGradient id="imgFoldGrad" x1="32" y1="0" x2="44" y2="12" gradientUnits="userSpaceOnUse">
          <stop stopColor="#38BDF8" />
          <stop offset="1" stopColor="#075985" />
        </linearGradient>
      </defs>
      <path
        d="M6 0C2.68629 0 0 2.68629 0 6V46C0 49.3137 2.68629 52 6 52H38C41.3137 52 44 49.3137 44 46V14L30 0H6Z"
        fill="url(#imgBodyGrad)"
      />
      <path d="M30 0V10C30 12.2091 31.7909 14 34 14H44L30 0Z" fill="url(#imgFoldGrad)" />
      <path d="M30 14L44 14L30 0V14Z" fill="black" fillOpacity="0.18" />

      {/* Biểu tượng phong cảnh núi & mặt trời 3D */}
      <circle cx="14" cy="24" r="3.5" fill="#FEF08A" />
      <path d="M9 38L18 27L25 34L30 29L36 38H9Z" fill="white" fillOpacity="0.9" />
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
  let badgeStyle = "bg-rose-100 text-rose-800 border-rose-300 shadow-2xs";
  let labelText = "PDF";

  if (normalizedType.includes("XLS") || normalizedType.includes("EXCEL") || normalizedType.includes("CSV")) {
    IconComponent = ExcelIcon;
    badgeStyle = "bg-emerald-100 text-emerald-900 border-emerald-300 shadow-2xs";
    labelText = "EXCEL";
  } else if (normalizedType.includes("DOC") || normalizedType.includes("WORD")) {
    IconComponent = WordIcon;
    badgeStyle = "bg-blue-100 text-blue-900 border-blue-300 shadow-2xs";
    labelText = "WORD";
  } else if (normalizedType.includes("PPT") || normalizedType.includes("POWERPOINT")) {
    IconComponent = PptIcon;
    badgeStyle = "bg-orange-100 text-orange-900 border-orange-300 shadow-2xs";
    labelText = "PPTX";
  } else if (normalizedType.includes("ZIP") || normalizedType.includes("RAR") || normalizedType.includes("7Z")) {
    IconComponent = ZipIcon;
    badgeStyle = "bg-purple-100 text-purple-900 border-purple-300 shadow-2xs";
    labelText = "ZIP";
  } else if (
    normalizedType.includes("PNG") ||
    normalizedType.includes("JPG") ||
    normalizedType.includes("JPEG") ||
    normalizedType.includes("IMAGE") ||
    normalizedType.includes("WEBP")
  ) {
    IconComponent = ImageIcon;
    badgeStyle = "bg-sky-100 text-sky-900 border-sky-300 shadow-2xs";
    labelText = "IMAGE";
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <IconComponent size={size} />
      {showLabelBadge && (
        <span
          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black border font-mono tracking-wider shadow-2xs ${badgeStyle}`}
        >
          {labelText}
        </span>
      )}
    </div>
  );
}
