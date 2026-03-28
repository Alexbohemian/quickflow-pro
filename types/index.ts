export type WorkspaceRole =
  | "OWNER"
  | "ADMIN"
  | "PM"
  | "FINANCE"
  | "TEAM_MEMBER"
  | "CLIENT";

export type ProposalType = "BY_TIMELINE" | "BY_HOUR";
export type ProposalStatus =
  | "DRAFT"
  | "SENT"
  | "VIEWED"
  | "APPROVED"
  | "REJECTED"
  | "EXPIRED";

export type ProjectType = "BY_TIMELINE" | "BY_HOUR";
export type ProjectStatus =
  | "PENDING_PAYMENT"
  | "ACTIVE"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED";
export type KanbanColumn = "BACKLOG" | "TODO" | "IN_PROGRESS" | "READY_TO_TEST";

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";
export type ChangeOrderStatus =
  | "DRAFT"
  | "PENDING_APPROVAL"
  | "APPROVED"
  | "REJECTED";

export type LeadStage = "PROSPECT" | "IN_DISCUSSION" | "FINAL_STEP" | "ARCHIVED";
export type RequestPriority = "LOW" | "MEDIUM" | "HIGH";
export type ByHourSubType = "OPEN_HOURS" | "LIMITED_HOURS";

export type NotificationType =
  | "TASK_DUE"
  | "TASK_EXPIRED"
  | "TASK_COMPLETED"
  | "PROPOSAL_SENT"
  | "PROPOSAL_SIGNED"
  | "INVOICE_CREATED"
  | "CHANGE_ORDER_PENDING"
  | "CHANGE_ORDER_APPROVED"
  | "CHANGE_ORDER_REJECTED"
  | "MENTION"
  | "AGENT_ALERT";

export type NotificationChannel = "IN_APP" | "EMAIL" | "SMS" | "PUSH";

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: Record<string, string[]>;
  };
}
