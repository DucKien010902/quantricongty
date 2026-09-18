"use client";

import React, { useState } from "react";
import {
  KeyRound,
  ShieldCheck,
  Shield,
  Lock,
  UserPlus,
  ArrowLeftRight,
  Trash2,
  Plus,
  Award,
  X,
  Check,
  Save,
  Users,
} from "lucide-react";
import { Employee, PositionLevel, ROLE_GROUPS } from "@/app/data/seed-employees";
import { PermissionGroup, SystemAdminSlot } from "@/app/utils/permissions";
import { useApp } from "@/app/context/AppContext";
import Modal from "@/app/components/ui/Modal";

interface RolesTabProps {
  employees: Employee[];
  systemAdmins: SystemAdminSlot[];
  onAssignAdmin: (employee: Employee) => void;
  onTransferAdmin: (fromCode: string, toEmployee: Employee) => void;
  onRevokeAdmin: (code: string) => void;
  positions: PositionLevel[];
  onAddPosition: (newPos: PositionLevel) => void;
  onDeletePosition: (id: string, name: string) => void;
  permissions: PermissionGroup[];
  onTogglePermission: (
    groupIndex: number,
    itemIndex: number,
    roleKey: "admin" | "leader" | "employee" | "hr"
  ) => void;
  onSavePermissions: () => void;
}

