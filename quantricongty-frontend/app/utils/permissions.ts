/**
 * HỆ THỐNG PHÂN QUYỀN MA TRẬN DOANH NGHIỆP (ROLE & MODULE PERMISSION MATRIX)
 * 
 * Hỗ trợ 4 nhóm vai trò nghiệp vụ thực tế:
 * 1. Admin: Quản trị viên tối cao / Ban Giám Đốc
 * 2. Trưởng ban: Lãnh đạo các Ban chuyên môn (CNTT, Kế toán, Kinh doanh...)
 * 3. Nhân viên: Cán bộ nhân viên thông thường
 * 4. Phòng HCNS: Nhân sự phụ trách quản trị nhân sự, chấm công toàn công ty
 */

export type MatrixRole = "admin" | "leader" | "employee" | "hr";

export interface PermissionItem {
  id: string; // VD: "dashboard.view", "employees.view"
  label: string; // Tên hiển thị
  note?: string; // Ghi chú giải thích
  admin: boolean | string; // true | false | "all" | "dept" | "own"
  leader: boolean | string;
  employee: boolean | string;
  hr: boolean | string;
}

export interface PermissionGroup {
  module: string; // Tên phân hệ / module
  items: PermissionItem[];
}

// Bảng ma trận phân quyền mặc định chuẩn hóa theo đúng cấu trúc nghiệp vụ
export const DEFAULT_PERMISSION_MATRIX: PermissionGroup[] = [
  {
    module: "Trang chủ & Tổng quan",
    items: [
      {
        id: "dashboard.view",
        label: "Hiện tab trang chủ và vào xem được trang chủ",
        note: "Xem báo cáo tổng quan tình hình công ty",
        admin: true,
        leader: true,
        employee: false,
        hr: true,
      },
    ],
  },
  {
    module: "Quản lý Nhân sự & Ban Phòng",
    items: [
      {
        id: "employees.view",
        label: "Hiện tab quản lý nhân viên và xem",
        note: "Admin & HCNS xem tất cả; Trưởng ban chỉ xem đúng ban mình",
        admin: true,
        leader: true, // phạm vi: ban mình
        employee: false,
        hr: true,
      },
      {
        id: "employees.manage",
        label: "Thao tác với nhân viên (Thêm, sửa, xóa, cấp tài khoản)",
        note: "Chỉ Admin và cán bộ HCNS được quyền thao tác (Trưởng phòng chỉ xem, không sửa)",
        admin: true,
        leader: false,
        employee: false,
        hr: true,
      },
      {
        id: "employees.change_role",
        label: "Phân quyền vai trò hệ thống của nhân viên (ADMIN, HCNS, LEADER, USER)",
        note: "Chỉ Quản trị viên (Admin) mới có quyền cấp và thay đổi vai trò hệ thống (HCNS không sửa được)",
        admin: true,
        leader: false,
        employee: false,
        hr: false,
      },
      {
        id: "employees.export",
        label: "Xuất dữ liệu & Tải mẫu Excel nhân sự",
        note: "Admin & HCNS xuất toàn công ty; Trưởng ban xuất ban mình",
        admin: true,
        leader: true,
        employee: false,
        hr: true,
      },
      {
        id: "departments.view",
        label: "Xem cơ cấu Ban / Phòng",
        note: "Xem sơ đồ và danh sách các ban chuyên môn",
        admin: true,
        leader: true,
        employee: false,
        hr: true,
      },
      {
        id: "departments.manage",
        label: "Thao tác với Ban / Phòng (Thêm, sửa, xóa cơ cấu phòng ban)",
        note: "Chỉ Quản trị viên (ADMIN) mới có quyền tạo mới, chỉnh sửa hoặc xóa ban/phòng",
        admin: true,
        leader: false,
        employee: false,
        hr: false,
      },
      {
        id: "leave_management.view",
        label: "Quản lý quỹ phép nhân viên (Xem toàn công ty)",
        note: "Quản trị ngày phép năm và hạn mức nghỉ",
        admin: true,
        leader: false,
        employee: false,
        hr: true,
      },
      {
        id: "leave_management.manage",
        label: "Thao tác quỹ phép (Cấp phát, sửa hạn mức, reset)",
        note: "Cập nhật ngày phép năm, chuyển phép tồn, thiết lập lại hạn mức",
        admin: true,
        leader: false,
        employee: false,
        hr: true,
      },
      {
        id: "leave_management.export",
        label: "Xuất báo cáo quỹ phép",
        note: "Kết xuất file Excel báo cáo phép năm",
        admin: true,
        leader: false,
        employee: false,
        hr: true,
      },
    ],
  },
  {
    module: "Chấm công & Ca làm việc",
    items: [
      {
        id: "attendance.view_all",
        label: "Xem bảng chấm công toàn bộ nhân viên",
        note: "Admin & HCNS xem tất cả phòng ban; Nhân viên thường xem của mình",
        admin: true,
        leader: false,
        employee: false,
        hr: true,
      },
      {
        id: "attendance.manage",
        label: "Quản trị chấm công (Chốt công, đồng bộ vân tay, import Excel)",
        note: "Thực hiện khóa kỳ công tháng, nạp dữ liệu từ máy chấm công",
        admin: true,
        leader: false,
        employee: false,
        hr: true,
      },
      {
        id: "attendance.export",
        label: "Xuất dữ liệu chấm công ra file Excel",
        note: "Kết xuất file tổng hợp hoặc chi tiết chấm công",
        admin: true,
        leader: false,
        employee: true,
        hr: true,
      },
    ],
  },
  {
    module: "Trung tâm Phê duyệt",
    items: [
      {
        id: "approvals.view",
        label: "Phê duyệt hồ sơ đề xuất (Nghỉ phép, công tác, tài liệu)",
        note: "Trưởng ban duyệt cấp 1 phòng mình, Admin duyệt toàn công ty",
        admin: true,
        leader: true,
        employee: false,
        hr: false,
      },
    ],
  },
];

