"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle2,
  AlertCircle,
  Download,
  Loader2,
} from "lucide-react";

interface ExcelImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onDownloadTemplate: () => void;
}

export default function ExcelImportModal({
  isOpen,
  onClose,
  onSuccess,
  onDownloadTemplate,
}: ExcelImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [result, setResult] = useState<{
    total: number;
    imported: number;
    errors: string[];
  } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (
        !selected.name.endsWith(".xlsx") &&
        !selected.name.endsWith(".xls")
      ) {
        setErrorMsg("Vui lòng chọn file định dạng Excel (.xlsx hoặc .xls)");
        return;
      }
      setFile(selected);
      setErrorMsg(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMsg("Vui lòng chọn file Excel trước khi bấm nhập!");
      return;
    }

    setIsUploading(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:5002/api/employees/import-excel", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Lỗi khi import file Excel");
      }

      setResult(data);
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || "Không thể kết nối đến Backend!");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/70 dark:bg-slate-950/40">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Nhập Nhân Sự Từ File Excel
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Thêm hàng loạt nhân viên vào hệ thống DONG HAI INVEST
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-4 text-xs">
          {/* Instructions Box */}
          <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-900 dark:text-blue-300 flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5 text-blue-600" />
                Quy cách dữ liệu bắt buộc:
              </span>
              <button
                onClick={onDownloadTemplate}
                className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                <Download className="w-3 h-3" />
                Tải file mẫu chuẩn
              </button>
            </div>
            <ul className="list-disc list-inside text-slate-600 dark:text-slate-300 space-y-1 pl-1">
              <li>
                Cột bắt buộc: <strong className="text-slate-900 dark:text-white">Họ và tên</strong>,{" "}
                <strong className="text-slate-900 dark:text-white">Email</strong> (hệ thống tự sinh mã mời tham gia).
              </li>
              <li>
                Cột phân loại: <strong className="text-slate-900 dark:text-white">Phòng ban</strong>,{" "}
                <strong className="text-slate-900 dark:text-white">Chức vụ</strong>, Số điện thoại.
              </li>
              <li>Hệ thống tự động bỏ qua dòng trống và kiểm tra trùng lặp email.</li>
            </ul>
          </div>

          {/* Upload Area */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 transition-all flex flex-col items-center justify-center space-y-2"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx, .xls"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {file ? file.name : "Nhấn để chọn file Excel hoặc kéo thả vào đây"}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {file ? `${(file.size / 1024).toFixed(1)} KB` : "Chấp nhận định dạng .xlsx, .xls"}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Box */}
          {result && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Nhập thành công {result.imported} nhân sự vào hệ thống!</span>
              </div>
              {result.errors.length > 0 && (
                <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 text-[11px] text-amber-700 dark:text-amber-400 space-y-1 max-h-24 overflow-y-auto">
                  <p className="font-semibold">Lưu ý một số dòng:</p>
                  {result.errors.map((err, idx) => (
                    <p key={idx}>• {err}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Đóng
            </button>
            <button
              type="button"
              disabled={!file || isUploading}
              onClick={handleUpload}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50 transition-all"
            >
              {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isUploading ? "Đang xử lý..." : "Tiến Hành Nhập"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
