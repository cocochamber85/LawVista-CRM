import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

// Initialize Gemini SDK safely
const apiKey = process.env.GEMINI_API_KEY || "";
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
  console.log("Gemini API initialized successfully.");
} else {
  console.log("No GEMINI_API_KEY environment variable found. AI features will fallback to deterministic generation.");
}

const DB_FILE = path.resolve('src/db.json');

// Ensure parent dir exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Pre-seeded Users Matching the Required Law Firm Hierarchy
const SEED_USERS = [
  { id: "1", name: "Sultan Ahmed Khan", role: "FIRM_HEAD", level: 1, department: "Executive Office", email: "sultan@legalopspro.com", phone: "+92 300 1111111", baseSalary: 300000, active: true },
  { id: "2", name: "Sarosh Sultan", role: "PARTNER", level: 2, department: "Contracts, Litigation & Admin", email: "sarosh@legalopspro.com", phone: "+92 300 2222222", baseSalary: 250000, active: true },
  { id: "3", name: "Wahab Ul Bari", role: "PARTNER", level: 2, department: "Sales Tax & Audit", email: "wahab@legalopspro.com", phone: "+92 300 3333333", baseSalary: 220000, active: true },
  { id: "4", name: "Asif Yousuf", role: "PARTNER", level: 2, department: "SECP, Withholding & Accounts", email: "asif@legalopspro.com", phone: "+92 300 4444444", baseSalary: 220000, active: true },
  { id: "5", name: "Sohail Kashani", role: "PARTNER", level: 2, department: "Sales Tax & Firm Sales", email: "sohail@legalopspro.com", phone: "+92 300 5555555", baseSalary: 220000, active: true },
  { id: "6", name: "Muzammil", role: "SENIOR_STAFF", level: 3, department: "Contracts, Litigation & Appeals", email: "muzammil@legalopspro.com", phone: "+92 321 1111111", reportingTo: "2", baseSalary: 120000, active: true },
  { id: "7", name: "Hamid", role: "SENIOR_STAFF", level: 3, department: "Operations, Accounting & HR", email: "hamid@legalopspro.com", phone: "+92 321 2222222", reportingTo: "4", baseSalary: 120000, active: true },
  { id: "8", name: "Waleed", role: "SENIOR_STAFF", level: 3, department: "Drafting Department", email: "waleed@legalopspro.com", phone: "+92 321 3333333", reportingTo: "2", baseSalary: 100000, active: true },
  { id: "9", name: "Ahmed", role: "SENIOR_STAFF", level: 3, department: "Tax Returns Department", email: "ahmed@legalopspro.com", phone: "+92 321 4444444", reportingTo: "3", baseSalary: 100000, active: true },
  { id: "10", name: "Asad", role: "STAFF", level: 4, department: "Drafting Department", email: "asad@legalopspro.com", phone: "+92 333 1111111", reportingTo: "8", baseSalary: 60000, active: true },
  { id: "11", name: "Abdul Qadir", role: "STAFF", level: 4, department: "Tax Returns Department", email: "abdulqadir@legalopspro.com", phone: "+92 333 2222222", reportingTo: "9", baseSalary: 60000, active: true },
  { id: "12", name: "Areesha", role: "STAFF", level: 4, department: "Sales & Client Operations", email: "areesha@legalopspro.com", phone: "+92 333 3333333", reportingTo: "7", baseSalary: 55000, active: true },
  // Level 5 Non-System Staff (No login rights, Hamid manages attendance and payout voucher)
  { id: "13", name: "Shiraz", role: "NON_SYSTEM", level: 5, department: "Rider & Logistics Services", email: "shiraz@nonuser.com", phone: "+92 345 1111111", reportingTo: "7", baseSalary: 35000, active: true },
  { id: "14", name: "Waseem", role: "NON_SYSTEM", level: 5, department: "Operations Support Staff", email: "waseem@nonuser.com", phone: "+92 345 2222222", reportingTo: "7", baseSalary: 30000, active: true },
  { id: "15", name: "Zeeshan Jr", role: "NON_SYSTEM", level: 5, department: "Operations Support Staff", email: "zeeshanjr@nonuser.com", phone: "+92 345 3333333", reportingTo: "7", baseSalary: 30000, active: true },
  { id: "16", name: "Zeeshan Haider", role: "NON_SYSTEM", level: 5, department: "Operations Support Staff", email: "zeeshandh@nonuser.com", phone: "+92 345 4444444", reportingTo: "7", baseSalary: 30000, active: true }
];