const STORAGE_KEY = "dhi_permission_matrix_v2";

/**
 * Lấy ma trận phân quyền hiện tại (từ localStorage nếu có, merge với mặc định)
 */
export function getStoredPermissionMatrix(): PermissionGroup[] {
  if (typeof window === "undefined") return DEFAULT_PERMISSION_MATRIX;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_PERMISSION_MATRIX;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge thông minh để không bao giờ mất các quyền mới được định nghĩa
      return DEFAULT_PERMISSION_MATRIX.map((defGroup) => {
        const foundGrp = parsed.find((p: any) => p.module === defGroup.module);
        if (!foundGrp) return defGroup;
        const mergedItems = defGroup.items.map((defItem) => {
          const foundItem = foundGrp.items?.find((i: any) => i.id === defItem.id);
          return foundItem ? { ...defItem, ...foundItem } : defItem;
        });
        return { ...defGroup, items: mergedItems };
      });
    }
  } catch (e) {
    console.error("Lỗi đọc ma trận phân quyền từ localStorage:", e);
  }
  return DEFAULT_PERMISSION_MATRIX;
}

/**
 * Lưu ma trận phân quyền mới (Đồng bộ cả LocalStorage và Backend MongoDB)
 */
export function saveStoredPermissionMatrix(matrix: PermissionGroup[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
    window.dispatchEvent(new Event("permission-changed"));

    // Sync to backend MongoDB database
    fetch("http://localhost:5002/api/permissions/matrix", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ matrix }),
    }).catch(() => {
      // ignore
    });
  } catch (e) {
    console.error("Lỗi lưu ma trận phân quyền:", e);
  }
}

/**
 * Tải ma trận phân quyền từ Backend MongoDB và cập nhật cache LocalStorage
 */
export async function fetchBackendPermissions(): Promise<PermissionGroup[]> {
  try {
    const res = await fetch("http://localhost:5002/api/permissions/matrix");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("permission-changed"));
        return data;
      }
    }
  } catch {
    // fallback
  }
  return getStoredPermissionMatrix();
}

/**
 * Xác định các vai trò hệ thống áp dụng cho một user cụ thể
 * Tách biệt hoàn toàn Quyền hệ thống (System Role) khỏi Chức danh/Phòng ban (Job Title/Department)
 * 4 vai trò chuẩn:
 * 1. ADMIN: Quản trị viên tối cao
 * 2. HCNS: Quản trị Nhân sự (HR Admin)
 * 3. LEADER: Trưởng ban / Quản lý chuyên môn
 * 4. USER (employee): Cán bộ nhân viên
 */
