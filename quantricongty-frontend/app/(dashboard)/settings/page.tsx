"use client";

import React, { useState } from "react";
import {
  Settings,
  Server,
  Clock,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  RefreshCw,
  Cpu,
  Wifi,
  KeyRound,
  FileSpreadsheet,
  Trash2,
  Users,
  Plus,
  Lock,
  UserCheck,
  Award,
  ArrowRight,
  Shield,
  Check,
  X,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import { POSITION_LEVELS, ROLE_GROUPS } from "@/app/data/seed-employees";

export default function SettingsPage() {
  const { company, employees, showToast, loadData } = useApp();

  const [activeTab, setActiveTab] = useState<"roles" | "shifts" | "device" | "company" | "security">("roles");

  // ==================== CƠ CẤU CHỨC DANH ====================
  const [positions, setPositions] = useState(POSITION_LEVELS);
  const [isAddingPos, setIsAddingPos] = useState(false);
  const [newPosName, setNewPosName] = useState("");
  const [newPosDesc, setNewPosDesc] = useState("");
  const [newPosRole, setNewPosRole] = useState<"ADMIN" | "LEADER" | "USER">("USER");

  const handleAddPosition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPosName.trim()) return;
    const newPos = {
      id: `pos-${Date.now()}`,
      name: newPosName.trim(),
      description: newPosDesc.trim() || "Chức danh phân công tác nghiệp",
      defaultRole: newPosRole,
    };
    setPositions([...positions, newPos]);
    setNewPosName("");
    setNewPosDesc("");
    setIsAddingPos(false);
    showToast(`Đã thêm chức danh "${newPos.name}" vào danh mục cài đặt!`);
  };

  const handleDeletePosition = (id: string, name: string) => {
    if (confirm(`Bạn có chắc muốn xóa chức danh "${name}" khỏi danh mục?`)) {
      setPositions(positions.filter((p) => p.id !== id));
      showToast(`Đã xóa chức danh "${name}".`);
    }
  };

  // ==================== MA TRẬN PHÂN QUYỀN ====================
  const [permissions, setPermissions] = useState([
    {
      group: "Quản Trị Nhân Sự & Tổ Chức",
      items: [
        { id: "view_employees", label: "Xem danh sách nhân sự", admin: true, leader: true, user: true, note: "User chỉ xem danh bạ nội bộ" },
        { id: "edit_employees", label: "Thêm, chỉnh sửa và xóa hồ sơ nhân sự", admin: true, leader: false, user: false, note: "Chỉ Quản trị viên cấp quyền" },
        { id: "import_export", label: "Nhập & Xuất danh sách nhân viên từ Excel", admin: true, leader: true, user: false, note: "Leader được xuất ban mình" },
      ],
    },
    {
      group: "Chấm Công & Ca Làm Việc",
      items: [
        { id: "view_all_att", label: "Xem bảng chấm công toàn bộ công ty", admin: true, leader: false, user: false, note: "Bao gồm công mọi phòng ban" },
        { id: "view_dept_att", label: "Xem bảng chấm công của nhân sự trong Ban", admin: true, leader: true, user: false, note: "Chỉ xem nhân sự cùng ban" },
        { id: "view_own_att", label: "Tự tra cứu lịch chấm công cá nhân của mình", admin: true, leader: true, user: true, note: "Xem giờ vào/ra, số công tháng" },
        { id: "sync_device", label: "Cấu hình kết nối & Đồng bộ máy chấm công", admin: true, leader: false, user: false, note: "Thao tác kết nối TCP Socket" },
      ],
    },
    {
      group: "Phê Duyệt Đề Xuất (Nghỉ phép, Công tác, Tài liệu)",
      items: [
        { id: "approve_dept", label: "Phê duyệt đơn cấp Ban (nhân viên trong ban)", admin: true, leader: true, user: false, note: "Leader duyệt trực tiếp" },
        { id: "approve_all", label: "Phê duyệt cấp Toàn công ty / Quyết định cuối", admin: true, leader: false, user: false, note: "Chỉ Ban Quản Trị & Admin" },
        { id: "create_request", label: "Tạo đơn xin nghỉ phép, công tác, trình tài liệu", admin: true, leader: true, user: true, note: "Tất cả cán bộ được tạo" },
      ],
    },
    {
      group: "Cài Đặt & Cấu Hình Hệ Thống",
      items: [
        { id: "manage_shifts", label: "Cài đặt quy định ca làm việc & giờ tính công", admin: true, leader: false, user: false, note: "Áp dụng toàn doanh nghiệp" },
        { id: "manage_roles", label: "Thiết lập phân quyền tài khoản & danh mục chức danh", admin: true, leader: false, user: false, note: "Quyền quản trị tối cao" },
      ],
    },
  ]);

  const togglePermission = (groupIndex: number, itemIndex: number, roleKey: "admin" | "leader" | "user") => {
    const updated = [...permissions];
    updated[groupIndex].items[itemIndex][roleKey] = !updated[groupIndex].items[itemIndex][roleKey];
    setPermissions(updated);
  };

  const handleSavePermissions = () => {
    showToast("Đã lưu ma trận phân quyền hệ thống thành công!");
  };

  // ==================== DEVICE SETTINGS ====================
  const [deviceIp, setDeviceIp] = useState("192.168.1.201");
  const [devicePort, setDevicePort] = useState(4370);
  const [deviceCommKey, setDeviceCommKey] = useState(123456);
  const [pingStatus, setPingStatus] = useState<"idle" | "testing" | "success" | "error">("idle");
  const [pingMessage, setPingMessage] = useState("");
  const [isSyncing, setIsSyncing] = useState(false);

  // ==================== SHIFTS SETTINGS ====================
  const [shiftStart, setShiftStart] = useState("08:00");
  const [shiftEnd, setShiftEnd] = useState("17:30");
  const [lunchStart, setLunchStart] = useState("12:00");
  const [lunchEnd, setLunchEnd] = useState("13:30");
  const [graceMinutes, setGraceMinutes] = useState(15);
  const [minHoursFullDay, setMinHoursFullDay] = useState(8);

  // ==================== COMPANY SETTINGS ====================
  const [companyName, setCompanyName] = useState(company?.name || "Công ty Cổ phần Đầu tư Đông Hải");
  const [shortName, setShortName] = useState(company?.shortName || "Đông Hải Invest");
  const [taxId, setTaxId] = useState(company?.taxId || "0108998877");
  const [address, setAddress] = useState(company?.address || "Tòa nhà Đông Hải, Số 18 Phố Nguyễn Du, Hà Nội");
  const [phone, setPhone] = useState(company?.phone || "024 3974 8888");
  const [email, setEmail] = useState(company?.email || "contact@donghaiinvest.vn");

  // Test connection to Attendance Machine
  const handleTestConnection = async () => {
    setPingStatus("testing");
    setPingMessage("Đang mở kết nối TCP Socket 4370 tới thiết bị...");
    try {
      const res = await fetch("http://localhost:5002/api/attendance/device/test-connection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: deviceIp, port: Number(devicePort), commKey: Number(deviceCommKey) }),
      });
      const data = await res.json();
      if (data.success) {
        setPingStatus("success");
        setPingMessage(data.message || "Kết nối thành công tới máy chấm công LAN!");
      } else {
        setPingStatus("error");
        setPingMessage(data.message || "Không thể kết nối (Timeout).");
      }
    } catch (err: any) {
      setPingStatus("error");
      setPingMessage("Không thể gửi yêu cầu tới Backend: " + err.message);
    }
  };

  // Sync attendance logs
  const handleSyncDevice = async () => {
    setIsSyncing(true);
    setPingStatus("idle");
    setPingMessage("");
    try {
      const res = await fetch("http://localhost:5002/api/attendance/device/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ip: deviceIp, port: Number(devicePort), commKey: Number(deviceCommKey) }),
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message);
      } else {
        alert(data.message);
      }
    } catch (err: any) {
      alert("Lỗi khi đồng bộ: " + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveShifts = () => {
    showToast("Đã lưu quy định ca làm việc & tiêu chuẩn tính công!");
  };

  const handleSaveCompany = async () => {
    try {
      const res = await fetch("http://localhost:5002/api/company", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName,
          shortName,
          taxId,
          address,
          phone,
          email,
        }),
      });
      if (res.ok) {
        showToast("Đã cập nhật thông tin doanh nghiệp!");
        loadData();
      }
    } catch {
      showToast("Lỗi khi cập nhật công ty!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800 tracking-tight flex items-center gap-2.5">
            <Settings className="w-5 h-5 text-[#1b365d]" />
            Cài Đặt Hệ Thống & Quản Trị
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Quản lý cơ cấu chức danh, ma trận phân quyền, quy định ca làm việc và máy chấm công
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab("roles")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "roles"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Chức Danh & Phân Quyền</span>
        </button>

        <button
          onClick={() => setActiveTab("shifts")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "shifts"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Quy Định Ca Làm Việc</span>
        </button>

        <button
          onClick={() => setActiveTab("device")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "device"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Máy Chấm Công & Thiết Bị</span>
        </button>

        <button
          onClick={() => setActiveTab("company")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "company"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Thông Tin Doanh Nghiệp</span>
        </button>

        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 whitespace-nowrap transition-all ${
            activeTab === "security"
              ? "border-[#1b365d] text-[#1b365d] bg-blue-50/40"
              : "border-transparent text-slate-500 hover:text-slate-700"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Bảo Mật & Xác Thực</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* TAB MỚI: CƠ CẤU CHỨC DANH & MA TRẬN PHÂN QUYỀN */}
      {/* ========================================================= */}
      {activeTab === "roles" && (
        <div className="space-y-8">
          {/* KHỐI 1: DANH MỤC CẤP BẬC CHỨC DANH */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#1b365d]" />
                  Danh Mục Cấp Bậc Chức Danh
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Các chức danh chuẩn được dùng khi thêm hoặc phân công nhân sự. Bạn có thể tự do bổ sung thêm chức danh mới khi cần.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingPos(!isAddingPos)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm chức danh</span>
              </button>
            </div>

            {/* Form thêm chức danh mới nếu bật */}
            {isAddingPos && (
              <form onSubmit={handleAddPosition} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <div className="font-bold text-slate-800 flex items-center justify-between">
                  <span>Thêm cấp bậc chức danh mới vào hệ thống</span>
                  <button type="button" onClick={() => setIsAddingPos(false)} className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Tên chức danh (*)</label>
                    <input
                      type="text"
                      required
                      placeholder="VD: Phó Ban, Trợ Lý HĐQT..."
                      value={newPosName}
                      onChange={(e) => setNewPosName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Mô tả nhiệm vụ</label>
                    <input
                      type="text"
                      placeholder="VD: Hỗ trợ điều hành phòng ban..."
                      value={newPosDesc}
                      onChange={(e) => setNewPosDesc(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Nhóm quyền gợi ý</label>
                    <select
                      value={newPosRole}
                      onChange={(e) => setNewPosRole(e.target.value as any)}
                      className="w-full px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-900 focus:outline-none focus:ring-1 focus:ring-[#1b365d]"
                    >
                      <option value="USER">Nhân viên (User)</option>
                      <option value="LEADER">Trưởng ban (Leader)</option>
                      <option value="ADMIN">Quản trị viên (Admin)</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsAddingPos(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#1b365d] text-white font-semibold hover:bg-[#152a4a]"
                  >
                    Lưu chức danh
                  </button>
                </div>
              </form>
            )}

            {/* Grid các thẻ chức danh */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {positions.map((pos) => (
                <div key={pos.id} className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/50 hover:bg-white hover:border-[#1b365d]/40 transition-all flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                        {pos.name === "Ban Quản Trị" && "👑"}
                        {pos.name === "Trưởng Ban" && "👔"}
                        {pos.name === "Nhân Viên" && "💼"}
                        {pos.name}
                      </h3>
                      {pos.id !== "board" && pos.id !== "leader" && pos.id !== "staff" && (
                        <button
                          onClick={() => handleDeletePosition(pos.id, pos.name)}
                          className="text-slate-400 hover:text-rose-600 p-1 transition-colors"
                          title="Xóa chức danh này"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{pos.description}</p>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Quyền gợi ý:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-md ${
                        pos.defaultRole === "ADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : pos.defaultRole === "LEADER"
                          ? "bg-blue-50 text-[#1b365d] border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {pos.defaultRole}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* KHỐI 2: MA TRẬN PHÂN QUYỀN HỆ THỐNG */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Ma Trận Phân Quyền Chi Tiết (Role & Permission Matrix)
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Thiết lập các quyền con (xem, sửa, phê duyệt) cho 3 nhóm tài khoản: Admin, Leader và User
                </p>
              </div>
              <button
                type="button"
                onClick={handleSavePermissions}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-xs transition-all self-start sm:self-auto"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Lưu cấu hình quyền</span>
              </button>
            </div>

            {/* Bảng ma trận */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-700 font-bold border-b border-slate-200">
                    <th className="py-3 px-4">Quyền hạn hệ thống & Chức năng</th>
                    <th className="py-3 px-4 text-center w-28">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 border border-purple-200 font-bold">
                        Admin
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center w-28">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-blue-50 text-[#1b365d] border border-blue-200 font-bold">
                        Leader
                      </span>
                    </th>
                    <th className="py-3 px-4 text-center w-28">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-slate-200/80 text-slate-700 border border-slate-300 font-bold">
                        User
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {permissions.map((grp, gIdx) => (
                    <React.Fragment key={gIdx}>
                      {/* Tiêu đề nhóm */}
                      <tr className="bg-slate-50/70">
                        <td colSpan={4} className="py-2.5 px-4 font-bold text-slate-800 bg-slate-50">
                          {grp.group}
                        </td>
                      </tr>
                      {grp.items.map((item, iIdx) => (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="font-semibold text-slate-800">{item.label}</div>
                            <div className="text-[11px] text-slate-400">{item.note}</div>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={item.admin}
                              onChange={() => togglePermission(gIdx, iIdx, "admin")}
                              className="w-4 h-4 text-[#1b365d] rounded-md focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={item.leader}
                              onChange={() => togglePermission(gIdx, iIdx, "leader")}
                              className="w-4 h-4 text-[#1b365d] rounded-md focus:ring-0 cursor-pointer"
                            />
                          </td>
                          <td className="py-3 px-4 text-center">
                            <input
                              type="checkbox"
                              checked={item.user}
                              onChange={() => togglePermission(gIdx, iIdx, "user")}
                              className="w-4 h-4 text-[#1b365d] rounded-md focus:ring-0 cursor-pointer"
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

          {/* KHỐI 3: DANH SÁCH TÀI KHOẢN THỰC TẾ HIỆN TẠI */}
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  Danh Sách Tài Khoản & Phân Quyền Đang Hoạt Động
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Các tài khoản được cấu hình chuẩn trong hệ thống theo chỉ đạo quản trị
                </p>
              </div>
              <a
                href="/employees"
                className="text-xs font-semibold text-[#1b365d] hover:underline flex items-center gap-1"
              >
                <span>Quản lý tại trang Nhân sự</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {employees.map((emp) => (
                <div
                  key={(emp as any)._id || emp.id}
                  className="p-4 rounded-2xl border border-slate-200/90 bg-white hover:border-[#1b365d]/40 shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={emp.avatar || "/avatar-kien.png"}
                      alt={emp.name}
                      className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100"
                    />
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">{emp.name}</h4>
                      <p className="text-xs text-slate-500 font-medium">{emp.position || "Cán bộ"}</p>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Ban / Khối:</span>
                    <span className="font-semibold text-slate-700 truncate max-w-[140px]">{emp.department}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Quyền hệ thống:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        (emp as any).role === "ADMIN"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : (emp as any).role === "LEADER"
                          ? "bg-blue-50 text-[#1b365d] border border-blue-200"
                          : "bg-slate-100 text-slate-700 border border-slate-200"
                      }`}
                    >
                      {(emp as any).role === "ADMIN" ? "Admin (Quản trị)" : (emp as any).role === "LEADER" ? "Leader (Trưởng ban)" : "User (Nhân viên)"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: MÁY CHẤM CÔNG & THIẾT BỊ */}
      {/* ========================================================= */}
      {activeTab === "device" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#1b365d]" />
                Cấu Hình Kết Nối Máy Chấm Công (ZKTeco / Ronand Jack TCP/IP)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Thiết lập địa chỉ IP mạng nội bộ và mật mã kết nối để hệ thống tự động đồng bộ dữ liệu quẹt thẻ
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Giao thức TCP Port 4370
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <Wifi className="w-3.5 h-3.5 text-slate-400" />
                Địa chỉ IP Máy Chấm Công
              </label>
              <input
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                placeholder="192.168.1.201"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Cổng kết nối TCP Port
              </label>
              <input
                type="number"
                value={devicePort}
                onChange={(e) => setDevicePort(Number(e.target.value))}
                placeholder="4370"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                Mật mã máy (CommKey)
              </label>
              <input
                type="number"
                value={deviceCommKey}
                onChange={(e) => setDeviceCommKey(Number(e.target.value))}
                placeholder="123456"
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800 font-bold"
              />
            </div>
          </div>

          {/* Feedback message */}
          {pingStatus !== "idle" && (
            <div
              className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 ${
                pingStatus === "testing"
                  ? "bg-blue-50/70 border-blue-200 text-blue-800"
                  : pingStatus === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                  : "bg-rose-50 border-rose-200 text-rose-800"
              }`}
            >
              {pingStatus === "testing" && <RefreshCw className="w-4 h-4 animate-spin shrink-0 text-blue-600 mt-0.5" />}
              {pingStatus === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />}
              {pingStatus === "error" && <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />}
              <div className="flex-1 font-medium">{pingMessage}</div>
            </div>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={pingStatus === "testing"}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition-all disabled:opacity-50"
            >
              <Wifi className="w-3.5 h-3.5 text-slate-500" />
              <span>Kiểm tra kết nối (Test Ping)</span>
            </button>

            <button
              type="button"
              onClick={handleSyncDevice}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-md shadow-[#1b365d]/20 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span>{isSyncing ? "Đang đồng bộ..." : "Đồng bộ dữ liệu quẹt thẻ ngay"}</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: QUY ĐỊNH CA LÀM VIỆC */}
      {/* ========================================================= */}
      {activeTab === "shifts" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#1b365d]" />
              Quy Định Ca Làm Việc & Tiêu Chuẩn Tính Công
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Thiết lập khung giờ làm việc hành chính, thời gian cho phép đi muộn và thời lượng tính 1 công chuẩn
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bắt đầu ca sáng (Check-in)
              </label>
              <input
                type="time"
                value={shiftStart}
                onChange={(e) => setShiftStart(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kết thúc ca chiều (Check-out)
              </label>
              <input
                type="time"
                value={shiftEnd}
                onChange={(e) => setShiftEnd(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Bắt đầu nghỉ trưa
              </label>
              <input
                type="time"
                value={lunchStart}
                onChange={(e) => setLunchStart(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Kết thúc nghỉ trưa
              </label>
              <input
                type="time"
                value={lunchEnd}
                onChange={(e) => setLunchEnd(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Thời gian cho phép đi muộn không phạt (Phút)
              </label>
              <input
                type="number"
                value={graceMinutes}
                onChange={(e) => setGraceMinutes(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Ví dụ: vào ca lúc 08:00, cho phép dập vân tay tới 08:15 không tính đi muộn.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số giờ làm việc để tính 1.0 công (Tiếng)
              </label>
              <input
                type="number"
                value={minHoursFullDay}
                onChange={(e) => setMinHoursFullDay(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Làm đủ 8 tiếng = 1.0 công; từ 4 đến dưới 8 tiếng = 0.5 công.
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveShifts}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-md shadow-[#1b365d]/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Lưu quy định ca làm việc</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 4: THÔNG TIN DOANH NGHIỆP */}
      {/* ========================================================= */}
      {activeTab === "company" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-4 h-4 text-[#1b365d]" />
              Hồ Sơ & Thông Tin Doanh Nghiệp
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cập nhật tên giao dịch, mã số thuế, địa chỉ trụ sở và thông tin pháp nhân
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên công ty đầy đủ
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Tên viết tắt / Thương hiệu
              </label>
              <input
                type="text"
                value={shortName}
                onChange={(e) => setShortName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800 font-bold text-[#1b365d]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mã số thuế doanh nghiệp
              </label>
              <input
                type="text"
                value={taxId}
                onChange={(e) => setTaxId(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] font-mono text-slate-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Số điện thoại liên hệ
              </label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Địa chỉ trụ sở chính
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1b365d] text-slate-800"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSaveCompany}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#1b365d] hover:bg-[#152a4a] text-white text-xs font-semibold shadow-md shadow-[#1b365d]/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Cập nhật thông tin công ty</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 5: BẢO MẬT & XÁC THỰC */}
      {/* ========================================================= */}
      {activeTab === "security" && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs p-6 space-y-5">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Chính Sách Bảo Mật & Xác Thực Tài Khoản
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Cấu hình chính sách bảo vệ dữ liệu và phương thức đăng nhập an toàn
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-800">Xác thực mã OTP gửi qua Email</p>
                <p className="text-[11px] text-slate-400">Đăng nhập không cần nhớ mật khẩu thông qua mã OTP 6 số</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Đang bật
              </span>
            </div>

            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <p className="text-xs font-bold text-slate-800">Mã hóa kết nối ZKTeco CommKey</p>
                <p className="text-[11px] text-slate-400">Bảo mật giao thức socket máy chấm công với mã băm 123456</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                Chuẩn ZK TCP
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