const SEED_CASES = [
  {
    id: "case-101",
    title: "Habib Bank Limited vs. Securities Exchange",
    clientName: "Habib Bank Limited",
    clientType: "Corporate",
    caseType: "SECP",
    priority: "Critical",
    status: "Hearing",
    opposingParty: "SECP Regional Commissioner",
    courtName: "High Court of Sindh",
    judgeName: "Justice Aqeel Ahmed",
    filingDate: "2026-03-12",
    assignedTo: ["2", "6"], // Sarosh, Muzammil
    estimatedFees: 450000,
    unpaidFees: 200000,
    description: "Appealing the regional SECP notice issued for non-compliance on shareholder disclosure parameters under Section 43.",
    timeline: [
      { id: "evt-1", date: "2026-03-12", title: "Case Intake", description: "Conflict check passed and client fee retainer agreed at PKR 450,000.", performedBy: "Sarosh Sultan", type: "status" },
      { id: "evt-2", date: "2026-03-15", title: "Petition Drafted", description: "Appeal petition completed and reviewed by Partner.", performedBy: "Muzammil", type: "document" },
      { id: "evt-3", date: "2026-04-01", title: "Preliminary Hearing", description: "Adjourned till June 15 for government counsel submission.", performedBy: "Sarosh Sultan", type: "hearing" }
    ],
    documents: [
      { id: "doc-1", name: "Appeal_Petition_Final.pdf", category: "Appeal", uploadedBy: "Muzammil", uploadedAt: "2026-03-14", fileSize: "2.4 MB", version: 1, versions: [] },
      { id: "doc-2", name: "Secp_Reply_Letter.pdf", category: "Correspondence", uploadedBy: "Sarosh Sultan", uploadedAt: "2026-04-05", fileSize: "1.2 MB", version: 1, versions: [] }
    ]
  },
  {
    id: "case-102",
    title: "Al-Hamd Rice Mills Withholding Exemption",
    clientName: "Al-Hamd Rice Mills Ltd",
    clientType: "Corporate",
    caseType: "Withholding",
    priority: "High",
    status: "Active",
    opposingParty: "Federal Board of Revenue (FBR)",
    courtName: "Inland Revenue Tribunal",
    judgeName: "Commissioner IR appeals",
    filingDate: "2026-05-10",
    assignedTo: ["3", "11"], // Wahab, Abdul Qadir
    estimatedFees: 250000,
    unpaidFees: 50000,
    description: "Seeking tax exemption status under clause 5(a) of local withholding tax schedule.",
    timeline: [
      { id: "evt-4", date: "2026-05-10", title: "Exemption Petition Filed", description: "Full withholding log filed with FBR panel.", performedBy: "Abdul Qadir", type: "status" }
    ],
    documents: [
      { id: "doc-3", name: "Tax_Filing_Form_10.pdf", category: "Tax Return", uploadedBy: "Abdul Qadir", uploadedAt: "2026-05-10", fileSize: "4.8 MB", version: 1, versions: [] }
    ]
  }
];

const SEED_LEADS = [
  { id: "lead-1", name: "Nadeem Akhtar", company: "Akhtar Cotton Mills", phone: "+92 312 9876543", email: "nadeem@akhtarcotton.pk", source: "WhatsApp", status: "Qualified", priority: "High", assignedTo: "12", notes: "Needs assistance registering a new commercial company and setting up Sales Tax registrations.", createdAt: "2026-06-05", score: 85 },
  { id: "lead-2", name: "Rehana Karim", phone: "+92 311 4567890", email: "rehana.k@gmail.com", source: "Social Media", status: "New", priority: "Medium", assignedTo: "12", notes: "Inquired through Facebook about land litigation appeal process.", createdAt: "2026-06-08", score: 62 },
  { id: "lead-3", name: "Zaheer Abbas", company: "Z-Tech Logistical Solutions", phone: "+92 321 9988776", email: "zaheer@ztech.com", source: "Website", status: "Proposal", priority: "High", assignedTo: "12", notes: "Wants a complete audit of contracts and customer service level agreements.", createdAt: "2026-05-29", score: 91 }
];

