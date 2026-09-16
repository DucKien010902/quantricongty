"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { SEED_EMPLOYEES, COMPANY_DEPARTMENTS, Employee } from "@/app/data/seed-employees";
import { getUserDisplayName, getUserPosition } from "@/app/utils/user";

interface AppContextType {
  currentUser: any;
  isAuthLoaded: boolean;
  employees: Employee[];
  departments: any[];
  company: any;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  toastMsg: string | null;
  showToast: (msg: string) => void;
  loadData: () => Promise<void>;
  handleLogin: (user: any) => void;
  handleLogout: () => void;
  handleUpdateCurrentUser: (updatedUser: any) => Promise<void>;
  handleUpdateEmployee: (id: string, updatedData: any) => Promise<void>;
  handleDeleteEmployee: (id: string) => Promise<void>;
  handleDownloadTemplate: () => void;
  // Sidebar collapse state
  isSidebarCollapsed: boolean;
  setIsSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebar: () => void;
  // Modal states
  isCompanyModalOpen: boolean;
  setIsCompanyModalOpen: (open: boolean) => void;
  isWizardActive: boolean;
  setIsWizardActive: (active: boolean) => void;
  isJoinActive: boolean;
  setIsJoinActive: (active: boolean) => void;
  inviteCode: string;
  setInviteCode: (code: string) => void;
  handleWizardComplete: (setupData: any) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState<boolean>(false);

  // Flow State: Wizard & Join Screen
  const [isWizardActive, setIsWizardActive] = useState<boolean>(false);
  const [isJoinActive, setIsJoinActive] = useState<boolean>(false);
  const [inviteCode, setInviteCode] = useState<string>("");

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<any[]>(COMPANY_DEPARTMENTS);
  const [company, setCompany] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Sidebar collapse state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const toggleSidebar = () => setIsSidebarCollapsed((prev) => !prev);