export function getUserMatrixRoles(user: any): MatrixRole[] {
  if (!user) return ["employee"];

  const role = (user.role || "").toUpperCase();

  // 1. Quản trị viên tối cao / Ban Giám Đốc
  if (
    role === "ADMIN" ||
    role === "CHAIRMAN" ||
    role === "CEO" ||
    role === "SUPER_ADMIN"
  ) {
    return ["admin"];
  }

  // 2. Cán bộ Quản trị Nhân sự (HCNS)
  if (role === "HCNS" || role === "HR" || role === "HR_ADMIN") {
    return ["hr"];
  }

  // 3. Trưởng ban / Quản lý cấp trung (Leader)
  if (role === "LEADER" || role === "MANAGER" || role === "HEAD_OF_DEPARTMENT") {
    return ["leader"];
  }

  // 4. Cán bộ nhân viên thông thường
  return ["employee"];
}

/**
 * Kiểm tra xem người dùng có quyền với một tính năng (permissionId) hay không
 * Cơ chế phân quyền phân tầng (Hierarchical RBAC):
 * - Admin, HCNS và Trưởng ban mặc định kế thừa toàn bộ quyền của Nhân viên thường (USER)
 * - Đồng thời hưởng các quyền đặc thù được cấu hình trong Ma trận
 * @param user Đối tượng user hiện tại
 * @param permissionId ID quyền cần kiểm tra, ví dụ: "dashboard.view"
 */
export function canUserAccess(user: any, permissionId: string): boolean {
  if (!user) return false;

  const roles = getUserMatrixRoles(user);
  if (roles.includes("admin")) return true; // Admin luôn có toàn quyền

  const matrix = getStoredPermissionMatrix();

  // Tìm quyền trong bảng ma trận
  for (const group of matrix) {
    for (const item of group.items) {
      if (item.id === permissionId) {
        // 1. Kiểm tra quyền đặc thù theo vai trò của user
        for (const r of roles) {
          const val = item[r];
          if (val === true || (typeof val === "string" && val !== "none" && val !== "0")) {
            return true;
          }
        }

        // 2. Kế thừa: Mọi vai trò cấp trên (HCNS, Leader) đều tự động có quyền của Nhân viên thường (employee)
        if (
          item.employee === true ||
          (typeof item.employee === "string" && item.employee !== "none" && item.employee !== "0")
        ) {
          return true;
        }

        return false;
      }
    }
  }

  // Mặc định cho phép nếu chưa được định nghĩa trong ma trận
  return true;
}

// =========================================================================
// QUYỀN HỆ THỐNG (SYSTEM ADMIN - QUẢN TRỊ VIÊN KỸ THUẬT TỐI CAO)
// Quy tắc nghiệp vụ:
// 1. Bình thường tất cả tài khoản chỉ là USER ở tầng hệ thống.
// 2. Toàn hệ thống có TỐI ĐA 2 TÀI KHOẢN sở hữu Quyền hệ thống cùng lúc.
// 3. Nguyễn Đức Kiên (ĐH0050) là Người khởi tạo hệ thống -> Tự động luôn có 1 suất cố định.
// 4. Suất thứ 2 có thể gán thêm hoặc chuyển đổi, nhưng KHÔNG BAO GIỜ ĐƯỢC XÓA SẠCH (luôn >= 1).
// 5. Chỉ tài khoản sở hữu Quyền hệ thống mới được thấy và truy cập trang /settings.
// =========================================================================

export interface SystemAdminSlot {
  code: string;
  name: string;
  email?: string;
  avatar?: string;
  department?: string;
  position?: string;
  isRoot?: boolean; // true đối với Nguyễn Đức Kiên (Root Admin khởi tạo)
  assignedAt?: string;
}

export const ROOT_SYSTEM_ADMIN: SystemAdminSlot = {
  code: "ĐH0050",
  name: "Nguyễn Đức Kiên",
  email: "kiennd.forimex@gmail.com",
  avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEcN6OBmR6zsdwTmD4duBznQO1ORmCq5Yc-MdPDoNOgA&s=10",
  department: "Ban Công nghệ Thông tin & Chuyển đổi số",
  position: "Trưởng phòng công nghệ",
  isRoot: true,
  assignedAt: "01/01/2021",
};