const SEED_TASKS = [
  { id: "task-1", title: "Draft Appeal of SECP Disclosures Notice", description: "Review Case #101 documents and prepare a robust appeal grounds draft for High Court filing.", assignedTo: "6", assignedBy: "2", department: "Contracts, Litigation & Admin", priority: "Critical", status: "In Progress", dueDate: "2026-06-12", estimatedHours: 8, actualHours: 2, subtasks: [{ id: "st-1", title: "Extract Section 43 discrepancies", completed: true }, { id: "st-2", title: "Write Case Grounds outline", completed: false }], comments: [], createdAt: "2026-06-08" },
  { id: "task-2", title: "Submit Monthly Sales Tax Returns", description: "Ensure annual audit filing matches monthly withholding reports before portal closing.", assignedTo: "11", assignedBy: "3", department: "Tax Returns Department", priority: "High", status: "To Do", dueDate: "2026-06-15", estimatedHours: 12, actualHours: 0, subtasks: [], comments: [], createdAt: "2026-06-09" },
  { id: "task-3", title: "Prepare Cash Ledger Petty Vouchers", description: "Hamid to organize weekly banking vouchers, cash ledger reconciliations and rider checkups.", assignedTo: "7", assignedBy: "4", department: "Operations, Accounting & HR", priority: "Medium", status: "To Do", dueDate: "2026-06-10", estimatedHours: 4, actualHours: 0, subtasks: [], comments: [], createdAt: "2026-06-09" }
];

const SEED_CHATS = [
  { id: "chat-global", name: "Firm-Wide Announcements", isGroup: true, participants: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], unreadCount: 0, lastMessageText: "Welcome to LegalOps Pro ERP platform!", lastMessageTime: "2026-06-09T10:00:00Z" },
  { id: "chat-ops", name: "Operations & Administration Group", isGroup: true, participants: ["2", "4", "7", "12"], unreadCount: 0, lastMessageText: "Hamid, please update Shiraz's logistics dispatch list today.", lastMessageTime: "2026-06-09T11:00:00Z" },
  { id: "chat-wa-ext-1", name: "+92 312 9876543 (Nadeem Akhtar)", isGroup: false, participants: ["2", "12"], isExternalWhatsApp: true, unreadCount: 2, lastMessageText: "Please send the agreement proposal by today.", lastMessageTime: "2026-06-09T09:30:00Z" }
];

const SEED_MESSAGES = [
  { id: "msg-1", chatId: "chat-global", senderId: "2", senderName: "Sarosh Sultan", text: "Welcome to LegalOps Pro ERP platform everyone! Let's ensure high-density communication here.", timestamp: "2026-06-09T09:15:00Z", type: "text", status: "read" },
  { id: "msg-2", chatId: "chat-ops", senderId: "4", senderName: "Asif Yousuf", text: "Hamid, please update Shiraz's logistics dispatch list today.", timestamp: "2026-06-09T11:00:00Z", type: "text", status: "read" },
  { id: "msg-3", chatId: "chat-wa-ext-1", senderId: "client", senderName: "Nadeem Akhtar (FBR Lead)", text: "Salam, I've received your business profile brochure. Can we proceed with company registration details?", timestamp: "2026-06-09T09:20:00Z", type: "text", status: "delivered" },
  { id: "msg-4", chatId: "chat-wa-ext-1", senderId: "client", senderName: "Nadeem Akhtar (FBR Lead)", text: "Please send the agreement proposal by today.", timestamp: "2026-06-09T09:30:00Z", type: "text", status: "delivered" }
];

const SEED_ATTENDANCE = [
  { id: "att-1", userId: "7", userName: "Hamid", date: "2026-06-08", checkInTime: "10:20 AM", checkOutTime: "06:15 PM", status: "Present", geofencePassed: true },
  { id: "att-2", userId: "10", userName: "Asad", date: "2026-06-08", checkInTime: "10:28 AM", checkOutTime: "06:00 PM", status: "Present", geofencePassed: true },
  { id: "att-3", userId: "12", userName: "Areesha", date: "2026-06-08", checkInTime: "10:52 AM", checkOutTime: "06:05 PM", status: "Late", lateReasoning: "Traffic delay on Shahrah-e-Faisal", geofencePassed: true },
  { id: "att-4", userId: "13", userName: "Shiraz", date: "2026-06-08", checkInTime: "10:30 AM", checkOutTime: "06:30 PM", status: "Present", geofencePassed: false } // marked by HR
];

const SEED_LEAVE_REQUESTS = [
  { id: "lr-1", userId: "10", userName: "Asad", leaveType: "Sick", startDate: "2026-06-11", endDate: "2026-06-11", status: "Pending", reason: "Slight dental procedure discomfort.", approvedBy: "" }
];

