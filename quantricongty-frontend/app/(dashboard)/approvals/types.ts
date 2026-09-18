export interface ApprovalHistory {
  step: string;
  actor: string;
  action: string;
  time: string;
  note?: string;
}

export interface ApprovalItem {
  _id?: string;
  id?: string;
  code: string;
  type: "leave" | "trip" | "document";
  title: string;
  requesterCode: string;
  requesterName: string;
  department: string;
  position: string;
  priority: "high" | "medium" | "low" | "normal";
  reason: string;
  status: "PENDING_LEADER" | "PENDING_HR" | "APPROVED" | "REJECTED" | "REQUEST_CANCEL" | "CANCELLED";

  // Leave specific fields
  leaveType?: "annual" | "personal" | "sick" | "unpaid";
  leaveShift?: "full" | "morning" | "afternoon";
  leaveShiftLabel?: string;
  startDate?: string;
  endDate?: string;
  daysCount?: number;
  dates?: string[];
  handoverTo?: string;

  // Trip / Document fields
  amount?: string;
  attachments?: string[];

  // 2-Stage Approvals
  leaderApproval?: {
    approvedBy: string;
    approvedByName: string;
    status: "pending" | "approved" | "rejected" | "skipped";
    note?: string;
    time?: string;
  };
  hrApproval?: {
    approvedBy: string;
    approvedByName: string;
    status: "pending" | "approved" | "rejected";
    note?: string;
    time?: string;
  };

  history: ApprovalHistory[];
  cancelReason?: string;
  createdAt?: string;
}

export interface UserLeaveStats {
  quota: number;
  carried: number;
  totalAllowed: number;
  used: number;
  remaining: number;
}
