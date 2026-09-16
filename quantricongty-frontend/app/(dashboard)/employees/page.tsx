"use client";

import React, { useState } from "react";
import { useApp } from "@/app/context/AppContext";
import { Employee } from "@/app/data/seed-employees";
import HumanResourcesView from "./components/HumanResourcesView";
import EmployeeProfileView from "./components/EmployeeProfileView";
import AddEmployeeModal from "./components/AddEmployeeModal";
import SendInviteModal from "./components/SendInviteModal";
import ExcelImportModal from "./components/ExcelImportModal";

export default function EmployeesPage() {
  const {
    employees,
    departments,
    searchQuery,
    handleDeleteEmployee,
    handleUpdateEmployee,
    handleDownloadTemplate,
    loadData,
    showToast,
  } = useApp();

  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("all");
  const [invitingEmployee, setInvitingEmployee] = useState<Employee | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);

  // ── Khi đang xem chi tiết nhân viên → render EmployeeProfileView (như trang profile)
  if (selectedEmployee) {
    return (
      <>
        <EmployeeProfileView
          employee={selectedEmployee}
          departments={departments}
          onBack={() => setSelectedEmployee(null)}
          onUpdateEmployee={async (id, updated) => {
            await handleUpdateEmployee(id, updated);
            // Refresh local employee state so the view stays in sync
            setSelectedEmployee((prev) => prev ? { ...prev, ...updated } : prev);
          }}
        />

        {/* Send invite modal vẫn cần accessible từ profile view nếu cần */}
        <SendInviteModal
          employee={invitingEmployee}
          isOpen={!!invitingEmployee}
          onClose={() => setInvitingEmployee(null)}
          onInviteSent={() => {
            showToast("Đã gửi thư mời kích hoạt tài khoản!");
            loadData();
          }}
        />
      </>
    );
  }

  // ── Danh sách nhân viên (mặc định)
  return (
    <>
      <HumanResourcesView
        employees={employees}
        departments={departments}
        searchQuery={searchQuery}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={setSelectedDepartment}
        onViewEmployee={(emp) => setSelectedEmployee(emp)}
        onEditEmployee={(emp) => setSelectedEmployee(emp)}
        onDeleteEmployee={handleDeleteEmployee}
        onSendInviteClick={(emp) => setInvitingEmployee(emp)}
        onAddEmployeeClick={() => setIsAddModalOpen(true)}
        onOpenImportModal={() => setIsImportModalOpen(true)}
        onDownloadTemplate={handleDownloadTemplate}
      />

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
  );
}