const SEED_PAYROLL = [
  { id: "pay-1", userId: "10", userName: "Asad", salaryMonth: "May 2026", basicSalary: 60000, allowances: 5000, deductions: 2000, netPaid: 63000, status: "Paid" },
  { id: "pay-2", userId: "12", userName: "Areesha", salaryMonth: "May 2026", basicSalary: 55000, allowances: 4000, deductions: 1000, netPaid: 58000, status: "Paid" },
  { id: "pay-3", userId: "13", userName: "Shiraz (Rider)", salaryMonth: "May 2026", basicSalary: 35000, allowances: 8000, deductions: 0, netPaid: 43000, status: "Paid" }
];

const SEED_INVOICES = [
  { id: "inv-201", invoiceNumber: "INV-2026-001", caseId: "case-101", caseTitle: "Habib Bank Limited vs. Securities Exchange", clientName: "Habib Bank Limited", amount: 250000, status: "Partial", dueDate: "2026-06-20", createdAt: "2026-05-15", items: [{ description: "Initial Brief Filing & SECP documentation prep", quantity: 1, rate: 250000, amount: 250000 }] },
  { id: "inv-202", invoiceNumber: "INV-2026-002", caseId: "case-102", caseTitle: "Al-Hamd Rice Mills Withholding Exemption", clientName: "Al-Hamd Rice Mills Ltd", amount: 200000, status: "Paid", dueDate: "2026-06-10", createdAt: "2026-05-10", items: [{ description: "FBR exemption log representations", quantity: 1, rate: 200000, amount: 200000 }] }
];

const SEED_EXPENSES = [
  { id: "exp-301", description: "Rider dispatch high court courier fuel reimbursement", category: "Travel / Rider Fuel", amount: 4500, recordedBy: "7", date: "2026-06-08", isReimbursable: true },
  { id: "exp-302", description: "Weekly high-speed photocopy papers & stationary bundle", category: "Office Supplies", amount: 12000, recordedBy: "7", date: "2026-06-07", isReimbursable: false }
];

const SEED_REPORTS = [
  { id: "rep-1", title: "Daily Task Resource Load Analysis", visualizationType: "Bar Chart", metric: "Tasks Count", groupBy: "priority", filters: [], isScheduled: true, scheduleFrequency: "Daily" },
  { id: "rep-2", title: "Monthly Firm Revenue & Collection Efficiency Status", visualizationType: "KPI Card", metric: "Revenue Sum", groupBy: "status", filters: [], isScheduled: true, scheduleFrequency: "Monthly" }
];

const DEFAULT_DB = {
  users: SEED_USERS,
  cases: SEED_CASES,
  leads: SEED_LEADS,
  tasks: SEED_TASKS,
  attendance: SEED_ATTENDANCE,
  leaveRequests: SEED_LEAVE_REQUESTS,
  payroll: SEED_PAYROLL,
  invoices: SEED_INVOICES,
  expenses: SEED_EXPENSES,
  chats: SEED_CHATS,
  messages: SEED_MESSAGES,
  reports: SEED_REPORTS,
  pettyCash: 45000 // In PKR currency
};

// Seed utility
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2));
    return DEFAULT_DB;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    return DEFAULT_DB;
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// REST endpoints & express setup
const app = express();
app.use(express.json({ limit: '10mb' }));

// Helper to filter items based on user downstream visibility
// Sultan (Firm Head) / Lead partners can see everything.
// Level 3 (Hamid/Waleed) see department users or reportingTo.
// Level 4 (Staff like Asad, Abdul Qadir) see their assigned tasks and cases only.
function applyRbacFilter(userId: string, data: any) {
  const db = readDb();
  const current = db.users.find((u: any) => u.id === userId);
  if (!current) return data;

  const userRole = current.role;
  const userLevel = current.level;
  const userDept = current.department;

  // Level 1 or 2 can see everything
  if (userLevel === 1 || userRole === "PARTNER") {
    return data;
  }

  // Otherwise filter tasks, cases, and leads
  return {
    ...data,
    tasks: data.tasks.filter((t: any) => {
      // Users can see tasks if they are assigned, created by them, or if the assignee is of higher level value (which means lower rank in hierarchy, e.g. 4 > 3)
      const assignee = db.users.find((u: any) => u.id === t.assignedTo);
      const assignor = db.users.find((u: any) => u.id === t.assignedBy);
      
      const isSelf = t.assignedTo === userId || t.assignedBy === userId;
      const isSubordinate = assignee && assignee.reportingTo === userId;
      const isSameDeptSenior = userLevel === 3 && t.department === userDept;
      
      return isSelf || isSubordinate || isSameDeptSenior;
    }),
    cases: data.cases.filter((c: any) => {
      // Subsystem check: Is in assigned list OR reporting managers
      const hasAssignment = c.assignedTo.includes(userId);
      const isDeptManaged = current.level <= 3 && c.caseType && (
        (current.id === "7" && ["SECP", "Withholding"].includes(c.caseType)) || // Hamid
        (current.id === "8" && ["Contracts", "Litigation", "Appeals"].includes(c.caseType)) || // Waleed
        (current.id === "9" && ["Tax & Audit"].includes(c.caseType)) // Ahmed
      );
      return hasAssignment || isDeptManaged;
    }),
    leads: data.leads.filter((l: any) => {
      // Leads assigned or overseen
      return l.assignedTo === userId || current.id === "7" || userLevel === 2;
    })
  };
}

