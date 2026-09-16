export interface Employee {
  id: string;
  code?: string;
  attendanceCode?: string; // Mã chấm công trên máy (VD: "1", "3", "6")
  name: string;
  gender: "Nam" | "Nữ";
  email: string;
  phone: string;
  avatar: string;
  department: string;
  role: "ADMIN" | "LEADER" | "USER" | string; // Quyền tài khoản: Admin, Leader, User
  position?: string; // Chức vụ cụ thể (VD: Trưởng Ban Hành chính - Nhân sự, Nhân viên IT)
  positionLevel?: "Ban Quản Trị" | "Trưởng Ban" | "Nhân Viên" | string; // Cấp bậc chức danh
  status: "active" | "invited" | "probation" | "leave" | "inactive";
  joinDate: string;
  salaryGrade: string;
  location: string;
  performance: number;
  projectsCount: number;

  // Quỹ phép năm
  annualLeaveQuota?: number; // Tổng ngày phép năm được cấp
  carriedOverLeave?: number; // Phép tồn năm ngoái chuyển sang
  usedLeave?: number; // Số ngày đã sử dụng
  remainingLeave?: number; // Số ngày phép còn lại

  // Thông tin cá nhân mở rộng
  dob?: string;
  maritalStatus?: "Độc thân" | "Đã kết hôn" | "Khác";
  nationality?: string;
  ethnic?: string;
  religion?: string;
  placeOfBirth?: string;
  hometown?: string;

  // Định danh & Thuế & Bảo hiểm
  idNumber?: string;
  idIssueDate?: string;
  idIssuePlace?: string;
  taxCode?: string;
  taxAuthority?: string;
  socialInsuranceNo?: string;
  healthInsuranceNo?: string;
  hospital?: string;

  // Ngân hàng & Đãi ngộ
  bankAccount?: string;
  bankName?: string;
  bankBranch?: string;
  baseSalary?: string;

  // Liên hệ & Địa chỉ
  personalEmail?: string;
  workEmail?: string;
  permanentAddress?: string;
  currentAddress?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyRelationship?: string;

  // Công việc & Hợp đồng
  contractType?: string;
  contractDuration?: string;
  directManager?: string;
  workLevel?: string;
  education?: string;
  bio?: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  code: string;
  manager?: string;
  managerName?: string;
  description?: string;
  memberCount?: number;
  color?: string;
}

export interface PositionLevel {
  id: string;
  name: string;
  description: string;
  defaultRole: "ADMIN" | "LEADER" | "USER";
}

export const POSITION_LEVELS: PositionLevel[] = [
  { id: "board", name: "Ban Quản Trị", description: "Lãnh đạo cấp cao (HĐQT, Tổng Giám Đốc)", defaultRole: "ADMIN" },
  { id: "leader", name: "Trưởng Ban", description: "Người đứng đầu các Ban / Khối chuyên môn", defaultRole: "LEADER" },
  { id: "staff", name: "Nhân Viên", description: "Cán bộ, chuyên viên, kỹ sư tác nghiệp", defaultRole: "USER" },
];

export interface RoleGroup {
  id: "ADMIN" | "HCNS" | "LEADER" | "USER";
  name: string;
  shortLabel: string;
  desc: string;
  badgeColor: string;
  permissions: {
    canManageEmployees: boolean;
    canApproveRequests: boolean;
    canViewAllAttendance: boolean;
    canConfigureSettings: boolean;
  };
}

export const ROLE_GROUPS: RoleGroup[] = [
  {
    id: "ADMIN",
    name: "Quản trị viên (Admin)",
    shortLabel: "Admin",
    desc: "Toàn quyền cấu hình, phê duyệt và quản trị nhân sự toàn hệ thống",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
    permissions: {
      canManageEmployees: true,
      canApproveRequests: true,
      canViewAllAttendance: true,
      canConfigureSettings: true,
    },
  },
  {
    id: "HCNS",
    name: "Quản trị Nhân sự (HCNS)",
    shortLabel: "HCNS",
    desc: "Quản lý hồ sơ nhân viên, quy chế ca kíp và bảng chấm công toàn công ty",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    permissions: {
      canManageEmployees: true,
      canApproveRequests: true,
      canViewAllAttendance: true,
      canConfigureSettings: false,
    },
  },
  {
    id: "LEADER",
    name: "Trưởng ban (Leader)",
    shortLabel: "Leader",
    desc: "Quản lý nhân sự trong ban, phê duyệt đơn nghỉ phép, công tác và tài liệu trong ban",
    badgeColor: "bg-blue-50 text-[#1b365d] border-blue-200",
    permissions: {
      canManageEmployees: false,
      canApproveRequests: true,
      canViewAllAttendance: false,
      canConfigureSettings: false,
    },
  },
  {
    id: "USER",
    name: "Nhân viên (User)",
    shortLabel: "User",
    desc: "Xem hồ sơ cá nhân, tự chấm công, tạo đề xuất đơn và xem danh bạ đồng nghiệp",
    badgeColor: "bg-slate-100 text-slate-700 border-slate-200",
    permissions: {
      canManageEmployees: false,
      canApproveRequests: false,
      canViewAllAttendance: false,
      canConfigureSettings: false,
    },
  },
];

