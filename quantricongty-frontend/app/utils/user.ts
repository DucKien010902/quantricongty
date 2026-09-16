import { SEED_EMPLOYEES } from "../data/seed-employees";

/**
 * Lấy tên hiển thị thật của người dùng, không hiển thị địa chỉ email
 */
export function getUserDisplayName(user: any): string {
  if (!user) return "Nguyễn Đức Kiên";

  const email = (user.email || "").trim().toLowerCase();
  const rawName = (user.name || "").trim();

  // 1. Nếu rawName đã là họ tên thật (có khoảng trắng và không chứa @)
  if (rawName && !rawName.includes("@") && rawName.includes(" ")) {
    return rawName;
  }

  // 2. Tra cứu trực tiếp trong danh sách nhân viên theo email
  if (email) {
    const matchedEmp = SEED_EMPLOYEES.find(
      (emp) => emp.email.toLowerCase() === email
    );
    if (matchedEmp?.name) {
      return matchedEmp.name;
    }
  }

  // 3. Nếu là tài khoản Kiên hoặc Admin mặc định
  if (
    email.includes("kien") ||
    email.includes("admin") ||
    rawName.toLowerCase().includes("kien") ||
    rawName.toLowerCase() === "admin"
  ) {
    return "Nguyễn Đức Kiên";
  }

  // 4. Nếu rawName bị gán nhầm là email (chứa @)
  if (rawName.includes("@")) {
    const prefix = rawName.split("@")[0].toLowerCase();
    const matchedEmp = SEED_EMPLOYEES.find(
      (emp) => emp.email.toLowerCase().startsWith(prefix)
    );
    if (matchedEmp?.name) {
      return matchedEmp.name;
    }
    // Chuyển prefix dạng tran.minh.quang thành Tran Minh Quang
    return prefix
      .split(/[._-]/)
      .filter((w: string) => w.length > 0)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // 5. Nếu rawName là chuỗi không có khoảng trắng (ví dụ username)
  if (rawName.length > 0) {
    const matchedEmp = SEED_EMPLOYEES.find(
      (emp) => emp.email.toLowerCase().startsWith(rawName.toLowerCase())
    );
    if (matchedEmp?.name) return matchedEmp.name;

    return rawName
      .split(/[._-]/)
      .filter((w: string) => w.length > 0)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  return "Nguyễn Đức Kiên";
}

/**
 * Lấy chức vụ hiển thị của người dùng
 */
export function getUserPosition(user: any): string {
  if (user?.position && user.position.trim() !== "" && user.position !== "Quản trị viên") {
    return user.position;
  }
  const email = (user?.email || "").toLowerCase();
  const name = (user?.name || "").toLowerCase();
  if (email.includes("khang") || name.includes("khang")) {
    return "Trưởng Ban Hành chính - Nhân sự";
  }
  if (email.includes("kien") || name.includes("kien")) {
    return "Nhân viên IT";
  }
  if (email.includes("uyen") || name.includes("uyen")) {
    return "Nhân viên IT";
  }
  return user?.position || "Nhân viên IT";
}

/**
 * Lấy quyền của hệ thống (System Role / System Permission) của người dùng
 */
export function getUserSystemRole(user: any): string {
  const role = (user?.role || user?.systemRole || "").toUpperCase();
  if (role === "ADMIN" || role === "SYSTEM_ADMIN" || role === "QUẢN TRỊ VIÊN") {
    return "Quản trị viên hệ thống";
  }
  if (role === "HR" || role === "HR_MANAGER") {
    return "Quản trị viên Cán bộ Nhân sự";
  }
  if (role === "LEADER" || role === "BAN_GIAM_DOC") {
    return "Lãnh đạo & Trưởng ban";
  }
  const email = (user?.email || "").toLowerCase();
  const name = (user?.name || "").toLowerCase();
  if (email.includes("kien") || name.includes("kien") || email.includes("admin")) {
    return "Quản trị viên hệ thống";
  }
  if (email.includes("khang") || name.includes("khang")) {
    return "Quản trị viên HCNS (Cấp 2)";
  }
  return user?.systemRoleLabel || "Thành viên hệ thống";
}