// GET DB State filtered by current active user id
app.get('/api/db-state', (req, res) => {
  const activeUserId = (req.query.userId as string) || "2"; // Default Sarosh Sultan (Partner Admin)
  const fullState = readDb();
  const filtered = applyRbacFilter(activeUserId, fullState);
  res.json({
    roleSelf: fullState.users.find((u: any) => u.id === activeUserId),
    allUsers: fullState.users, // Front needs user list for dropdowns
    cases: filtered.cases,
    leads: filtered.leads,
    tasks: filtered.tasks,
    chats: filtered.chats,
    messages: filtered.messages,
    attendance: fullState.attendance, // Dashboard and Hamid can see logs
    leaveRequests: fullState.leaveRequests,
    payroll: fullState.payroll,
    invoices: fullState.invoices,
    expenses: fullState.expenses,
    reports: fullState.reports,
    pettyCash: fullState.pettyCash
  });
});

// Update specific task
app.post('/api/tasks/update', (req, res) => {
  const { task } = req.body;
  const db = readDb();
  const index = db.tasks.findIndex((t: any) => t.id === task.id);
  if (index > -1) {
    db.tasks[index] = { ...db.tasks[index], ...task };
    writeDb(db);
    return res.json({ success: true, task: db.tasks[index] });
  }
  res.status(404).json({ error: "Task not found." });
});

// Create new task
app.post('/api/tasks/create', (req, res) => {
  const { task } = req.body;
  const db = readDb();
  const newTask = {
    ...task,
    id: `task-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    subtasks: task.subtasks || [],
    comments: task.comments || [],
    actualHours: 0
  };
  db.tasks.unshift(newTask);
  writeDb(db);
  res.json({ success: true, task: newTask });
});

// Delete task (Strict Rule: Admin/Partner only)
app.delete('/api/tasks/:id', (req, res) => {
  const { userId } = req.query;
  const db = readDb();
  const requester = db.users.find((u: any) => u.id === userId);
  if (!requester || requester.id !== "2") {
    return res.status(403).json({ error: "Access denied. Only Admin (Sarosh Sultan) holds permissions to delete records." });
  }
  db.tasks = db.tasks.filter((t: any) => t.id !== req.params.id);
  writeDb(db);
  res.json({ success: true });
});

// Create Case
app.post('/api/cases/create', (req, res) => {
  const { caseData } = req.body;
  const db = readDb();
  const newCase = {
    ...caseData,
    id: `case-${Date.now()}`,
    unpaidFees: caseData.estimatedFees,
    timeline: [
      { id: `evt-${Date.now()}`, date: new Date().toISOString().split('T')[0], title: "Case Intake", description: `Authorized case starting file registration under legal brief context.`, performedBy: "Sarosh Sultan", type: "status" }
    ],
    documents: []
  };
  db.cases.unshift(newCase);
  writeDb(db);
  res.json({ success: true, caseRecord: newCase });
});

// Add Case Event Timeline
app.post('/api/cases/:id/timeline', (req, res) => {
  const { event } = req.body;
  const db = readDb();
  const activeCase = db.cases.find((c: any) => c.id === req.params.id);
  if (activeCase) {
    const newEvt = {
      ...event,
      id: `evt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    activeCase.timeline.unshift(newEvt);
    writeDb(db);
    return res.json({ success: true, caseRecord: activeCase });
  }
  res.status(404).json({ error: "Case not found" });
});

