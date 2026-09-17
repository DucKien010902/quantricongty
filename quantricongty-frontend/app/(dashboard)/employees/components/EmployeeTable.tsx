"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import {
  Mail,
  Phone,
  Edit2,
  Trash2,
  LayoutGrid,
  List,
  AlertCircle,
  Send,
  ChevronDown,
  MoreHorizontal,
  Eye,
} from "lucide-react";
import { Employee } from "@/app/data/seed-employees";

interface EmployeeTableProps {
  employees: Employee[];
  departments: Array<{ name: string; code?: string }>;
  searchQuery: string;
  selectedDepartment?: string;
  onDepartmentChange?: (dept: string) => void;
  onViewEmployee: (emp: Employee) => void;
  onEditEmployee: (emp: Employee) => void;
  onDeleteEmployee: (empId: string) => void;
  onSendInviteClick: (emp: Employee) => void;
  onAddEmployeeClick: () => void;
  canManage?: boolean;
}

export default function EmployeeTable({
  employees,
  departments,
  searchQuery,
  selectedDepartment: controlledDepartment,
  onDepartmentChange,
  onViewEmployee,
  onEditEmployee,
  onDeleteEmployee,
  onSendInviteClick,
  canManage = true,
}: EmployeeTableProps) {
  const [internalDept, setInternalDept] = useState<string>("all");
  const selectedDepartment =
    controlledDepartment !== undefined ? controlledDepartment : internalDept;

  const handleDeptChange = (dept: string) => {
    if (onDepartmentChange) {
      onDepartmentChange(dept);
    } else {
      setInternalDept(dept);
    }
  };

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
  const [activeMenuEmp, setActiveMenuEmp] = useState<{
    emp: Employee;
    top: number;
    right: number;
  } | null>(null);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Tìm phòng ban khớp trong danh sách để gán value cho thẻ <select>
  const matchedDeptInList = departments.find(
    (d) =>
      d.name.toLowerCase() === selectedDepartment.toLowerCase() ||
      d.name.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
      selectedDepartment.toLowerCase().includes(d.name.toLowerCase())
  );
  const selectValue =
    selectedDepartment === "all"
      ? "all"
      : matchedDeptInList
      ? matchedDeptInList.name
      : selectedDepartment;

  // Filter logic
  const filteredEmployees = employees.filter((emp) => {
    const query = searchQuery.toLowerCase();
    const matchSearch =
      emp.name.toLowerCase().includes(query) ||
      emp.email.toLowerCase().includes(query) ||
      (emp.id && emp.id.toLowerCase().includes(query)) ||
      (emp.role && emp.role.toLowerCase().includes(query)) ||
      (emp.department && emp.department.toLowerCase().includes(query));

    const matchDept =
      !selectedDepartment ||
      selectedDepartment === "all" ||
      emp.department === selectedDepartment ||
      emp.department === selectValue ||
      emp.department?.toLowerCase() === selectedDepartment.toLowerCase() ||
      emp.department?.toLowerCase().includes(selectedDepartment.toLowerCase()) ||
      selectedDepartment.toLowerCase().includes(emp.department?.toLowerCase()) ||
      (matchedDeptInList && (
        emp.department?.toLowerCase().includes(matchedDeptInList.name.toLowerCase()) ||
        matchedDeptInList.name.toLowerCase().includes(emp.department?.toLowerCase())
      ));

    const matchStatus =
      selectedStatus === "all" || emp.status === selectedStatus;

    return matchSearch && matchDept && matchStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            Chính thức
          </span>
        );
      case "invited":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-800 border border-indigo-200 whitespace-nowrap">
            <Send className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
            Đã gửi thư mời
          </span>
        );
      case "probation":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
            Thử việc
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 whitespace-nowrap">
            Tạm hoãn
          </span>
        );
    }
  };

  const getRoleDisplayName = (role?: string, pos?: string) => {
    if (pos && pos.trim() !== "" && !pos.startsWith("HEAD_")) return pos;
    if (role === "ADMIN") return "Quản trị viên";
    if (role === "LEADER") return "Trưởng ban";
    if (role === "USER") return "Nhân viên";
    if (role === "CHAIRMAN") return "Chủ tịch HĐQT & CEO";
    if (role === "CEO") return "Tổng Giám Đốc";
    if (role === "HEAD_OF_DEPARTMENT") return "Trưởng Ban Chuyên Môn";
    if (role === "DEPUTY_HEAD") return "Phó Ban Chuyên Môn";
    if (role === "SPECIALIST") return "Chuyên viên chính thức";
    if (role === "PROBATION") return "Nhân viên thử việc";
    return role || "Cán bộ nhân viên";
  };

  return (
    <div className="space-y-4">
      {/* Controls: Tab trạng thái & Select phòng ban */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Tabs trạng thái */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: "all", label: "Tất cả", count: employees.length },
              {
                id: "active",
                label: "Chính thức",
                count: employees.filter((e) => e.status === "active").length,
              },
              {
                id: "invited",
                label: "Đã gửi thư mời",
                count: employees.filter((e) => (e as any).status === "invited").length,
              },
              {
                id: "probation",
                label: "Thử việc",
                count: employees.filter((e) => e.status === "probation").length,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  selectedStatus === tab.id
                    ? "bg-[#1b365d] text-white shadow-xs font-bold"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                <span>{tab.label}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-mono font-bold ${
                  selectedStatus === tab.id ? "bg-white/20 text-white" : "bg-slate-200 text-slate-700"
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Select phòng ban & Chế độ xem */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="relative">
              <select
                value={selectValue}
                onChange={(e) => handleDeptChange(e.target.value)}
                className={`appearance-none pl-3.5 pr-8 py-2 rounded-xl text-xs font-semibold cursor-pointer border focus:outline-none focus:ring-2 focus:ring-[#1b365d]/20 transition-all ${
                  selectedDepartment !== "all"
                    ? "bg-[#1b365d] text-white border-[#1b365d] shadow-xs font-bold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                }`}
              >
                <option value="all" className="bg-white text-slate-800">
                  Phòng ban: Tất cả ({departments.length})
                </option>
                {selectValue !== "all" && !departments.some((d) => d.name === selectValue) && (
                  <option value={selectValue} className="bg-white text-slate-800">
                    {selectValue}
                  </option>
                )}
                {departments.map((dept, idx) => (
                  <option key={idx} value={dept.name} className="bg-white text-slate-800">
                    {dept.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                className={`w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none ${
                  selectedDepartment !== "all" ? "text-white/90" : "text-slate-500"
                }`}
              />
            </div>

            {/* 2 nút chế độ (Bảng / Thẻ) */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl">
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-white text-slate-800 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Dạng Bảng"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs font-medium transition-all ${
                  viewMode === "grid"
                    ? "bg-white text-slate-800 shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-800"
                }`}
                title="Dạng Thẻ"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Table or Grid */}
      {filteredEmployees.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/90 shadow-xs">
          <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <h3 className="text-base font-bold text-slate-800">
            Không tìm thấy nhân sự nào
          </h3>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Vui lòng thử tìm với từ khóa khác hoặc xóa bộ lọc.
          </p>
        </div>
      ) : viewMode === "table" ? (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3.5 px-5 min-w-[260px]">Nhân sự</th>
                  <th className="py-3.5 px-5 min-w-[200px]">Chức vụ & Phòng ban</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Trạng thái</th>
                  <th className="py-3.5 px-5 min-w-[220px]">Email / SĐT</th>
                  <th className="py-3.5 px-5 whitespace-nowrap">Ngày vào làm</th>
                  <th className="py-3.5 px-3 text-center w-16 whitespace-nowrap">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => (
                  <tr
                    key={(emp as any)._id || emp.id}
                    className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                    onClick={() => onViewEmployee(emp)}
                  >
                    {/* Profile */}
                    <td className="py-4 px-5 min-w-[260px]">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-slate-100 shadow-2xs">
                          <Image
                            src={
                              emp.avatar ||
                              "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                            }
                            alt={emp.name}
                            fill
                            className="object-cover"
                            sizes="44px"
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 group-hover:text-[#1b365d] transition-colors text-sm sm:text-base">
                            {emp.name}
                          </div>
                          <div className="text-xs text-slate-500 font-mono mt-0.5">
                            <span>{(emp as any).code || emp.id} • {emp.gender || "Nam/Nữ"}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department & Role */}
                    <td className="py-4 px-5">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {getRoleDisplayName((emp as any).role, (emp as any).position)}
                          </span>
                          {(emp as any).role === "ADMIN" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 border border-purple-200">
                              Admin
                            </span>
                          )}
                          {(emp as any).role === "LEADER" && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                              Leader
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-600 font-medium">
                          {emp.department}
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-5 whitespace-nowrap">{getStatusBadge(emp.status)}</td>

                    {/* Contact */}
                    <td className="py-4 px-5 space-y-1 text-xs">
                      <div className="flex items-center gap-2 text-slate-800 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate max-w-[200px]">{emp.email}</span>
                      </div>
                      {emp.phone && (
                        <div className="flex items-center gap-2 text-slate-500">
                          <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-mono">{emp.phone}</span>
                        </div>
                      )}
                    </td>

                    {/* Join Date */}
                    <td className="py-4 px-5 text-xs text-slate-700 font-medium whitespace-nowrap">
                      {emp.joinDate || "--"}
                    </td>

                    {/* Actions */}
                    <td
                      className="py-4 px-3 text-center w-16 whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const rect = e.currentTarget.getBoundingClientRect();
                          if (activeMenuEmp?.emp.id === emp.id) {
                            setActiveMenuEmp(null);
                          } else {
                            const menuHeight = 160;
                            const spaceBelow = window.innerHeight - rect.bottom;
                            const showAbove = spaceBelow < menuHeight && rect.top > menuHeight;
                            setActiveMenuEmp({
                              emp,
                              top: showAbove ? rect.top - menuHeight - 6 : rect.bottom + 6,
                              right: Math.max(12, window.innerWidth - rect.right),
                            });
                          }
                        }}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all mx-auto ${
                          activeMenuEmp?.emp.id === emp.id
                            ? "bg-[#1b365d] text-white shadow-xs"
                            : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
                        }`}
                        title="Tùy chọn thao tác"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEmployees.map((emp) => (
            <div
              key={(emp as any)._id || emp.id}
              onClick={() => onViewEmployee(emp)}
              className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group hover:border-[#1b365d]/50"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-100 flex-shrink-0 shadow-2xs">
                    <Image
                      src={
                        emp.avatar ||
                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
                      }
                      alt={emp.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  {getStatusBadge(emp.status)}
                </div>

                <div className="mt-3.5">
                  <h4 className="text-base font-bold text-slate-800 group-hover:text-[#1b365d] transition-colors">
                    {emp.name}
                  </h4>
                  <p className="text-sm font-semibold text-[#1b365d] mt-0.5">
                    {getRoleDisplayName((emp as any).role, (emp as any).position)}
                  </p>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                    {emp.department}
                  </p>
                </div>

                <div className="mt-3.5 pt-3 border-t border-slate-100 space-y-1.5 text-sm text-slate-600">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.email}</span>
                  </div>
                  {emp.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{emp.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono text-xs">
                  {(emp as any).code || emp.id}
                </span>
                <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => onSendInviteClick(emp)}
                    className="p-2 rounded-xl text-slate-500 hover:text-[#1b365d] hover:bg-blue-50 transition-colors"
                    title="Gửi thư mời"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onEditEmployee(emp)}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-[#1b365d] hover:text-white text-slate-700 font-semibold transition-colors text-xs sm:text-sm"
                  >
                    Sửa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MENU THAO TÁC NỔI KHI BẤM NÚT 3 CHẤM */}
      {activeMenuEmp && mounted && createPortal(
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setActiveMenuEmp(null)}
          />
          <div
            className="fixed z-50 w-48 bg-white rounded-2xl border border-slate-200 shadow-xl py-1.5 animate-in fade-in zoom-in-95 duration-100 text-left overflow-hidden"
            style={{ top: activeMenuEmp.top, right: activeMenuEmp.right }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-3.5 py-2 border-b border-slate-100 mb-1 bg-slate-50/70">
              <p className="text-xs font-bold text-slate-800 truncate">
                {activeMenuEmp.emp.name}
              </p>
              <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                {(activeMenuEmp.emp as any).code || activeMenuEmp.emp.id}
              </p>
            </div>

            <button
              onClick={() => {
                const emp = activeMenuEmp.emp;
                setActiveMenuEmp(null);
                onViewEmployee(emp);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-[#1b365d] transition-colors"
            >
              <Eye className="w-4 h-4 text-[#1b365d]" />
              <span>Xem chi tiết</span>
            </button>

            {canManage && (
              <button
                onClick={() => {
                  const emp = activeMenuEmp.emp;
                  setActiveMenuEmp(null);
                  onEditEmployee(emp);
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
              >
                <Edit2 className="w-4 h-4 text-emerald-600" />
                <span>Sửa hồ sơ</span>
              </button>
            )}

            {canManage && <div className="border-t border-slate-100 my-1" />}

            {canManage && (
              <button
                onClick={() => {
                  const emp = activeMenuEmp.emp;
                  setActiveMenuEmp(null);
                  if (confirm(`Bạn có chắc muốn xóa hồ sơ ${emp.name}?`)) {
                    onDeleteEmployee((emp as any)._id || emp.id);
                  }
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
              >
                <Trash2 className="w-4 h-4 text-rose-500" />
                <span>Xóa nhân sự</span>
              </button>
            )}
          </div>
        </>,
        document.body
      )}

    </div>
  );
}
