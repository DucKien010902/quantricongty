"use client";

import React, { useState } from "react";
import { Building2, Users, ArrowRight, ShieldCheck, Plus, Pencil, Trash2, AlertTriangle } from "lucide-react";
import { COMPANY_DEPARTMENTS, DepartmentInfo } from "@/app/data/seed-employees";
import { useApp } from "@/app/context/AppContext";
import { canUserAccess } from "@/app/utils/permissions";
import DepartmentModal from "./DepartmentModal";
import Modal from "@/app/components/ui/Modal";

interface DepartmentsViewProps {
  departments: DepartmentInfo[];
  employees: any[];
  onSelectDepartment: (deptName: string) => void;
}

export default function DepartmentsView({
  departments,
  employees,
  onSelectDepartment,
}: DepartmentsViewProps) {
  const { currentUser, handleCreateDepartment, handleUpdateDepartment, handleDeleteDepartment } = useApp();
  const canManageDept = canUserAccess(currentUser, "departments.manage");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<DepartmentInfo | null>(null);
  const [deletingDept, setDeletingDept] = useState<DepartmentInfo | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Đảm bảo luôn có dữ liệu ban phòng hiển thị (fallback dữ liệu chuẩn Đông Hải)
  const displayDepartments =
    departments && departments.length > 0 ? departments : COMPANY_DEPARTMENTS;

  const handleOpenAddModal = () => {
    setEditingDept(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: DepartmentInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingDept(dept);
    setIsModalOpen(true);
  };

  const handleOpenDeleteModal = (dept: DepartmentInfo, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingDept(dept);
  };

  const handleModalSubmit = async (formData: any) => {
    if (editingDept) {
      const id = (editingDept as any)._id || editingDept.code || editingDept.name;
      await handleUpdateDepartment(id, formData);
    } else {
      await handleCreateDepartment(formData);
    }
  };

  const ConfirmDelete = async () => {
    if (!deletingDept) return;
    setIsDeleting(true);
    try {
      const id = (deletingDept as any)._id || deletingDept.code || deletingDept.name;
      await handleDeleteDepartment(id);
      setDeletingDept(null);
    } catch {
      // Handled in context
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner - Cỡ chữ to đồng bộ với trang Nhân sự */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-3">
            Cơ Cấu Ban & Khối Chuyên Môn
            <span className="text-xs sm:text-sm font-semibold px-3 py-1 rounded-full bg-blue-50 text-[#1b365d] border border-blue-200">
              {displayDepartments.length} ban / phòng
            </span>
          </h2>
          <p className="text-sm sm:text-base text-slate-500 font-medium mt-1">
            Sơ đồ tổ chức phân công chức năng, nhiệm vụ thuộc Công ty Đông Hải
          </p>
        </div>

        {canManageDept && (
          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs sm:text-sm font-bold shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Thêm Ban / Phòng Mới</span>
          </button>
        )}
      </div>

      {/* Grid Danh Sách Ban / Phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayDepartments.map((dept, idx) => {
          // Tính số nhân sự trực thuộc ban này từ danh sách nhân viên thực tế
          const deptEmployees = employees.filter(
            (e) =>
              e.department?.toLowerCase() === dept.name?.toLowerCase() ||
              e.department?.toLowerCase().includes(dept.name?.toLowerCase()) ||
              dept.name?.toLowerCase().includes(e.department?.toLowerCase())
          );
          const count = deptEmployees.length;

          // Lấy tên người phụ trách ban từ nhân sự thực tế trong ban
          let manager = dept.managerName || "Chưa có";
          if (manager === "Chưa có" && count > 0) {
            const leader = deptEmployees.find(
              (e) =>
                e.position?.toLowerCase().includes("trưởng") ||
                e.position?.toLowerCase().includes("lãnh đạo") ||
                e.position?.toLowerCase().includes("giám đốc") ||
                e.role?.toLowerCase().includes("trưởng") ||
                e.role?.toLowerCase().includes("giám đốc") ||
                e.role === "LEADER" ||
                e.role === "ADMIN"
            );
            manager = leader ? leader.name : "Chưa có";
          }

          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group relative"
            >
              <div>
                {/* Header card: Icon + Action Edit/Delete + Mã ban */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1b365d] group-hover:bg-[#1b365d] group-hover:text-white transition-colors shadow-2xs">
                    <Building2 className="w-6 h-6" />
                  </div>

                  <div className="flex items-center gap-1.5">
                    {canManageDept && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => handleOpenEditModal(dept, e)}
                          title="Chỉnh sửa thông tin phòng ban"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#1b365d] hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleOpenDeleteModal(dept, e)}
                          title="Xóa phòng ban này"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                    <span className="font-mono text-xs sm:text-sm font-bold px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80 ml-1">
                      {dept.code || `DHI-0${idx + 1}`}
                    </span>
                  </div>
                </div>

                {/* Tên ban */}
                <div className="mt-4">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug group-hover:text-[#1b365d] transition-colors">
                    {dept.name}
                  </h3>
                  {dept.description && (
                    <p className="text-xs text-slate-500 font-normal mt-1.5 line-clamp-2">
                      {dept.description}
                    </p>
                  )}
                </div>

                {/* Thông tin nhân sự & Trưởng ban - Chữ to rõ ràng đồng bộ */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      Phụ trách ban:
                    </span>
                    <span
                      className={`font-bold ${
                        manager !== "Chưa có" ? "text-slate-800" : "text-slate-400 font-normal italic"
                      }`}
                    >
                      {manager}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      Quy mô quân số:
                    </span>
                    <span
                      className={`font-bold px-2.5 py-0.5 rounded-lg border ${
                        count > 0
                          ? "text-[#1b365d] bg-blue-50/90 border-blue-100/60"
                          : "text-slate-400 bg-slate-50 border-slate-200/80 font-normal italic"
                      }`}
                    >
                      {count > 0 ? `${count} cán bộ` : "Chưa có"}
                    </span>
                  </div>

                  {/* Avatars nhân sự thuộc ban */}
                  {count > 0 && (
                    <div className="pt-2 flex items-center justify-between">
                      <span className="text-xs sm:text-sm text-slate-400 font-medium">
                        Cán bộ ban:
                      </span>
                      <div className="flex -space-x-2">
                        {deptEmployees.slice(0, 4).map((emp, eIdx) => (
                          <img
                            key={eIdx}
                            src={emp.avatar || "/stock-user.png"}
                            alt={emp.name}
                            title={emp.name}
                            className="w-7 h-7 rounded-full border-2 border-white object-cover shadow-xs"
                          />
                        ))}
                        {count > 4 && (
                          <div className="w-7 h-7 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-600">
                            +{count - 4}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Nút hành động chuyển sang tab nhân sự đúng ban phòng */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <button
                  onClick={() => onSelectDepartment(dept.name)}
                  className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-[#1b365d] text-slate-700 hover:text-white text-sm font-semibold transition-all flex items-center justify-center gap-2 shadow-xs group-hover:bg-[#1b365d] group-hover:text-white"
                >
                  <span>Xem danh sách nhân sự</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Thêm Mới / Chỉnh Sửa Phòng Ban */}
      <DepartmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        department={editingDept}
        employees={employees}
        onSubmit={handleModalSubmit}
      />

      {/* Modal Xác Nhận Xóa Phòng Ban */}
      {deletingDept && (
        <Modal
          isOpen={Boolean(deletingDept)}
          onClose={() => setDeletingDept(null)}
          size="sm"
          title="Xác nhận xóa ban / phòng ban"
        >
          <div className="p-5 space-y-4">
            <div className="flex items-center gap-3 text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <p className="text-xs font-semibold text-rose-900 leading-snug">
                Bạn có chắc chắn muốn xóa phòng ban <strong className="font-bold">{deletingDept.name}</strong>?
              </p>
            </div>
            <p className="text-xs text-slate-500">
              Hành động này sẽ xóa tên phòng ban khỏi danh mục sơ đồ tổ chức.
            </p>
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDeletingDept(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={ConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? "Đang xóa..." : "Xác Nhận Xóa"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
