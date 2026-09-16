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
        id: "leave_management.view",
        label: "Quản lý quỹ phép nhân viên",
        note: "Quản trị ngày phép năm và hạn mức nghỉ",
        admin: true,
        leader: false,
        employee: false,
        hr: false,
      },
    ],
  },
  {
    module: "Chấm công & Ca làm việc",
    items: [
      {
        id: "attendance.view",
        label: "Xem bảng chấm công",
        note: "Admin & HCNS xem tất cả; Trưởng ban & Nhân viên xem của mình",
        admin: true,
        leader: false, // xem của mình
        employee: false, // xem của mình
        hr: true,
      },
      {
        id: "attendance.manage",
        label: "Các hiển thị và thao tác với bảng công",
        note: "Chốt công tháng, nhập file Excel, đồng bộ máy chấm công",
        admin: true,
        leader: false,
        employee: false,
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

const STORAGE_KEY = "dhi_permission_matrix_v1";

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
 * Lưu ma trận phân quyền mới
 */
export function saveStoredPermissionMatrix(matrix: PermissionGroup[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(matrix));
    window.dispatchEvent(new Event("permission-changed"));
  } catch (e) {
    console.error("Lỗi lưu ma trận phân quyền:", e);
  }
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