const SYSTEM_ADMINS_STORAGE_KEY = "dhi_system_admins_v1";

/**
 * Lấy danh sách tài khoản giữ Quyền hệ thống (Tối đa 2 tài khoản)
 */
export function getStoredSystemAdmins(): SystemAdminSlot[] {
  if (typeof window === "undefined") return [ROOT_SYSTEM_ADMIN];
  try {
    const raw = localStorage.getItem(SYSTEM_ADMINS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(SYSTEM_ADMINS_STORAGE_KEY, JSON.stringify([ROOT_SYSTEM_ADMIN]));
      return [ROOT_SYSTEM_ADMIN];
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Đảm bảo Nguyễn Đức Kiên luôn có mặt trong danh sách (ít nhất 1 suất gốc) và luôn đồng bộ thông tin chuẩn
      const rootIdx = parsed.findIndex(
        (a: any) =>
          a.code === ROOT_SYSTEM_ADMIN.code ||
          a.email?.toLowerCase() === ROOT_SYSTEM_ADMIN.email?.toLowerCase() ||
          a.isRoot === true
      );
      if (rootIdx === -1) {
        parsed.unshift(ROOT_SYSTEM_ADMIN);
      } else {
        parsed[rootIdx] = { ...ROOT_SYSTEM_ADMIN, ...parsed[rootIdx], position: ROOT_SYSTEM_ADMIN.position, department: ROOT_SYSTEM_ADMIN.department, email: ROOT_SYSTEM_ADMIN.email, name: ROOT_SYSTEM_ADMIN.name };
      }
      return parsed.slice(0, 2);
    }
  } catch (e) {
    console.error("Lỗi đọc danh sách Quản trị viên hệ thống:", e);
  }
  return [ROOT_SYSTEM_ADMIN];
}

/**
 * Lưu danh sách Quản trị viên hệ thống (Tối đa 2 tài khoản, không được rỗng)
 */
export function saveStoredSystemAdmins(slots: SystemAdminSlot[]): void {
  if (typeof window === "undefined") return;
  try {
    if (!slots || slots.length === 0) {
      slots = [ROOT_SYSTEM_ADMIN];
    }
    const sanitized = slots.slice(0, 2);
    localStorage.setItem(SYSTEM_ADMINS_STORAGE_KEY, JSON.stringify(sanitized));
    window.dispatchEvent(new Event("system-admins-changed"));

    // Sync to backend MongoDB database
    fetch("http://localhost:5002/api/permissions/system-admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ systemAdmins: sanitized }),
    }).catch(() => {
      // ignore
    });
  } catch (e) {
    console.error("Lỗi lưu danh sách Quản trị viên hệ thống:", e);
  }
}

/**
 * Tải danh sách Quản trị viên hệ thống từ Backend MongoDB
 */
export async function fetchBackendSystemAdmins(): Promise<SystemAdminSlot[]> {
  try {
    const res = await fetch("http://localhost:5002/api/permissions/system-admins");
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(SYSTEM_ADMINS_STORAGE_KEY, JSON.stringify(data));
        window.dispatchEvent(new Event("system-admins-changed"));
        return data;
      }
    }
  } catch {
    // fallback
  }
  return getStoredSystemAdmins();
}

/**
 * Kiểm tra xem một user cụ thể có sở hữu Quyền hệ thống (System Admin) hay không
 */
export function checkIsSystemAdmin(user: any): boolean {
  if (!user) return false;
  const userCode = user.code || "";
  const userEmail = (user.email || "").toLowerCase();
  const userName = user.name || "";

  // 1. Nguyễn Đức Kiên luôn auto có quyền hệ thống (Root Admin bảo hộ)
  if (
    userCode === ROOT_SYSTEM_ADMIN.code ||
    userEmail === ROOT_SYSTEM_ADMIN.email?.toLowerCase() ||
    userEmail === "kien8438@gmail.com" ||
    userName === "Nguyễn Đức Kiên"
  ) {
    return true;
  }

  // 2. Kiểm tra trong danh sách slots đã lưu
  const slots = getStoredSystemAdmins();
  return slots.some(
    (slot) =>
      (slot.code && slot.code === userCode) ||
      (slot.email && slot.email.toLowerCase() === userEmail) ||
      (slot.name && slot.name === userName)
  );
}

