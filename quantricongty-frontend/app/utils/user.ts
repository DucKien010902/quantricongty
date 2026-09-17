/**
 * Lấy tên hiển thị thật của người dùng
 */
export function getUserDisplayName(user: any): string {
  if (!user) return "Người dùng";
  if (user.name && user.name.trim() !== "") {
    return user.name.trim();
  }
  if (user.email && user.email.trim() !== "") {
    const prefix = user.email.trim().split("@")[0];
    return prefix
      .split(/[._-]/)
      .filter((w: string) => w.length > 0)
      .map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }
  return "Người dùng";
}

/**
 * Lấy chức vụ hiển thị của người dùng
 */
export function getUserPosition(user: any): string {
  if (user?.position && user.position.trim() !== "") {
    return user.position.trim();
  }
  return "Cán bộ nhân viên";
}

/**
 * Lấy quyền của hệ thống (System Role / System Permission) của người dùng
 */
export function getUserSystemRole(user: any): string {
  const role = (user?.role || user?.systemRole || "").toUpperCase();
  if (role === "ADMIN" || role === "CHAIRMAN" || role === "CEO" || role === "SYSTEM_ADMIN") {
    return "Quản trị viên";
  }
  if (role === "LEADER" || role === "HEAD_OF_DEPARTMENT") {
    return "Lãnh đạo & Trưởng ban";
  }
  if (role === "HR" || role === "HCNS") {
    return "Quản lý Hành chính - Nhân sự";
  }
  return "Thành viên hệ thống";
}

