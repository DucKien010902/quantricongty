"use client";

import React from "react";
import { Building2, Users, ArrowRight, ShieldCheck } from "lucide-react";
import { COMPANY_DEPARTMENTS, DepartmentInfo } from "@/app/data/seed-employees";

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
  // Đảm bảo luôn có dữ liệu ban phòng hiển thị (fallback dữ liệu chuẩn Đông Hải)
  const displayDepartments =
    departments && departments.length > 0 ? departments : COMPANY_DEPARTMENTS;

  return (
    <div className="space-y-6">
      {/* Header Banner - Cỡ chữ to đồng bộ với trang Nhân sự */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
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
      </div>

      {/* Grid Danh Sách Ban / Phòng */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayDepartments.map((dept, idx) => {
          // Tính số nhân sự trực thuộc ban này
          const deptEmployees = employees.filter(
            (e) =>
              e.department?.toLowerCase() === dept.name?.toLowerCase() ||
              e.department?.toLowerCase().includes(dept.name?.toLowerCase()) ||
              dept.name?.toLowerCase().includes(e.department?.toLowerCase())
          );
          const count = deptEmployees.length;

          // Lấy tên trưởng ban
          const manager =
            dept.managerName ||
            dept.manager ||
            deptEmployees.find(
              (e) =>
                e.role?.toLowerCase().includes("trưởng") ||
                e.role?.toLowerCase().includes("giám đốc")
            )?.name ||
            "Đang kiện toàn";

          return (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header card: Icon + Mã ban */}
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-[#1b365d] group-hover:bg-[#1b365d] group-hover:text-white transition-colors shadow-2xs">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200/80">
                    {dept.code || `DHI-0${idx + 1}`}
                  </span>
                </div>

                {/* Tên ban (Đã bỏ phần mô tả chức năng theo yêu cầu) */}
                <div className="mt-5">
                  <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug group-hover:text-[#1b365d] transition-colors">
                    {dept.name}
                  </h3>
                </div>

                {/* Thông tin nhân sự & Trưởng ban - Chữ to rõ ràng đồng bộ */}
                <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-slate-400" />
                      Phụ trách ban:
                    </span>
                    <span className="font-bold text-slate-800">
                      {manager}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium flex items-center gap-2">
                      <Users className="w-4 h-4 text-slate-400" />
                      Quy mô quân số:
                    </span>
                    <span className="font-bold text-[#1b365d] bg-blue-50/90 border border-blue-100/60 px-2.5 py-0.5 rounded-lg">
                      {count > 0 ? `${count} cán bộ` : "Mới thành lập"}
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
                            src={emp.avatar}
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
    </div>
  );
}
