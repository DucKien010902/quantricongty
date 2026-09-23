"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  FolderOpen,
  FileText,
  Upload,
  Download,
  Search,
  Eye,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import DocumentTypeIcon from "@/app/components/ui/DocumentTypeIcon";
import UploadDocumentModal from "./UploadDocumentModal";
import Modal from "@/app/components/ui/Modal";
import { API_URL } from "@/app/config/api";

interface DocItem {
  _id?: string;
  id?: string;
  title: string;
  category: "rules" | "contracts" | "forms" | "finance" | "other" | string;
  type: string;
  size: string;
  fileUrl: string;
  objectKey: string;
  updatedAt?: string;
  createdAt?: string;
  author: string;
  description?: string;
}

export default function DocumentsView() {
  const [documents, setDocuments] = useState<DocItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [deleteConfirmTarget, setDeleteConfirmTarget] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Tải danh sách tài liệu thực tế từ Backend MongoDB & MinIO
  const loadDocuments = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/documents`);
      if (res.ok) {
        const data = await res.json();
        setDocuments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error("Lỗi khi tải danh sách tài liệu:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  // Xóa tài liệu thực từ DB & MinIO S3
  const handleConfirmDelete = async () => {
    if (!deleteConfirmTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${API_URL}/documents/${deleteConfirmTarget.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast(`Đã xóa tài liệu "${deleteConfirmTarget.title}" khỏi hệ thống thành công!`);
        loadDocuments();
      } else {
        const err = await res.json().catch(() => ({}));
        showToast(err.message || "Không thể xóa tài liệu. Vui lòng thử lại!");
      }
    } catch {
      showToast("Lỗi kết nối máy chủ khi xóa tài liệu!");
    } finally {
      setIsDeleting(false);
      setDeleteConfirmTarget(null);
    }
  };

  // Filtered documents theo tìm kiếm từ khóa
  const filteredDocs = useMemo(() => {
    if (!searchQuery.trim()) return documents;
    const q = searchQuery.toLowerCase();
    return documents.filter(
      (d) =>
        (d.title || "").toLowerCase().includes(q) ||
        (d.author || "").toLowerCase().includes(q) ||
        (d.type || "").toLowerCase().includes(q) ||
        (d.description || "").toLowerCase().includes(q)
    );
  }, [documents, searchQuery]);

  return (
    <div className="space-y-6 pb-12 animate-fade-in w-full max-w-[1600px] mx-auto relative">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900/95 text-white shadow-xl backdrop-blur-sm border border-slate-700 text-sm animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BANNER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FolderOpen className="w-6 h-6 text-[#1b365d]" />
            Kho tài liệu doanh nghiệp
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Lưu trữ trực tiếp tệp trên MinIO S3, tra cứu quy chế, biểu mẫu và văn bản hành chính lưu hành nội bộ
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsUploadModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-sm font-semibold shadow-md shadow-[#1b365d]/20 transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
        >
          <Upload className="w-4 h-4 stroke-[2.5]" />
          <span>Tải lên tài liệu (.pdf, .docx, .xlsx...)</span>
        </button>
      </div>

      {/* BẢNG TÀI LIỆU VỚI TÌM KIẾM THEO TÊN */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Header Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/50 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">Danh sách văn bản & tài liệu thực tế</h2>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Hiển thị ({filteredDocs.length} / {documents.length} tài liệu)
            </p>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm kiếm tài liệu theo tên, đơn vị, định dạng..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={loadDocuments}
              className="p-2.5 rounded-xl text-slate-500 hover:text-[#1b365d] hover:bg-white border border-transparent hover:border-slate-200 transition-all cursor-pointer shrink-0"
              title="Tải lại danh sách"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Document Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold tracking-wider text-xs">
              <tr>
                <th className="py-3.5 px-5 text-left min-w-[150px]">Định dạng</th>
                <th className="py-3.5 px-4 min-w-[280px]">Tên văn bản & Tài liệu</th>
                <th className="py-3.5 px-4 min-w-[160px]">Đơn vị ban hành</th>
                <th className="py-3.5 px-3 text-center min-w-[100px]">Dung lượng</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Ngày cập nhật</th>
                <th className="py-3.5 px-4 text-center min-w-[120px]">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#1b365d]" />
                      <span className="text-sm font-medium">Đang tải danh sách tài liệu từ MinIO S3...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="w-10 h-10 text-slate-300 mb-1" />
                      <span className="text-sm font-bold text-slate-700">Chưa có tài liệu nào</span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        Hãy nhấn vào nút <b>"Tải lên tài liệu"</b> để tải các tệp PDF, Word, Excel thực tế lưu trữ trực tiếp trên MinIO.
                      </p>
                      <button
                        type="button"
                        onClick={() => setIsUploadModalOpen(true)}
                        className="mt-2 px-4 py-2 rounded-xl bg-[#1b365d] text-white text-xs font-bold hover:bg-[#152a4a] transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải lên tài liệu ngay</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const docId = doc._id || doc.id || "";
                  const updatedDate = doc.updatedAt
                    ? new Date(doc.updatedAt).toLocaleDateString("vi-VN")
                    : doc.createdAt
                    ? new Date(doc.createdAt).toLocaleDateString("vi-VN")
                    : "23/09/2026";

                  return (
                    <tr key={docId} className="hover:bg-slate-50/80 transition-colors">
                      {/* Định dạng tệp - Căn lề trái bằng tắp */}
                      <td className="py-4 px-5 text-left whitespace-nowrap">
                        <div className="flex items-center justify-start">
                          <DocumentTypeIcon type={doc.type} size="md" />
                        </div>
                      </td>

                      {/* Tên văn bản */}
                      <td className="py-4 px-4 max-w-md">
                        <h4 className="font-bold text-slate-900 text-sm leading-snug">{doc.title}</h4>
                        {doc.description && (
                          <p className="text-xs text-slate-400 mt-0.5 line-clamp-1 font-normal">
                            {doc.description}
                          </p>
                        )}
                      </td>

                      {/* Đơn vị ban hành */}
                      <td className="py-4 px-4 text-slate-700 text-xs font-semibold">
                        {doc.author || "Ban Giám Đốc"}
                      </td>

                      {/* Dung lượng */}
                      <td className="py-4 px-3 text-center">
                        <span className="inline-block px-2.5 py-1 rounded-lg font-mono font-bold text-xs text-slate-700 bg-slate-100 border border-slate-200">
                          {doc.size || "100 KB"}
                        </span>
                      </td>

                      {/* Ngày cập nhật */}
                      <td className="py-4 px-4 text-center font-medium text-xs text-slate-700 whitespace-nowrap font-mono">
                        {updatedDate}
                      </td>

                      {/* Hành động */}
                      <td className="py-4 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Xem trực tuyến / Mở file */}
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl text-slate-500 hover:text-[#1b365d] hover:bg-blue-50 border border-transparent hover:border-blue-200 transition-all"
                              title="Xem / Tải file từ MinIO"
                            >
                              <Eye className="w-4 h-4" />
                            </a>
                          )}

                          {/* Tải tệp từ MinIO */}
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              download
                              target="_blank"
                              rel="noreferrer"
                              className="p-2 rounded-xl text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 border border-transparent hover:border-emerald-200 transition-all"
                              title="Tải tệp về máy"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          )}

                          {/* Nút Xóa tài liệu */}
                          <button
                            type="button"
                            onClick={() =>
                              setDeleteConfirmTarget({
                                id: docId,
                                title: doc.title,
                              })
                            }
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all cursor-pointer"
                            title="Xóa tài liệu này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TẢI LÊN TÀI LIỆU MỚI */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={loadDocuments}
        showToast={showToast}
      />

      {/* MODAL XÁC NHẬN XÓA TÀI LIỆU */}
      {deleteConfirmTarget && (
        <Modal
          isOpen={Boolean(deleteConfirmTarget)}
          onClose={() => setDeleteConfirmTarget(null)}
          size="sm"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Xác nhận xóa tài liệu?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Bạn có chắc chắn muốn xóa văn bản <b>"{deleteConfirmTarget.title}"</b>? Tệp sẽ bị xóa vĩnh viễn khỏi máy chủ MinIO S3 và cơ sở dữ liệu.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTarget(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Đồng ý xóa"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