export default function RolesTab({
  employees,
  systemAdmins,
  onAssignAdmin,
  onTransferAdmin,
  onRevokeAdmin,
  positions,
  onAddPosition,
  onDeletePosition,
  permissions,
  onTogglePermission,
  onSavePermissions,
}: RolesTabProps) {
  const { currentUser } = useApp();

  // Modal states for System Admin
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [selectedSlotToTransfer, setSelectedSlotToTransfer] = useState<SystemAdminSlot | null>(null);
  const [targetEmployeeCode, setTargetEmployeeCode] = useState<string>("");

  // Position form state
  const [isAddingPos, setIsAddingPos] = useState(false);
  const [newPosName, setNewPosName] = useState("");
  const [newPosDesc, setNewPosDesc] = useState("");
  const [newPosRole, setNewPosRole] = useState<"ADMIN" | "LEADER" | "USER">("USER");

  // Helper lấy thông tin chính xác 100% từ tài khoản đang đăng nhập và database
  const getSlotData = (slot: SystemAdminSlot | undefined) => {
    if (!slot) return null;
    const isCurrentUserSlot = Boolean(
      currentUser && (
        (currentUser.code && slot.code && currentUser.code.toLowerCase() === slot.code.toLowerCase()) ||
        (currentUser.email && slot.email && currentUser.email.toLowerCase() === slot.email.toLowerCase()) ||
        (slot.isRoot && (currentUser.name === "Nguyễn Đức Kiên" || currentUser.code === "ĐH0050"))
      )
    );

    const emp = employees.find(
      (e) =>
        (e.code && slot.code && e.code.toLowerCase() === slot.code.toLowerCase()) ||
        (e.email && slot.email && e.email.toLowerCase() === slot.email.toLowerCase()) ||
        (slot.isRoot && (e.name === "Nguyễn Đức Kiên" || e.code === "ĐH0050"))
    );

    const source = isCurrentUserSlot ? { ...emp, ...currentUser } : (emp || slot);

    return {
      name: source?.name || slot.name,
      code: source?.code || slot.code,
      position: source?.position || slot.position || "Trưởng phòng công nghệ",
      department: source?.department || slot.department || "Ban Công nghệ Thông tin & Chuyển đổi số",
      email: source?.email || slot.email || "kiennd.forimex@gmail.com",
      avatar: source?.avatar || slot.avatar,
      isRoot: slot.isRoot,
      assignedAt: slot.assignedAt,
    };
  };

  const slot1 = getSlotData(systemAdmins[0]);
  const slot2 = getSlotData(systemAdmins[1]);

  const handleOpenAssign = () => {
    const available = employees.filter(
      (e) => !systemAdmins.some((s) => s.code === e.code || s.email?.toLowerCase() === e.email?.toLowerCase())
    );
    if (available.length > 0) {
      setTargetEmployeeCode(available[0].code || available[0].id);
    }
    setIsAssignModalOpen(true);
  };

  const handleConfirmAssign = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmployeeCode) return;
    const targetEmp = employees.find((e) => (e.code || e.id) === targetEmployeeCode);
    if (targetEmp) {
      onAssignAdmin(targetEmp);
      setIsAssignModalOpen(false);
    }
  };

  const handleOpenTransfer = (slot: SystemAdminSlot) => {
    setSelectedSlotToTransfer(slot);
    const available = employees.filter(
      (e) => !systemAdmins.some((s) => s.code === e.code || s.email?.toLowerCase() === e.email?.toLowerCase())
    );
    if (available.length > 0) {
      setTargetEmployeeCode(available[0].code || available[0].id);
    }
    setIsTransferModalOpen(true);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotToTransfer || !targetEmployeeCode) return;
    const targetEmp = employees.find((e) => (e.code || e.id) === targetEmployeeCode);
    if (targetEmp) {
      onTransferAdmin(selectedSlotToTransfer.code, targetEmp);
      setIsTransferModalOpen(false);
      setSelectedSlotToTransfer(null);
    }
  };

  const handleAddPositionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosName.trim()) return;
    const newPos: PositionLevel = {
      id: `pos-${Date.now()}`,
      name: newPosName.trim(),
      description: newPosDesc.trim() || "Chức danh phân công tác nghiệp",
      defaultRole: newPosRole,
    };
    onAddPosition(newPos);
    setNewPosName("");
    setNewPosDesc("");
    setIsAddingPos(false);
  };

  return (
    <div className="space-y-5">
      {/* KHỐI 0: QUẢN TRỊ VIÊN HỆ THỐNG (TỐI ĐA 2 ADMIN) */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <div className="flex items-center gap-2.5">
            <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-[#1b365d]" />
              <span>Quản Trị Viên Hệ Thống</span>
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-blue-50 text-[#1b365d] border border-blue-200">
              {systemAdmins.length}/2 Admin
            </span>
          </div>
        </div>

        {/* Danh sách 2 Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Admin 1: Nguyễn Đức Kiên (Root) */}
          <div className="p-4 rounded-xl border border-blue-200/80 bg-gradient-to-br from-blue-50/30 via-white to-white flex flex-col justify-between space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img
                  src={
                    slot1?.avatar ||
                    "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEcN6OBmR6zsdwTmD4duBznQO1ORmCq5Yc-MdPDoNOgA&s=10"
                  }
                  alt={slot1?.name || "Nguyễn Đức Kiên"}
                  className="w-11 h-11 rounded-full object-cover border-2 border-blue-300 shadow-2xs"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-semibold text-slate-900">
                      {slot1?.name || "Nguyễn Đức Kiên"}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-[#1b365d]">
                      {slot1?.code || "ĐH0050"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">
                    {slot1?.position || "Trưởng phòng công nghệ"} • {slot1?.department || "Ban Công nghệ Thông tin & Chuyển đổi số"}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {slot1?.email || "kiennd.forimex@gmail.com"}
                  </p>
                </div>
              </div>

              <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-[#1b365d] text-white shadow-2xs flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Admin 1 (Gốc)</span>
              </span>
            </div>

            <div className="pt-2.5 border-t border-blue-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <div className="flex items-center gap-1 text-[#1b365d] font-medium text-[11px]">
                <Lock className="w-3.5 h-3.5" />
                <span>Khởi tạo (Cố định)</span>
              </div>
              <button
                type="button"
                onClick={() => handleOpenTransfer(systemAdmins[0])}
                className="px-2.5 py-1 rounded-lg border border-blue-200 bg-white hover:bg-blue-50 text-[#1b365d] text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
              >
                <ArrowLeftRight className="w-3 h-3" />
                <span>Chuyển giao</span>
              </button>
            </div>
          </div>

          {/* Admin 2 */}
          {systemAdmins.length >= 2 && slot2 ? (
            <div className="p-4 rounded-xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/20 via-white to-white flex flex-col justify-between space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      slot2.avatar ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80"
                    }
                    alt={slot2.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-indigo-300 shadow-2xs"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-slate-900">
                        {slot2.name}
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-100 text-indigo-800">
                        {slot2.code}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 font-medium">
                      {slot2.position || "Cán bộ"} • {slot2.department || "Chuyên môn"}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {slot2.email}
                    </p>
                  </div>
                </div>

                <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-600 text-white shadow-2xs flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  <span>Admin 2 (Ủy quyền)</span>
                </span>
              </div>

              <div className="pt-2.5 border-t border-indigo-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                <div className="text-[11px] text-indigo-600">
                  Cấp ngày: {slot2.assignedAt || "Mới kích hoạt"}
                </div>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleOpenTransfer(systemAdmins[1])}
                    className="px-2.5 py-1 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 text-indigo-700 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <ArrowLeftRight className="w-3 h-3" />
                    <span>Chuyển giao</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onRevokeAdmin(systemAdmins[1].code)}
                    className="px-2 py-1 rounded-lg border border-rose-200 bg-white hover:bg-rose-50 text-rose-600 text-[11px] font-medium transition-all flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Thu hồi</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl border-2 border-dashed border-slate-200 hover:border-blue-300 bg-slate-50/40 transition-all flex flex-col items-center justify-center text-center space-y-2 min-h-[125px]">
              <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                <UserPlus className="w-4 h-4 text-[#1b365d]" />
              </div>
              <h3 className="text-xs font-semibold text-slate-700">Admin 2 còn trống</h3>
              <button
                type="button"
                onClick={handleOpenAssign}
                className="px-3 py-1.5 rounded-lg bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-medium transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Admin 2</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* KHỐI 1: DANH MỤC CẤP BẬC CHỨC DANH */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <Award className="w-4 h-4 text-[#1b365d]" />
            <span>Cơ Cấu Chức Danh</span>
          </h2>
          <button
            type="button"
            onClick={() => setIsAddingPos(!isAddingPos)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-medium shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm chức danh</span>
          </button>
        </div>

        {/* Form thêm chức danh */}
        {isAddingPos && (
          <form onSubmit={handleAddPositionSubmit} className="p-4 rounded-xl bg-white border border-slate-200 space-y-3 text-xs">
            <div className="font-semibold text-slate-800 flex items-center justify-between">
              <span>Thêm cấp bậc chức danh mới</span>
              <button type="button" onClick={() => setIsAddingPos(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-600 font-medium mb-1">Tên chức danh:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chuyên gia cao cấp..."
                  value={newPosName}
                  onChange={(e) => setNewPosName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#1b365d]"
                  required
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Mô tả thẩm quyền:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Chịu trách nhiệm kỹ thuật lõi..."
                  value={newPosDesc}
                  onChange={(e) => setNewPosDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#1b365d]"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1">Vai trò mặc định:</label>
                <select
                  value={newPosRole}
                  onChange={(e) => setNewPosRole(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-[#1b365d]"
                >
                  <option value="USER">Nhân Viên (USER)</option>
                  <option value="LEADER">Trưởng Ban (LEADER)</option>
                  <option value="ADMIN">Ban Quản Trị (ADMIN)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsAddingPos(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 font-medium cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-lg bg-[#1b365d] hover:bg-[#152a4a] text-white font-medium shadow-xs cursor-pointer"
              >
                Lưu chức danh
              </button>
            </div>
          </form>
        )}

        {/* Danh sách các chức danh */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {positions.map((pos) => (
            <div
              key={pos.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-colors flex flex-col justify-between space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-xs font-semibold text-slate-900">{pos.name}</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{pos.description}</p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium border shrink-0 ${pos.defaultRole === "ADMIN"
                      ? "bg-blue-50 text-[#1b365d] border-blue-200"
                      : pos.defaultRole === "LEADER"
                        ? "bg-sky-50 text-sky-700 border-sky-200"
                        : "bg-slate-100 text-slate-600 border-slate-200"
                    }`}
                >
                  {pos.defaultRole}
                </span>
              </div>
              {pos.id !== "board" && pos.id !== "leader" && pos.id !== "staff" && (
                <div className="pt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onDeletePosition(pos.id, pos.name)}
                    className="text-rose-500 hover:text-rose-700 transition-colors cursor-pointer text-[11px] flex items-center gap-1"
                    title="Xóa chức danh này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Xóa</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* KHỐI 2: MA TRẬN PHÂN QUYỀN */}
      <div className="bg-slate-50/50 rounded-2xl border border-slate-200/70 p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200/60 pb-3">
          <h2 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#1b365d]" />
            <span>Phân Quyền</span>
          </h2>

          <button
            type="button"
            onClick={onSavePermissions}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Lưu Phân Quyền</span>
          </button>
        </div>

        {/* Bảng ma trận */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-2.5 px-4 w-7/12">Chức năng / Phân hệ</th>
                <th className="py-2.5 px-3 text-center w-1/12 bg-blue-50/40 text-[#1b365d]">Admin</th>
                <th className="py-2.5 px-3 text-center w-1/12 bg-emerald-50/40 text-emerald-900">HCNS</th>
                <th className="py-2.5 px-3 text-center w-1/12 bg-sky-50/40 text-sky-900">Trưởng ban</th>
                <th className="py-2.5 px-3 text-center w-1/12">Nhân viên</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {permissions.map((group, grpIdx) => (
                <React.Fragment key={group.module || grpIdx}>
                  <tr className="bg-slate-50/50">
                    <td colSpan={5} className="py-2 px-4 font-semibold text-slate-700">
                      {group.module}
                    </td>
                  </tr>

                  {group.items.map((item, itemIdx) => (
                    <tr key={item.id || itemIdx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-2.5 px-4 pl-6 text-slate-700">
                        <div className="font-medium text-slate-800">{item.label}</div>
                      </td>

                      {/* Admin column */}
                      <td className="py-2 px-3 text-center bg-blue-50/10">
                        <input
                          type="checkbox"
                          checked={Boolean(item.admin)}
                          onChange={() => onTogglePermission(grpIdx, itemIdx, "admin")}
                          className="w-4 h-4 text-[#1b365d] rounded border-slate-300 focus:ring-[#1b365d] cursor-pointer"
                        />
                      </td>

                      {/* HCNS column */}
                      <td className="py-2 px-3 text-center bg-emerald-50/10">
                        <input
                          type="checkbox"
                          checked={Boolean(item.hr)}
                          onChange={() => onTogglePermission(grpIdx, itemIdx, "hr")}
                          className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500 cursor-pointer"
                        />
                      </td>

                      {/* Leader column */}
                      <td className="py-2 px-3 text-center bg-sky-50/10">
                        <input
                          type="checkbox"
                          checked={Boolean(item.leader)}
                          onChange={() => onTogglePermission(grpIdx, itemIdx, "leader")}
                          className="w-4 h-4 text-sky-600 rounded border-slate-300 focus:ring-sky-500 cursor-pointer"
                        />
                      </td>

                      {/* Employee column */}
                      <td className="py-2 px-3 text-center">
                        <input
                          type="checkbox"
                          checked={Boolean(item.employee)}
                          onChange={() => onTogglePermission(grpIdx, itemIdx, "employee")}
                          className="w-4 h-4 text-slate-600 rounded border-slate-300 focus:ring-slate-500 cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL CẤP QUYỀN HỆ THỐNG ADMIN 2 ================= */}
      {isAssignModalOpen && (
        <Modal
          isOpen={isAssignModalOpen}
          onClose={() => setIsAssignModalOpen(false)}
          size="md"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 px-5 border-b border-slate-100 bg-[#1b365d] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-blue-200" />
                <h3 className="text-sm font-semibold">Cấp Quyền Quản Trị Hệ Thống (Admin 2)</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAssignModalOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAssign} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Chọn nhân sự cấp quyền:</label>
                <select
                  value={targetEmployeeCode}
                  onChange={(e) => setTargetEmployeeCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#1b365d] bg-slate-50 cursor-pointer"
                >
                  {employees
                    .filter(
                      (e) => !systemAdmins.some((s) => s.code === e.code || s.email?.toLowerCase() === e.email?.toLowerCase())
                    )
                    .map((emp) => (
                      <option key={emp.id} value={emp.code || emp.id}>
                        {emp.name} ({emp.code || "NV"}) - {emp.position || "Cán bộ"} • {emp.department}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-medium shadow-xs transition-all cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* ================= MODAL CHUYỂN GIAO QUYỀN HỆ THỐNG ================= */}
      {isTransferModalOpen && selectedSlotToTransfer && (
        <Modal
          isOpen={Boolean(isTransferModalOpen && selectedSlotToTransfer)}
          onClose={() => {
            setIsTransferModalOpen(false);
            setSelectedSlotToTransfer(null);
          }}
          size="md"
          hideHeader
          className="p-0 overflow-hidden"
        >
          <div className="flex flex-col h-full overflow-hidden">
            <div className="p-4 px-5 border-b border-slate-100 bg-[#1b365d] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowLeftRight className="w-4 h-4 text-blue-200" />
                <h3 className="text-sm font-semibold">Chuyển Giao Quyền Quản Trị Hệ Thống</h3>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsTransferModalOpen(false);
                  setSelectedSlotToTransfer(null);
                }}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="p-5 space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-slate-700">Chọn người tiếp nhận từ {selectedSlotToTransfer.name}:</label>
                <select
                  value={targetEmployeeCode}
                  onChange={(e) => setTargetEmployeeCode(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-slate-800 font-medium focus:outline-none focus:border-[#1b365d] bg-slate-50 cursor-pointer"
                >
                  {employees
                    .filter(
                      (e) => !systemAdmins.some((s) => s.code === e.code || s.email?.toLowerCase() === e.email?.toLowerCase())
                    )
                    .map((emp) => (
                      <option key={emp.id} value={emp.code || emp.id}>
                        {emp.name} ({emp.code || "NV"}) - {emp.position || "Cán bộ"} • {emp.department}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsTransferModalOpen(false);
                    setSelectedSlotToTransfer(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium transition-all cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white font-medium shadow-xs transition-all cursor-pointer"
                >
                  Xác nhận
                </button>
              </div>
            </form>
          </div>
        </Modal>
      )}
    </div>
  );
}