/**
 * Gán thêm 1 tài khoản vào suất Quản trị viên hệ thống (Chỉ gán được khi chưa đủ 2)
 */
export function assignSystemAdmin(employee: any): { success: boolean; message: string } {
  const current = getStoredSystemAdmins();
  if (current.length >= 2) {
    return {
      success: false,
      message: "Hệ thống đã đạt giới hạn tối đa 2 Quản trị viên hệ thống. Vui lòng chuyển đổi suất nếu muốn thay thế.",
    };
  }
  const isAlready = current.some(
    (s) =>
      (s.code && s.code === employee.code) ||
      (s.email && s.email.toLowerCase() === (employee.email || "").toLowerCase()) ||
      (s.name && s.name === employee.name)
  );
  if (isAlready) {
    return { success: false, message: "Nhân sự này đã sở hữu Quyền hệ thống rồi." };
  }

  const newSlot: SystemAdminSlot = {
    code: employee.code || employee.id,
    name: employee.name,
    email: employee.email,
    avatar: employee.avatar,
    department: employee.department,
    position: employee.position || employee.jobTitle || "Cán bộ nhân viên",
    isRoot: false,
    assignedAt: new Date().toLocaleDateString("vi-VN"),
  };

  saveStoredSystemAdmins([...current, newSlot]);
  return { success: true, message: `Đã cấp Quyền hệ thống thành công cho ${employee.name}!` };
}

/**
 * Chuyển đổi suất Quản trị viên hệ thống từ người cũ sang người mới
 */
export function transferSystemAdmin(fromCode: string, toEmployee: any): { success: boolean; message: string } {
  const current = getStoredSystemAdmins();
  const index = current.findIndex((s) => s.code === fromCode);
  if (index === -1) {
    return { success: false, message: "Không tìm thấy tài khoản quản trị viên cần chuyển đổi." };
  }

  const isAlready = current.some(
    (s) =>
      (s.code && s.code === toEmployee.code) ||
      (s.email && s.email.toLowerCase() === (toEmployee.email || "").toLowerCase()) ||
      (s.name && s.name === toEmployee.name)
  );
  if (isAlready) {
    return { success: false, message: "Người được chuyển giao đã sở hữu Quyền hệ thống rồi." };
  }

  const oldSlot = current[index];
  const newSlot: SystemAdminSlot = {
    code: toEmployee.code || toEmployee.id,
    name: toEmployee.name,
    email: toEmployee.email,
    avatar: toEmployee.avatar,
    department: toEmployee.department,
    position: toEmployee.position || toEmployee.jobTitle || "Cán bộ nhân viên",
    isRoot: oldSlot.isRoot, // giữ nguyên tính chất nếu Kiên ủy quyền
    assignedAt: new Date().toLocaleDateString("vi-VN"),
  };

  current[index] = newSlot;
  saveStoredSystemAdmins([...current]);
  return { success: true, message: `Đã chuyển giao Quyền hệ thống từ ${oldSlot.name} sang ${toEmployee.name} thành công!` };
}

/**
 * Thu hồi suất Quản trị viên hệ thống (Chỉ thu hồi khi đang có đủ 2 người, không bao giờ để rỗng)
 */
export function revokeSystemAdmin(code: string): { success: boolean; message: string } {
  const current = getStoredSystemAdmins();
  if (current.length <= 1) {
    return {
      success: false,
      message: "Không thể thu hồi! Hệ thống bắt buộc phải có ít nhất 1 Quản trị viên hệ thống.",
    };
  }

  const target = current.find((s) => s.code === code);
  if (!target) {
    return { success: false, message: "Không tìm thấy tài khoản để thu hồi." };
  }

  if (target.isRoot) {
    return {
      success: false,
      message: "Không thể thu hồi tài khoản của Người khởi tạo hệ thống. Bạn chỉ có thể chuyển đổi suất này.",
    };
  }

  const updated = current.filter((s) => s.code !== code);
  saveStoredSystemAdmins(updated);
  return { success: true, message: `Đã thu hồi Quyền hệ thống của ${target.name}.` };
}