// Upload Case Document Mock
app.post('/api/cases/:id/documents', (req, res) => {
  const { doc } = req.body;
  const db = readDb();
  const activeCase = db.cases.find((c: any) => c.id === req.params.id);
  if (activeCase) {
    const newDoc = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedAt: new Date().toISOString().split('T')[0],
      version: 1,
      versions: []
    };
    activeCase.documents.unshift(newDoc);
    // Auto add timeline
    activeCase.timeline.unshift({
      id: `evt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: "Document Uploaded",
      description: `Document "${newDoc.name}" was uploaded to repository under directory classification.`,
      performedBy: doc.uploadedBy || "System Operator",
      type: "document"
    });
    writeDb(db);
    return res.json({ success: true, caseRecord: activeCase });
  }
  res.status(404).json({ error: "Case not found" });
});

// Update case status
app.post('/api/cases/:id/status', (req, res) => {
  const { status, remarks, user } = req.body;
  const db = readDb();
  const activeCase = db.cases.find((c: any) => c.id === req.params.id);
  if (activeCase) {
    activeCase.status = status;
    activeCase.timeline.unshift({
      id: `evt-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      title: `Status Changed to ${status}`,
      description: remarks || `Moved case stage container to ${status}.`,
      performedBy: user || "Partner",
      type: "status"
    });
    writeDb(db);
    return res.json({ success: true, caseRecord: activeCase });
  }
  res.status(404).json({ error: "Case not found" });
});

// Update pipeline Lead
app.post('/api/leads/update-status', (req, res) => {
  const { leadId, status } = req.body;
  const db = readDb();
  const leadIdx = db.leads.findIndex((l: any) => l.id === leadId);
  if (leadIdx > -1) {
    db.leads[leadIdx].status = status;
    writeDb(db);
    return res.json({ success: true, lead: db.leads[leadIdx] });
  }
  res.status(404).json({ error: "Lead not found" });
});

// Create Lead
app.post('/api/leads/create', (req, res) => {
  const { lead } = req.body;
  const db = readDb();
  const newLead = {
    ...lead,
    id: `lead-${Date.now()}`,
    createdAt: new Date().toISOString().split('T')[0],
    score: Math.floor(Math.random() * 40) + 60 // Generated score 60-100
  };
  db.leads.unshift(newLead);
  writeDb(db);
  res.json({ success: true, lead: newLead });
});

// Attendance Punch Clock
app.post('/api/attendance/checkin', (req, res) => {
  const { userId, userName, latitude, longitude, lateReasoning } = req.body;
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Exclude duplicate punches
  const exists = db.attendance.find((a: any) => a.userId === userId && a.date === todayStr);
  if (exists) {
    return res.status(400).json({ error: "Attendance already logged for today." });
  }

  // Grace Period Verification (10:30 AM is baseline reporting)
  // Simple comparison check
  const now = new Date();
  const reportingLimit = new Date();
  reportingLimit.setHours(10, 45, 0); // 10:30 AM + 15 min grace period
  
  let status: "Present" | "Late" = "Present";
  if (now > reportingLimit) {
    status = "Late";
  }

  const newPunch = {
    id: `att-${Date.now()}`,
    userId,
    userName,
    date: todayStr,
    checkInTime: currentTime,
    checkOutTime: "",
    status,
    latitude,
    longitude,
    lateReasoning: status === "Late" ? lateReasoning || "Late arrival justification required." : "",
    geofencePassed: latitude && longitude ? true : false
  };

  db.attendance.unshift(newPunch);
  writeDb(db);
  res.json({ success: true, attendance: newPunch });
});

// Clock out
app.post('/api/attendance/checkout', (req, res) => {
  const { userId } = req.body;
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const item = db.attendance.find((a: any) => a.userId === userId && a.date === todayStr);
  if (item) {
    item.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    writeDb(db);
    return res.json({ success: true, attendance: item });
  }
  res.status(404).json({ error: "Clock-in record not registered for today." });
});

// HR Manual register attendance (e.g. Hamid registers Zeeshan, Shiraz, etc.)
app.post('/api/attendance/manual', (req, res) => {
  const { userId, userName, status, date } = req.body;
  const db = readDb();
  const newRecord = {
    id: `att-${Date.now()}`,
    userId,
    userName,
    date,
    checkInTime: "10:30 AM",
    checkOutTime: "06:00 PM",
    status,
    geofencePassed: true
  };
  db.attendance.unshift(newRecord);
  writeDb(db);
  res.json({ success: true, attendance: newRecord });
});

// Leave Request Create
app.post('/api/leaves/request', (req, res) => {
  const { userId, userName, leaveType, startDate, endDate, reason } = req.body;
  const db = readDb();
  const newReq = {
    id: `lr-${Date.now()}`,
    userId,
    userName,
    leaveType,
    startDate,
    endDate,
    status: "Pending",
    reason,
    approvedBy: ""
  };
  db.leaveRequests.unshift(newReq);
  writeDb(db);
  res.json({ success: true, request: newReq });
});

