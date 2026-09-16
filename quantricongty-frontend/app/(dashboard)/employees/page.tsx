"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/app/context/AppContext";
import { Employee } from "@/app/data/seed-employees";
import { usePermission } from "@/app/hooks/usePermission";
import HumanResourcesView from "./components/HumanResourcesView";
import EmployeeProfileView from "./components/EmployeeProfileView";
import AddEmployeeModal from "./components/AddEmployeeModal";
import SendInviteModal from "./components/SendInviteModal";
import ExcelImportModal from "./components/ExcelImportModal";

export default function EmployeesPage() {
  const router = useRouter();
  const {
    employees,
    departments,
    searchQuery,
    currentUser,
    isAuthLoaded,
    handleDeleteEmployee,
    handleUpdateEmployee,
    handleDownloadTemplate,
    loadData,
    showToast,
  } = useApp();

  const { can, isLeader, isHR, isAdmin } = usePermission();

  const canViewEmployees = can("employees.view");
  const canManageEmployees = can("employees.manage");
  const canExportEmployees = can("employees.export");

  // Kiểm tra nếu là Trưởng ban chuyên môn (không phải Admin và không phải HCNS)
  const isLeaderOnly = !isAdmin && !isHR && isLeader;
  const userDept = currentUser?.department || "";

  // 1. Phân quyền truy cập trang: Nếu không có quyền xem thì chuyển hướng
  useEffect(() => {
    if (isAuthLoaded && currentUser && !canViewEmployees) {
      router.replace("/attendance");
    }
  }, [isAuthLoaded, currentUser, canViewEmployees, router]);

  // 2. Phạm vi dữ liệu (Scope):
  // Trưởng ban chỉ xem danh sách nhân sự thuộc đúng phòng ban của mình
  const scopedEmployees = useMemo(() => {
    if (isLeaderOnly && userDept) {
      return employees.filter(
        (e) =>
          e.department?.toLowerCase() === userDept.toLowerCase() ||
          e.department?.toLowerCase().includes(userDept.toLowerCase()) ||
          userDept.toLowerCase().includes(e.department?.toLowerCase())
      );
    }
    return employees;
  }, [employees, isLeaderOnly, userDept]);

  const scopedDepartments = useMemo(() => {
    if (isLeaderOnly && userDept) {
      return departments.filter(
        (d) =>
          d.name?.toLowerCase() === userDept.toLowerCase() ||
          d.name?.toLowerCase().includes(userDept.toLowerCase()) ||
          userDept.toLowerCase().includes(d.name?.toLowerCase())
      );
    }
    return departments;
  }, [departments, isLeaderOnly, userDept]);

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>(
    isLeaderOnly && userDept ? userDept : "all"
  );
  const [invitingEmployee, setInvitingEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const dept = params.get("dept");
      if (dept) {
        setSelectedDepartment(dept);
      } else if (isLeaderOnly && userDept) {
        setSelectedDepartment(userDept);
      }
    }
  }, [isLeaderOnly, userDept]);

  if (!isAuthLoaded || !currentUser) {
    return null;
  }

  // Nếu không có quyền xem nhân viên
  if (!canViewEmployees) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mb-4">
          <span className="text-2xl">🔒</span>
        </div>
        <h2 className="text-lg font-bold text-slate-800 mb-1">
          Bạn không có quyền truy cập Quản lý nhân sự
        </h2>
        <p className="text-sm text-slate-500 mb-4 max-w-md">
          Chỉ Quản trị viên, cán bộ HCNS và Trưởng ban mới có thẩm quyền truy cập danh sách nhân viên.
        </p>
        <button
          onClick={() => router.replace("/attendance")}
          className="px-4 py-2 bg-[#1b365d] text-white text-xs font-semibold rounded-xl hover:bg-[#152a4a] transition-all"
        >
          Đi tới Chấm công & Thời gian làm việc
        </button>
      </div>
    );
  }

  // ── Khi đang xem chi tiết nhân viên → render EmployeeProfileView
  if (selectedEmployee) {
    return (
      <>
        <EmployeeProfileView
          employee={selectedEmployee}
          departments={departments}
          onBack={() => setSelectedEmployee(null)}
          canEdit={canManageEmployees}
          onUpdateEmployee={async (id, updated) => {
            if (!canManageEmployees) {
              showToast("Bạn không có quyền chỉnh sửa hồ sơ nhân sự!");
              return;
            }
            await handleUpdateEmployee(id, updated);
            setSelectedEmployee((prev) => (prev ? { ...prev, ...updated } : prev));
          }}
        />

        {/* Send invite modal */}
        {canManageEmployees && (
          <SendInviteModal
            employee={invitingEmployee}
            isOpen={!!invitingEmployee}
            onClose={() => setInvitingEmployee(null)}
            onInviteSent={() => {
              showToast("Đã gửi thư mời kích hoạt tài khoản!");
              loadData();
            }}
          />
        )}
      </>
    );
  }

  // ── Danh sách nhân viên (mặc định)
  return (
    <>
      <HumanResourcesView
        employees={scopedEmployees}
        departments={scopedDepartments}
        searchQuery={searchQuery}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        onViewEmployee={(emp) => setSelectedEmployee(emp)}
        onEditEmployee={(emp) => {
          if (canManageEmployees) {
            setSelectedEmployee(emp);
          } else {
            // Trưởng ban chỉ xem chi tiết, không mở modal sửa
            setSelectedEmployee(emp);
          }
        }}
        onDeleteEmployee={(id) => {
          if (!canManageEmployees) {
            showToast("Bạn không có quyền xóa hồ sơ nhân sự!");
            return;
          }
          handleDeleteEmployee(id);
        }}
        onSendInviteClick={(emp) => {
          if (!canManageEmployees) {
            showToast("Bạn không có quyền gửi thư mời tài khoản!");
            return;
          }
          setInvitingEmployee(emp);
        }}
        onAddEmployeeClick={() => {
          if (!canManageEmployees) {
            showToast("Bạn không có quyền thêm nhân viên mới!");
            return;
          }
          setIsAddModalOpen(true);
        }}
        onOpenImportModal={() => {
          if (!canManageEmployees) {
            showToast("Bạn không có quyền nhập dữ liệu từ Excel!");
            return;
          }
          setIsImportModalOpen(true);
        }}
        onDownloadTemplate={handleDownloadTemplate}
        canManage={canManageEmployees}
        canExport={canExportEmployees}
        isLeaderOnly={isLeaderOnly}
        userDepartment={userDept}
      />

      {canManageEmployees && (
        <>
          <SendInviteModal
            employee={invitingEmployee}
            isOpen={!!invitingEmployee}
            onClose={() => setInvitingEmployee(null)}
            onInviteSent={() => {
              showToast("Đã gửi thư mời kích hoạt tài khoản!");
              loadData();
            }}
          />

          <AddEmployeeModal
            departments={departments}
            isOpen={isAddModalOpen}
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={(created) => {
              showToast(`Đã thêm hồ sơ ${created.name}!`);
              loadData();
            }}
          />

          <ExcelImportModal
            isOpen={isImportModalOpen}
            onClose={() => setIsImportModalOpen(false)}
            onSuccess={() => {
              showToast("Nhập dữ liệu Excel thành công!");
              loadData();
            }}
            onDownloadTemplate={handleDownloadTemplate}
          />
        </>
      )}
    </>
  );
}
