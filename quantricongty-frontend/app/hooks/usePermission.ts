"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/app/context/AppContext";
import {
  canUserAccess,
  getUserMatrixRoles,
  getStoredPermissionMatrix,
  checkIsSystemAdmin,
  getStoredSystemAdmins,
  assignSystemAdmin,
  transferSystemAdmin,
  revokeSystemAdmin,
  PermissionGroup,
  MatrixRole,
  SystemAdminSlot,
} from "@/app/utils/permissions";

export function usePermission() {
  const { currentUser } = useApp();
  const [matrix, setMatrix] = useState<PermissionGroup[]>([]);
  const [roles, setRoles] = useState<MatrixRole[]>([]);
  const [isSysAdmin, setIsSysAdmin] = useState<boolean>(false);
  const [systemAdmins, setSystemAdmins] = useState<SystemAdminSlot[]>([]);

  // Cập nhật ma trận, vai trò và quyền hệ thống
  const refresh = useCallback(() => {
    setMatrix(getStoredPermissionMatrix());
    setRoles(getUserMatrixRoles(currentUser));
    setIsSysAdmin(checkIsSystemAdmin(currentUser));
    setSystemAdmins(getStoredSystemAdmins());
  }, [currentUser]);

  useEffect(() => {
    refresh();

    // Lắng nghe sự kiện khi Admin lưu ma trận hoặc thay đổi quản trị viên hệ thống
    const handleChanged = () => {
      refresh();
    };

    window.addEventListener("permission-changed", handleChanged);
    window.addEventListener("system-admins-changed", handleChanged);
    return () => {
      window.removeEventListener("permission-changed", handleChanged);
      window.removeEventListener("system-admins-changed", handleChanged);
    };
  }, [refresh]);

  /**
   * Kiểm tra quyền của người dùng hiện tại
   */
  const can = useCallback(
    (permissionId: string): boolean => {
      return canUserAccess(currentUser, permissionId);
    },
    [currentUser]
  );

  return {
    can,
    roles,
    matrix,
    refreshPermissions: refresh,
    // Quyền hệ thống (System Admin - Tối đa 2 người)
    isSystemAdmin: isSysAdmin,
    systemAdmins,
    assignSystemAdmin,
    transferSystemAdmin,
    revokeSystemAdmin,
    // Quyền nghiệp vụ
    isAdmin: roles.includes("admin"),
    isLeader: roles.includes("leader"),
    isHR: roles.includes("hr"),
    isEmployee: roles.includes("employee"),
  };
}