  // Modals
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState<boolean>(false);

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Check URL params for invite/join & auth on mount
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const joinParam = params.get("join") || params.get("invite") || params.get("code");
        if (joinParam) {
          setInviteCode(joinParam);
          setIsJoinActive(true);
        }
      }

      const stored = localStorage.getItem("dhi_user");
      const kienAdmin = SEED_EMPLOYEES.find((e) => e.name.includes("Kiên")) || SEED_EMPLOYEES[0];
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed) {
          const isKien =
            (parsed.email || "").toLowerCase().includes("kien") ||
            (parsed.name || "").toLowerCase().includes("kien");
          const enriched = isKien
            ? {
                ...kienAdmin,
                ...parsed,
                avatar: parsed.avatar || kienAdmin.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
                position: "Nhân viên IT",
                role: "ADMIN",
                department: "Ban Công nghệ Thông tin & Chuyển đổi số",
              }
            : parsed;
          enriched.name = getUserDisplayName(enriched);
          enriched.position = getUserPosition(enriched);
          setCurrentUser(enriched);
          localStorage.setItem("dhi_user", JSON.stringify(enriched));
        }
      } else {
        // Đã đăng xuất -> Giữ currentUser = null, không tự động gán tài khoản
        setCurrentUser(null);
      }
    } catch {
      // ignore
    } finally {
      setIsAuthLoaded(true);
    }
  }, []);

  // Fetch data from backend
  const loadData = async () => {
    try {
      const compRes = await fetch("http://localhost:5002/api/company");
      if (compRes.ok) {
        setCompany(await compRes.json());
      }

      const deptRes = await fetch("http://localhost:5002/api/departments");
      if (deptRes.ok) {
        const deptData = await deptRes.json();
        if (Array.isArray(deptData) && deptData.length > 0) {
          setDepartments(deptData);
        } else {
          setDepartments(COMPANY_DEPARTMENTS);
        }
      } else {
        setDepartments(COMPANY_DEPARTMENTS);
      }

      const empRes = await fetch("http://localhost:5002/api/employees");
      if (empRes.ok) {
        const empData = await empRes.json();
        if (Array.isArray(empData) && empData.length > 0) {
          const mapped = empData.map((e: any) => ({ ...e, id: e.code || e._id }));
          setEmployees(mapped);

          // Cập nhật đồng bộ avatar của currentUser theo đúng avatar nhân viên trên backend/database
          setCurrentUser((prev: any) => {
            if (!prev) return null;
            const match = mapped.find(
              (e: any) =>
                (e.email && prev.email && e.email.toLowerCase() === prev.email.toLowerCase()) ||
                (e.code && (prev.code || prev.id) && (e.code === prev.code || e.code === prev.id))
            );
            if (match && match.avatar) {
              const updated = { ...match, ...prev, avatar: match.avatar };
              localStorage.setItem("dhi_user", JSON.stringify(updated));
              return updated;
            }
            return prev;
          });
        } else {
          setEmployees(SEED_EMPLOYEES);
        }
      } else {
        setEmployees(SEED_EMPLOYEES);
      }
    } catch {
      setEmployees(SEED_EMPLOYEES);
      setDepartments(COMPANY_DEPARTMENTS);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLogin = (user: any) => {
    const cleanName = getUserDisplayName(user);
    const cleanPosition = getUserPosition(user);
    const enriched = { ...user, name: cleanName, position: cleanPosition };
    setCurrentUser(enriched);
    localStorage.setItem("dhi_user", JSON.stringify(enriched));
    showToast(`Chào mừng ${cleanName} đã đăng nhập!`);
    if (typeof window !== "undefined" && window.location.pathname !== "/") {
      window.location.href = "/";
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("dhi_user");
      sessionStorage.clear();
    } catch {
      // ignore
    }
    if (typeof window !== "undefined") {
      window.location.href = "/";
    }
  };

  const handleUpdateCurrentUser = async (updatedUser: any) => {
    const cleanName = getUserDisplayName(updatedUser);
    const cleanPosition = getUserPosition(updatedUser);
    const merged = {
      ...currentUser,
      ...updatedUser,
      name: cleanName,
      position: cleanPosition,
    };
    setCurrentUser(merged);
    localStorage.setItem("dhi_user", JSON.stringify(merged));

    // Cập nhật vào danh sách employees nếu có
    setEmployees((prev) =>
      prev.map((emp) =>
        emp.email?.toLowerCase() === merged.email?.toLowerCase() ||
        emp.id === merged.id ||
        emp.code === merged.code ||
        emp.code === merged.id ||
        emp.id === merged.code
          ? { ...emp, ...merged }
          : emp
      )
    );

    // Đồng bộ vào backend MongoDB nếu có
    try {
      if (merged.id || merged._id) {
        await fetch(`http://localhost:5002/api/employees/${merged.id || merged._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(merged),
        });
      }
    } catch {
      // ignore
    }

    showToast("Hồ sơ cá nhân đã được cập nhật thành công!");
  };

  const handleUpdateEmployee = async (id: string, updatedData: any) => {
    // Merge into employees list
    setEmployees((prev) =>
      prev.map((emp) =>
        (emp as any)._id === id || emp.id === id ? { ...emp, ...updatedData } : emp
      )
    );
    // Sync to backend
    try {
      await fetch(`http://localhost:5002/api/employees/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });
    } catch {
      // ignore
    }
    showToast("Hồ sơ nhân viên đã được cập nhật thành công!");
  };

  const handleDownloadTemplate = () => {
    window.open("http://localhost:5002/api/employees/export-template", "_blank");
    showToast("Đang tải file mẫu...");
  };

  const handleDeleteEmployee = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5002/api/employees/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        showToast("Đã xóa nhân sự khỏi hệ thống!");
        await loadData();
      }
    } catch {
      alert("Không kết nối được backend!");
    }
  };

  // Hoàn tất Wizard khởi tạo công ty
  const handleWizardComplete = (setupData: {
    company: any;
    departments: any[];
    employees: any[];
  }) => {
    if (setupData.company) setCompany(setupData.company);
    if (setupData.departments?.length > 0) setDepartments(setupData.departments);
    if (setupData.employees?.length > 0) {
      setEmployees(
        setupData.employees.map((e, idx) => ({
          id: `NV-${1000 + idx + 1}`,
          code: `NV-${1000 + idx + 1}`,
          name: e.name,
          email: e.email,
          phone: e.phone || "",
          department: e.department || "Ban Giám Đốc",
          role: e.position || "Cán bộ quản trị",
          status: "invited",
          gender: "Nam",
          avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
          joinDate: new Date().toLocaleDateString("vi-VN"),
          salaryGrade: "Bậc 3",
          location: "Hà Nội",
          performance: 90,
          projectsCount: 1,
        }))
      );
    }
    setIsWizardActive(false);
    showToast("🎉 Khởi tạo công ty thành công! Chào mừng vào trang điều hành!");
    loadData();
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthLoaded,
        employees,
        departments,
        company,
        searchQuery,
        setSearchQuery,
        toastMsg,
        showToast,
        loadData,
        handleLogin,
        handleLogout,
        handleUpdateCurrentUser,
        handleUpdateEmployee,
        handleDeleteEmployee,
        handleDownloadTemplate,
        isSidebarCollapsed,
        setIsSidebarCollapsed,
        toggleSidebar,
        isCompanyModalOpen,
        setIsCompanyModalOpen,
        isWizardActive,
        setIsWizardActive,
        isJoinActive,
        setIsJoinActive,
        inviteCode,
        setInviteCode,
        handleWizardComplete,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