export const COMPANY_DEPARTMENTS: DepartmentInfo[] = [
  {
    id: "inv",
    name: "Ban Đầu tư & Thẩm định Dự án",
    code: "DHI-INV",
    managerName: "Chưa có",
    description: "Nghiên cứu thị trường, thẩm định và quản lý danh mục các dự án đầu tư",
    color: "bg-indigo-500",
  },
  {
    id: "biz",
    name: "Ban Kinh doanh & Phát triển Dự án",
    code: "DHI-BIZ",
    managerName: "Chưa có",
    description: "Phát triển khách hàng doanh nghiệp, đối tác chiến lược và mở rộng dự án",
    color: "bg-emerald-500",
  },
  {
    id: "fin",
    name: "Ban Tài chính - Kế toán",
    code: "DHI-FIN",
    managerName: "Chưa có",
    description: "Quản trị nguồn vốn, kế toán tài chính và lập báo cáo kiểm toán doanh nghiệp",
    color: "bg-violet-500",
  },
  {
    id: "hr",
    name: "Ban Nhân sự & Hành chính Tổng hợp",
    code: "DHI-HR",
    managerName: "Trần Văn Khang",
    description: "Tuyển dụng nhân tài, đào tạo cán bộ, chính sách đãi ngộ và quản trị văn phòng",
    color: "bg-rose-500",
  },
  {
    id: "tech",
    name: "Ban Công nghệ Thông tin & Chuyển đổi số",
    code: "DHI-IT",
    managerName: "Nguyễn Đức Kiên",
    description: "Phát triển hệ sinh thái phần mềm, an toàn thông tin và chuyển đổi số doanh nghiệp",
    color: "bg-blue-500",
  },
  {
    id: "legal",
    name: "Ban Pháp chế & Kiểm soát Quản trị",
    code: "DHI-LEG",
    managerName: "Chưa có",
    description: "Rà soát hợp đồng pháp lý, kiểm soát rủi ro và tuân thủ quy chế công ty",
    color: "bg-amber-500",
  },
];

export const DEPARTMENTS: DepartmentInfo[] = [
  { id: "all", name: "Tất cả phòng ban", code: "ALL", manager: "", memberCount: 3, color: "bg-blue-500" },
  ...COMPANY_DEPARTMENTS,
];