// Leave Decided
app.post('/api/leaves/decide', (req, res) => {
  const { requestId, status, approverName } = req.body;
  const db = readDb();
  const requestItem = db.leaveRequests.find((r: any) => r.id === requestId);
  if (requestItem) {
    requestItem.status = status;
    requestItem.approvedBy = approverName;
    writeDb(db);
    return res.json({ success: true, request: requestItem });
  }
  res.status(404).json({ error: "Leave request not found." });
});

// Expense tracking logged by Hamid
app.post('/api/expenses/create', (req, res) => {
  const { expense } = req.body;
  const db = readDb();
  const newExp = {
    ...expense,
    id: `exp-${Date.now()}`,
    date: new Date().toISOString().split('T')[0]
  };
  db.expenses.unshift(newExp);
  // Auto deduct from petty cash storage if categories matches petty cash
  if (expense.category === "Petty Cash" || expense.amount <= 15000) {
    db.pettyCash = Math.max(0, db.pettyCash - expense.amount);
  }
  writeDb(db);
  res.json({ success: true, expense: newExp, pettyCash: db.pettyCash });
});

// Invoice create
app.post('/api/invoices/create', (req, res) => {
  const { invoice } = req.body;
  const db = readDb();
  // Get linked metrics
  const activeCase = db.cases.find((c: any) => c.id === invoice.caseId);
  const newInvoice = {
    ...invoice,
    id: `inv-${Date.now()}`,
    invoiceNumber: `INV-2026-00${db.invoices.length + 1}`,
    createdAt: new Date().toISOString().split('T')[0],
    items: invoice.items || [{ description: invoice.caseTitle, quantity: 1, rate: invoice.amount, amount: invoice.amount }]
  };
  db.invoices.unshift(newInvoice);
  writeDb(db);
  res.json({ success: true, invoice: newInvoice });
});

// Update Invoice status (Paid etc)
app.post('/api/invoices/pay', (req, res) => {
  const { invoiceId, status } = req.body;
  const db = readDb();
  const invoice = db.invoices.find((i: any) => i.id === invoiceId);
  if (invoice) {
    invoice.status = status;
    // Deduct unpaid fees in client parameters
    const activeCase = db.cases.find((c: any) => c.id === invoice.caseId);
    if (activeCase && status === "Paid") {
      activeCase.unpaidFees = Math.max(0, activeCase.unpaidFees - invoice.amount);
    }
    writeDb(db);
    return res.json({ success: true, invoice });
  }
  res.status(404).json({ error: "Invoice not found" });
});

// Send Chat Message
app.post('/api/messages/send', (req, res) => {
  const { chatId, senderId, senderName, text, type, fileName } = req.body;
  const db = readDb();
  const newMsg = {
    id: `msg-${Date.now()}`,
    chatId,
    senderId,
    senderName,
    text,
    timestamp: new Date().toISOString(),
    type: type || "text",
    status: "sent",
    fileName
  };
  
  db.messages.push(newMsg);

  // Update chat summary
  const chatItem = db.chats.find((c: any) => c.id === chatId);
  if (chatItem) {
    chatItem.lastMessageText = text;
    chatItem.lastMessageTime = newMsg.timestamp;
  }
  
  writeDb(db);
  res.json({ success: true, message: newMsg });
});

// ==========================================
// GEMINI INTELLIGENT ROUTING & AUTOMATION
// ==========================================

