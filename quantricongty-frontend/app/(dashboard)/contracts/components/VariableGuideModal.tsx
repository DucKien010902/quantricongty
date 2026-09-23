"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  Copy,
  Check,
  Download,
  Info,
} from "lucide-react";
import Modal from "@/app/components/ui/Modal";
import { CONTRACT_VARIABLES } from "../data/contractVariables";

interface VariableGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDownloadSampleTemplate?: () => void;
  showToast: (msg: string) => void;
}

export default function VariableGuideModal({
  isOpen,
  onClose,
  onDownloadSampleTemplate,
  showToast,
}: VariableGuideModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [copiedTag, setCopiedTag] = useState<string | null>(null);

  const categories = useMemo(
    () => [
      { id: "all", label: "Tất cả các trường", count: CONTRACT_VARIABLES.length },
      {
        id: "employee",
        label: "Người lao động (Bên B)",
        count: CONTRACT_VARIABLES.filter((v) => v.category === "employee").length,
      },
      {
        id: "company",
        label: "Người sử dụng LĐ (Bên A)",
        count: CONTRACT_VARIABLES.filter((v) => v.category === "company").length,
      },
      {
        id: "contract",
        label: "Điều khoản & Lương",
        count: CONTRACT_VARIABLES.filter((v) => v.category === "contract").length,
      },
    ],
    []
  );

  const filteredVariables = useMemo(() => {
    return CONTRACT_VARIABLES.filter((item) => {
      if (selectedCategory !== "all" && item.category !== selectedCategory) {
        return false;
      }
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        return (
          item.tag.toLowerCase().includes(q) ||
          item.label.toLowerCase().includes(q) ||
          item.description.toLowerCase().includes(q) ||
          item.example.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [selectedCategory, searchQuery]);

  const handleCopy = (tag: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(tag);
      setCopiedTag(tag);
      showToast(`Đã sao chép thẻ ${tag}!`);
      setTimeout(() => setCopiedTag(null), 2500);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" hideHeader className="p-0 overflow-hidden">
      <div className="flex flex-col h-[90vh] max-h-[850px] bg-slate-50 overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-[#1b365d] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base sm:text-lg font-bold">
                Danh Mục Biến Mẫu Hợp Đồng (.docx)
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 font-semibold border border-white/10">
                {CONTRACT_VARIABLES.length} thẻ có sẵn
              </span>
            </div>
            <p className="text-xs text-slate-300 font-normal mt-0.5">
              Bấm nút "Sao chép" để lấy thẻ dán trực tiếp vào file Word. Dữ liệu sẽ tự động điền từ cơ sở dữ liệu khi tạo hợp đồng.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOP NOTICE & HOW-TO USE */}
        <div className="bg-white border-b border-slate-200 px-6 py-3.5 shrink-0 shadow-2xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-slate-700">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#1b365d] shrink-0" />
              <span>
                <strong>Quy tắc:</strong> Giữ nguyên cặp ngoặc nhọn kép <code className="bg-white px-1.5 py-0.5 rounded font-mono font-bold text-[#1b365d] border border-blue-200">{"{{tên_thẻ}}"}</code>. Bạn có thể tự do định dạng font chữ, in đậm, in nghiêng trong Word.
              </span>
            </div>
            {onDownloadSampleTemplate && (
              <button
                type="button"
                onClick={onDownloadSampleTemplate}
                className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#1b365d] text-white font-bold hover:bg-[#152a4a] transition-all shadow-xs text-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải file Word mẫu chuẩn (.docx)</span>
              </button>
            )}
          </div>

          {/* SEARCH & CATEGORY FILTER TABS */}
          <div className="mt-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Tìm thẻ (ví dụ: fullName, salary, dob, cccd)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 focus:border-[#1b365d]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#1b365d] text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
                    }`}
                  >
                    <span>{cat.label}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSelected ? "bg-white/20 text-white" : "bg-white text-slate-600 border border-slate-200"
                      }`}
                    >
                      {cat.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* TABLE HEADER (COLUMN TITLES) */}
        <div className="px-6 py-2.5 bg-slate-100/90 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden md:grid grid-cols-12 gap-4 shrink-0">
          <div className="col-span-4">Thẻ chèn vào file Word</div>
          <div className="col-span-5">Ý nghĩa trường & Giải thích</div>
          <div className="col-span-3">Dữ liệu mẫu từ CSDL</div>
        </div>

        {/* VARIABLES LIST TABLE */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {filteredVariables.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300">
              <Search className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">Không tìm thấy biến phù hợp</p>
              <p className="text-xs text-slate-400 mt-1">Thử nhập từ khóa tìm kiếm khác hoặc chuyển phân loại</p>
            </div>
          ) : (
            filteredVariables.map((item, idx) => {
              const isCopied = copiedTag === item.tag;
              return (
                <div
                  key={idx}
                  className="px-4 py-3 bg-white rounded-xl border border-slate-200/80 hover:border-blue-300 hover:shadow-xs transition-all grid grid-cols-1 md:grid-cols-12 gap-3 items-center"
                >
                  {/* Cột 1: Mã thẻ & Nút sao chép */}
                  <div className="md:col-span-4 flex items-center gap-2">
                    <code className="px-2.5 py-1 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs font-bold tracking-wide select-all">
                      {item.tag}
                    </code>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.tag)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 cursor-pointer ${
                        isCopied
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-slate-100 text-slate-700 hover:bg-[#1b365d] hover:text-white border border-slate-200"
                      }`}
                      title="Sao chép thẻ này"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Đã chép!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Cột 2: Tên trường & Mô tả */}
                  <div className="md:col-span-5 min-w-0 pr-2">
                    <div className="text-xs font-bold text-slate-900 truncate">
                      {item.label}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                      {item.description}
                    </div>
                  </div>

                  {/* Cột 3: Giá trị mẫu thực tế */}
                  <div className="md:col-span-3 min-w-0">
                    <div
                      className="px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80 text-xs font-medium text-slate-700 truncate"
                      title={item.example}
                    >
                      {item.example}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3.5 px-6 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            Đang hiển thị <strong>{filteredVariables.length}</strong> / {CONTRACT_VARIABLES.length} trường
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </Modal>
  );
}
