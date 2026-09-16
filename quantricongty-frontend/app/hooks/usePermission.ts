"use client";

import { useState, useEffect, useCallback } from "react";
import { useApp } from "@/app/context/AppContext";
import {
  canUserAccess,
  getUserMatrixRoles,
  getStoredPermissionMatrix,
  PermissionGroup,
  MatrixRole,
} from "@/app/utils/permissions";

export function usePermission() {
  const { currentUser } = useApp();
  const [matrix, setMatrix] = useState<PermissionGroup[]>([]);
  const [roles, setRoles] = useState<MatrixRole[]>([]);

  // Cập nhật ma trận và vai trò
  const refresh = useCallback(() => {
    setMatrix(getStoredPermissionMatrix());
    setRoles(getUserMatrixRoles(currentUser));
  }, [currentUser]);

  useEffect(() => {
    refresh();

    // Lắng nghe sự kiện khi Admin lưu ma trận mới trong trang Cài đặt
    const handlePermissionChanged = () => {
      refresh();
    };

    window.addEventListener("permission-changed", handlePermissionChanged);
    return () => {
      window.removeEventListener("permission-changed", handlePermissionChanged);
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
    isAdmin: roles.includes("admin"),
    isLeader: roles.includes("leader"),
    isHR: roles.includes("hr"),
    isEmployee: roles.includes("employee"),
  };
}