// Chat assistant AI endpoint
app.post('/api/ai/chat', async (req, res) => {
  const { message, history, context } = req.body;
  if (!ai) {
    // Fallback static prompt
    return res.json({
      reply: `[System Note: AI is running in dry mode because no API Key was supplied. This is the simulated LegalOps Smart Response.]\n\nI have evaluated your request regarding "${message}". Based on our firm's ongoing corporate portfolio:
- **Case Status**: Habib Bank Limited vs. Securities Exchange (Docket #case-101) is active with pending hearings.
- **Action Recommendation**: Advise Muzammil to draft preliminary filing replication details for SECP as soon as possible.
Please register an active API key under Studio panel variables to unleash dynamic on-demand Gemini computations.`
    });
  }

  try {
    const chatInstance = ai.chats.create({
      model: "gemini-3.5-flash",
      config: {
        systemInstruction: "You are the primary legal advisor and central intelligence engine of LegalOps Pro. You speak eloquently, with concise and high-precision outputs. You analyze corporate files, tasks, workflows, and Pakistani tax framework codes (e.g., FBR, SECP) with professional competence."
      }
    });

    const contextPrompt = `
Current Active Firm Dashboard Data Outline:
${JSON.stringify(context || {})}

User Inquiry: ${message}
Provide a helpful, precise reply summarizing necessary indicators or plans. Include structured Markdown layout.
`;

    const result = await chatInstance.sendMessage({
      message: contextPrompt
    });
    res.json({ reply: result.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Case Draft Creator
app.post('/api/ai/draft', async (req, res) => {
  const { caseTitle, caseType, templateType, userInputs } = req.body;
  if (!ai) {
    return res.json({
      draft: `BETWEEN:
The Petitioner (representing ${userInputs?.clientName || 'Subject Client'})
AND:
The Federal Board of Revenue / Securities and Exchange Commissioner

WHEREAS the Petitioner is aggrieved by the unjustified compliance notice concerning statutory schedules and wishes to move this petition for review.

1. That the Petitioner is a law-abiding corporate entity incorporated under relevant laws.
2. That the opposing commissioner miscalculated Section parameters without hearing representation.

PRAYER:
Hence, it is requested that court suspends the enforcement of penalty and allow complete tax reconciliation audits.`
    });
  }

  try {
    const prompt = `
Create a professional Pakistani corporate legal draft.
Case Title: ${caseTitle}
Department Type: ${caseType}
Matter Template Context: ${templateType}
Custom Fields: ${JSON.stringify(userInputs || {})}

Include appropriate preamble headers, legal grounds arguments with Section parameters, and a structured prayer statement suited for Pakistani courts (High Court, SECP appellate, Inland Revenue, etc.). Use high professional standard. No placeholding notations.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ draft: result.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Case Timeline & Brief Summarizer
app.post('/api/ai/summary', async (req, res) => {
  const { caseId } = req.body;
  const db = readDb();
  const targetCase = db.cases.find((c: any) => c.id === caseId);
  if (!targetCase) {
    return res.status(404).json({ error: "Case file not found" });
  }

  if (!ai) {
    return res.json({
      summary: `**Habib Bank SECP dispute Summary Overview:**
- **Primary Issue**: The petitioner Habib Bank appeals a compliance notice under SECP Section 43 regarding statutory stakeholder descriptions.
- **Risk Indicator**: Critical priority. Hearing is scheduled, and outstanding client retainer is PKR 200,000.
- **Action plan**: Deploy Muzammil with administrative backing for immediate filing review on High Court registry.`
    });
  }

  try {
    const prompt = `
Summarize the following legal matter context with tactical recommendations:
${JSON.stringify(targetCase)}

Give the answer in three clear Markdown bullet divisions:
1. **Critical Legal Issue & Background**
2. **Key Arguments or Risk Score Indicators**
3. **Assigned Team Next-Step Task Allocations**
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ summary: result.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// AI Predictive Briefings & heatmaps on dashboard
app.get('/api/ai/predictive-brief', async (req, res) => {
  const db = readDb();
  const summaryContext = {
    pendingTasksCount: db.tasks.filter((t: any) => t.status !== "Done").length,
    criticalTasks: db.tasks.filter((t: any) => t.priority === "Critical" && t.status !== "Done"),
    attendancePercent: Math.floor((db.attendance.filter((a: any) => a.status === "Present" || a.status === "Late").length / (db.users.length * 2 || 1)) * 100) || 78,
    activeCases: db.cases.length,
    totalReceivables: db.invoices.reduce((acc: number, i: any) => i.status !== "Paid" ? acc + i.amount : acc, 0),
    activeLeads: db.leads.filter((l: any) => l.status !== "Won" && l.status !== "Lost").length
  };

  if (!ai) {
    return res.json({
      brief: `**Smart System Insights Briefing:**
- **Operations Alert**: 3 high priority tasks remain pending for operational units. Ahmed and Waleed must check staff allocations.
- **FBR/Sales Tax Trend**: Leads collection from WhatsApp streams rose 15% this week.
- **Financial Status**: Cumulative receivables amount to PKR ${summaryContext.totalReceivables}. Hamid should generate collection prompt notices via WhatsApp template today.`
    });
  }

  try {
    const prompt = `
Generate a quick, executive 3-bullet AI briefing based on these active firm metrics:
${JSON.stringify(summaryContext)}

Include anomalous workload alerts or team performance insights in a natural language tone.
`;

    const result = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt
    });
    res.json({ brief: result.text });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


async function startServer() {
  // Handle frontend assets and fallback SPA
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve('dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  } else {
    // Setup Vite dynamically as middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  const PORT = 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LegalOps Pro Server operational on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to boot LegalOps server:", err);
});