export const SEED_EMPLOYEES: Employee[] = [
  {
    id: "DHI-001",
    code: "DHI-001",
    attendanceCode: "1",
    name: "Trần Văn Khang",
    gender: "Nam",
    email: "khang.tran@donghaiinvest.vn",
    phone: "0912 345 888",
    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
    department: "Ban Nhân sự & Hành chính Tổng hợp",
    role: "HCNS",
    position: "Trưởng Ban Hành chính - Nhân sự",
    positionLevel: "Trưởng Ban",
    status: "active",
    joinDate: "01/01/2021",
    salaryGrade: "Bậc 8",
    location: "Hà Nội",
    performance: 98,
    projectsCount: 10,
    contractType: "Hợp đồng lao động không xác định thời hạn",
    workLevel: "Trưởng Ban",
    annualLeaveQuota: 12,
    carriedOverLeave: 0,
    usedLeave: 0,
    remainingLeave: 12,
    bio: "Trưởng Ban Hành chính - Nhân sự kiêm Quản trị viên hệ thống (Admin).",
  },
  {
    id: "DHI-002",
    code: "ĐH0050",
    attendanceCode: "3",
    name: "Nguyễn Đức Kiên",
    gender: "Nam",
    email: "kien.nguyen@donghaiinvest.vn",
    phone: "0912 345 678",
    avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEcN6OBmR6zsdwTmD4duBznQO1ORmCq5Yc-MdPDoNOgA&s=10",
    department: "Ban Công nghệ Thông tin & Chuyển đổi số",
    role: "ADMIN",
    position: "Nhân viên IT",
    positionLevel: "Nhân Viên",
    status: "active",
    joinDate: "01/01/2021",
    salaryGrade: "Bậc 5",
    location: "Hà Nội",
    performance: 99,
    projectsCount: 16,
    annualLeaveQuota: 12,
    carriedOverLeave: 0,
    usedLeave: 0,
    remainingLeave: 12,
    dob: "15/08/1995",
    maritalStatus: "Độc thân",
    nationality: "Việt Nam",
    ethnic: "Kinh",
    religion: "Không",
    placeOfBirth: "Hà Nội",
    hometown: "Hà Nội",
    idNumber: "001095012345",
    idIssueDate: "12/04/2021",
    idIssuePlace: "Cục Cảnh sát QLHC về TTXH",
    taxCode: "8492019281",
    taxAuthority: "Chi cục Thuế TP. Hà Nội",
    socialInsuranceNo: "7916291029",
    healthInsuranceNo: "DN4791629102901",
    hospital: "Bệnh viện Hữu Nghị Việt Đức",
    bankAccount: "1903482910299",
    bankName: "Techcombank",
    bankBranch: "Hội sở Ba Đình - Hà Nội",
    baseSalary: "Thỏa thuận",
    personalEmail: "kien8438@gmail.com",
    workEmail: "kien.nguyen@donghaiinvest.vn",
    permanentAddress: "Số 68 Phố Huế, P. Hàng Bài, Q. Hoàn Kiếm, Hà Nội",
    currentAddress: "Biệt thự Hoa Lan, Vinhomes Riverside, Long Biên, Hà Nội",
    emergencyContactName: "Nguyễn Văn Nam (Bố ruột) - 0903 219 888",
    contractType: "Hợp đồng lao động không xác định thời hạn",
    contractDuration: "Vô thời hạn",
    workLevel: "Chuyên viên chính thức",
    education: "Kỹ sư Công nghệ thông tin",
    bio: "Nhân viên Công nghệ thông tin kiêm Quản trị viên hệ thống (Admin).",
  },
  {
    id: "DHI-003",
    code: "ĐH0015",
    attendanceCode: "6",
    name: "Lê Phương Uyên",
    gender: "Nữ",
    email: "uyen.le@donghaiinvest.vn",
    phone: "0988 667 788",
    avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
    department: "Ban Công nghệ Thông tin & Chuyển đổi số",
    role: "USER",
    position: "Nhân viên IT",
    positionLevel: "Nhân Viên",
    status: "active",
    joinDate: "15/03/2022",
    salaryGrade: "Bậc 3",
    location: "Hà Nội",
    performance: 95,
    projectsCount: 6,
    annualLeaveQuota: 12,
    carriedOverLeave: 0,
    usedLeave: 0,
    remainingLeave: 12,
    contractType: "Hợp đồng lao động xác định thời hạn",
    workLevel: "Chuyên viên chính thức",
    bio: "Nhân viên Ban Công nghệ thông tin.",
  },
  {
    id: "DHI-004",
    code: "ĐH0022",
    attendanceCode: "12",
    name: "Lan Huyền",
    gender: "Nữ",
    email: "huyen.lan@donghaiinvest.vn",
    phone: "0978 123 456",
    avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
    department: "Ban Tài chính - Kế toán",
    role: "USER",
    position: "Nhân viên kế toán",
    positionLevel: "Nhân Viên",
    status: "active",
    joinDate: "01/06/2023",
    salaryGrade: "Bậc 3",
    location: "Hà Nội",
    performance: 96,
    projectsCount: 8,
    annualLeaveQuota: 12,
    carriedOverLeave: 0,
    usedLeave: 0,
    remainingLeave: 12,
    contractType: "Hợp đồng lao động xác định thời hạn",
    workLevel: "Chuyên viên chính thức",
    bio: "Nhân viên kế toán thuộc Ban Tài chính - Kế toán.",
  },
];
