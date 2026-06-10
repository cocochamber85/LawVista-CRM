export enum Role {
  FIRM_HEAD = "FIRM_HEAD", // Level 1 (Sultan Ahmed Khan)
  PARTNER = "PARTNER",     // Level 2 (Sarosh, Sohail, Wahab, Asif)
  SENIOR_STAFF = "SENIOR_STAFF", // Level 3 (Hamid, Muzammil, Waleed, Ahmed)
  STAFF = "STAFF",         // Level 4 (Asad, Abdul Qadir, Areesha)
  NON_SYSTEM = "NON_SYSTEM" // Level 5 (Shiraz, Waseem, Zeeshan Jr, Zeeshan Haider)
}

export interface User {
  id: string;
  name: string;
  role: Role;
  level: number;
  department: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  reportingTo?: string; // ID of primary supervisor
  baseSalary: number;
  active: boolean;
}

export interface Case {
  id: string;
  title: string;
  clientName: string;
  clientType: "Corporate" | "Individual" | "Government" | "NGO";
  caseType: "Contracts" | "Withholding" | "Litigation" | "Appeals" | "Tax & Audit" | "SECP" | "New Incorporations";
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "Intake" | "Active" | "Filing" | "Hearing" | "Resolution" | "Closed";
  opposingParty: string;
  courtName: string;
  judgeName?: string;
  filingDate: string;
  assignedTo: string[]; // User IDs
  estimatedFees: number;
  unpaidFees: number;
  description: string;
  timeline: TimelineEvent[];
  documents: DocumentRecord[];
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description: string;
  performedBy: string; // User Name
  type: "status" | "hearing" | "document" | "note";
}

export interface DocumentRecord {
  id: string;
  name: string;
  category: "Contract" | "Appeal" | "Correspondence" | "Evidence" | "Tax Return" | "Incorporation Form";
  uploadedBy: string; // User Name
  uploadedAt: string;
  fileSize: string;
  version: number;
  versions: { version: number; uploadedAt: string; uploadedBy: string; changeLog: string }[];
}

export interface Lead {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  source: "Social Media" | "Referral" | "Walk-in" | "Website" | "WhatsApp";
  status: "New" | "Contacted" | "Qualified" | "Proposal" | "Negotiation" | "Won" | "Lost";
  priority: "High" | "Medium" | "Low";
  assignedTo: string; // User ID
  notes: string;
  createdAt: string;
  score?: number; // AI-assigned score (0-100)
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string; // User ID
  assignedBy: string; // User ID
  department: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  status: "To Do" | "In Progress" | "Review" | "Done";
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  subtasks: { id: string; title: string; completed: boolean }[];
  comments: Comment[];
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: "Present" | "Absent" | "Late" | "Leave" | "Half-Day" | "Holiday";
  latitude?: number;
  longitude?: number;
  lateReasoning?: string;
  geofencePassed: boolean;
}

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: "Casual" | "Sick" | "Annual" | "Unpaid" | "Work From Home";
  startDate: string;
  endDate: string;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
  approvedBy?: string; // User ID/Name
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: "text" | "image" | "document" | "voice";
  status: "sent" | "delivered" | "read";
  emojiReactions?: { emoji: string; count: number; users: string[] }[];
  fileUrl?: string;
  fileName?: string;
}

export interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  participants: string[]; // User IDs
  isExternalWhatsApp?: boolean; // True if it's integrated client stream
  lastMessageText?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  caseTitle: string;
  clientName: string;
  amount: number;
  status: "Draft" | "Sent" | "Partial" | "Paid" | "Overdue";
  dueDate: string;
  createdAt: string;
  items: { description: string; quantity: number; rate: number; amount: number }[];
}

export interface Expense {
  id: string;
  description: string;
  category: "Office Supplies" | "Court Fees" | "Travel / Rider Fuel" | "Marketing" | "Petty Cash" | "Utilities" | "Salaries";
  amount: number;
  recordedBy: string; // User ID
  date: string;
  receiptUrl?: string;
  isReimbursable: boolean;
}

export interface FinancialSummary {
  revenueThisMonth: number;
  expensesThisMonth: number;
  netProfit: number;
  unpaidTotal: number;
}

export interface CustomReport {
  id: string;
  title: string;
  visualizationType: "Table" | "Bar Chart" | "Line Chart" | "Pie Chart" | "Heatmap" | "KPI Card" | "Funnel";
  metric: string;
  groupBy: string;
  filters: { field: string; operator: string; value: string }[];
  isScheduled: boolean;
  scheduleFrequency?: "Daily" | "Weekly" | "Monthly";
}
