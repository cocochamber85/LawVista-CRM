import React, { useState, useEffect } from 'react';
import {
  Shield,
  Briefcase,
  Users,
  CheckSquare,
  Clock,
  MessageSquare,
  DollarSign,
  BarChart3,
  Sparkles,
  Search,
  Plus,
  Send,
  UserCheck,
  Calendar,
  Layers,
  ChevronRight,
  TrendingUp,
  MapPin,
  Trash2,
  FileText,
  AlertCircle,
  FileSpreadsheet,
  Settings,
  Menu,
  X,
  Eye,
  CheckCircle2,
  Paperclip,
  Share2,
  Database,
  Upload
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  role: string;
  level: number;
  department: string;
  email: string;
  phone: string;
  baseSalary: number;
  active: boolean;
}

interface Case {
  id: string;
  title: string;
  clientName: string;
  clientType: string;
  caseType: string;
  priority: string;
  status: string;
  opposingParty: string;
  courtName: string;
  judgeName?: string;
  filingDate: string;
  assignedTo: string[];
  estimatedFees: number;
  unpaidFees: number;
  description: string;
  timeline: { id: string; date: string; title: string; description: string; performedBy: string; type: string }[];
  documents: { id: string; name: string; category: string; uploadedBy: string; uploadedAt: string; fileSize: string; version: number }[];
}

interface Lead {
  id: string;
  name: string;
  company?: string;
  phone: string;
  email: string;
  source: string;
  status: string;
  priority: string;
  assignedTo: string;
  notes: string;
  createdAt: string;
  score?: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  assignedTo: string;
  assignedBy: string;
  department: string;
  priority: string;
  status: string;
  dueDate: string;
  estimatedHours: number;
  actualHours: number;
  subtasks: { id: string; title: string; completed: boolean }[];
  comments: { id: string; userId: string; userName: string; text: string; createdAt: string }[];
  createdAt: string;
}

interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  status: string;
  latitude?: number;
  longitude?: number;
  lateReasoning?: string;
  geofencePassed: boolean;
}

interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: string;
  reason: string;
  approvedBy?: string;
}

interface Chat {
  id: string;
  name: string;
  isGroup: boolean;
  participants: string[];
  isExternalWhatsApp?: boolean;
  lastMessageText?: string;
  lastMessageTime?: string;
  unreadCount: number;
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  type: string;
  status: string;
  fileName?: string;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  caseId: string;
  caseTitle: string;
  clientName: string;
  amount: number;
  status: string;
  dueDate: string;
  createdAt: string;
  items: { description: string; quantity: number; rate: number; amount: number }[];
}

interface Expense {
  id: string;
  description: string;
  category: string;
  amount: number;
  recordedBy: string;
  date: string;
  isReimbursable: boolean;
}

export default function App() {
  // Authentication & Downward RBAC Persona context switcher
  const [activeUserId, setActiveUserId] = useState<string>("2"); // Defaults to Sarosh Sultan (Admin Partner)
  const [dbState, setDbState] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [loading, setLoading] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // AI & Assistant State
  const [aiBriefing, setAiBriefing] = useState<string>("");
  const [briefingLoading, setBriefingLoading] = useState<boolean>(false);
  const [chatInput, setChatInput] = useState<string>("");
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'assistant', text: string }[]>([]);
  const [aiThinking, setAiThinking] = useState<boolean>(false);

  // Form modals state
  const [activeModal, setActiveModal] = useState<string | null>(null);
  
  // Specific view detailers
  const [selectedCaseId, setSelectedCaseId] = useState<string>("case-101");
  const [selectedChatId, setSelectedChatId] = useState<string>("chat-global");
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [leadHistorySearch, setLeadHistorySearch] = useState<string>("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState<any>({
    name: "", role: "STAFF", level: 4, department: "Drafting Department", email: "", phone: "", baseSalary: 55000, clientId: "", password: ""
  });

  // Client ID and Password User login credentials validation parameters
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true); // Logged in by default for preview, can be toggled or signed out for strict validation
  const [authLockMode, setAuthLockMode] = useState<boolean>(false);       // Strict mode requiring passwords to alter roles
  const [loginUsername, setLoginUsername] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");
  const [loginError, setLoginError] = useState<string>("");
  const [isCsvImporting, setIsCsvImporting] = useState<boolean>(false);
  const [dragActive, setDragActive] = useState<boolean>(false);

  // Form input field configurations
  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: "", description: "", assignedTo: "10", priority: "Medium", status: "To Do", dueDate: "2026-06-15", estimatedHours: 6
  });
  const [newCase, setNewCase] = useState<Partial<Case>>({
    title: "", clientName: "", clientType: "Corporate", caseType: "Contracts", priority: "Medium", estimatedFees: 200000, courtName: "District Court Karachi", opposingParty: ""
  });
  const [newLead, setNewLead] = useState<Partial<Lead>>({
    name: "", company: "", phone: "", email: "", source: "Website", priority: "Medium", notes: ""
  });
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    description: "", category: "Office Supplies", amount: 1500, isReimbursable: false
  });
  const [newInvoice, setNewInvoice] = useState<Partial<Invoice>>({
    caseId: "case-101", amount: 100000, dueDate: "2026-06-30"
  });

  // GPS Attendance parameters
  const [gpsLatitude, setGpsLatitude] = useState<number | null>(null);
  const [gpsLongitude, setGpsLongitude] = useState<number | null>(null);
  const [lateExplanation, setLateExplanation] = useState<string>("");
  const [gpsSupported, setGpsSupported] = useState<boolean>(false);
  const [checkinSuccessMsg, setCheckinSuccessMsg] = useState<string>("");

  // AI legal drafts helper state
  const [draftResult, setDraftResult] = useState<string>("");
  const [draftingType, setDraftingType] = useState<string>("Appeal Groundings");
  const [draftingClientName, setDraftingClientName] = useState<string>("Habib Bank Limited");
  const [draftLoading, setDraftLoading] = useState<boolean>(false);

  // Custom BI Report Builder state
  const [customReport, setCustomReport] = useState<any>({
    title: "KPI Profitability Ratios Scorecard",
    visualizationType: "Table",
    metric: "Revenue Sum",
    groupBy: "priority",
    isScheduled: true,
    scheduleFrequency: "Weekly"
  });
  const [biReportOutput, setBiReportOutput] = useState<any>(null);

  // General state triggers
  const [commentText, setCommentText] = useState("");
  const [chatMessageText, setChatMessageText] = useState("");
  const [documentUploadName, setDocumentUploadName] = useState("");
  const [statusUpdateVal, setStatusUpdateVal] = useState("Active");
  const [statusUpdateRemarks, setStatusUpdateRemarks] = useState("");

  // =======================================================
  // PREMIUM SOCIAL MEDIA, WHATSAPP & WORKFLOW AUTOMATION STATES
  // =======================================================
  const [activeSocialPostId, setActiveSocialPostId] = useState<string | null>(null);
  const [socialTopicPrompt, setSocialTopicPrompt] = useState<string>("Pakistan SECP Company Incorporation rules");
  const [socialThemeMode, setSocialThemeMode] = useState<string>("Elegant Slate");
  const [socialPromptLoading, setSocialPromptLoading] = useState<boolean>(false);
  const [newPostData, setNewPostData] = useState<any>({
    title: "",
    caption: "",
    platforms: ["Facebook"],
    status: "Draft",
    scheduledTime: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16),
    image: "",
    designConfig: {
      theme: "Elegant Slate",
      textColor: "#E2E8F0",
      bgColor: "#1E293B",
      heading: "HEADING",
      subheading: "Subheading",
      tagline: "TAGLINE"
    }
  });

  const [waLinkRequestPhone, setWaLinkRequestPhone] = useState<string>("+92 300 1234567");
  const [waSessionLoading, setWaSessionLoading] = useState<boolean>(false);
  const [selectedWaFilter, setSelectedWaFilter] = useState<string>("all"); // "all" | "internal" | "whatsapp"
  const [isWaSettingsOpen, setIsWaSettingsOpen] = useState<boolean>(false);

  const [activeWorkflowId, setActiveWorkflowId] = useState<string | null>(null);
  const [workflowRuleForm, setWorkflowRuleForm] = useState<any>({
    name: "New Lead Multi-Channel Dispatcher",
    trigger: "On Lead Capture (CRM)",
    action: "Trigger Custom WhatsApp Introductory Dossier",
    target: "Areesha",
    active: true,
    description: "Instantly draft and dispatch introduction brochures directly back to the matching prospect's phone."
  });
  const [testingWfId, setTestingWfId] = useState<string | null>(null);

  const handleSaveSocialPost = async (post: any) => {
    if (isOfflineMode) {
      const updatedSocial = [...(dbState?.socialPosts || [])];
      const idx = updatedSocial.findIndex(p => p.id === post.id);
      const savedPost = { ...post, id: post.id || `post-${Date.now()}` };
      if (idx > -1) {
        updatedSocial[idx] = savedPost;
      } else {
        updatedSocial.unshift(savedPost);
      }
      const nextState = { ...dbState, socialPosts: updatedSocial };
      setDbState(nextState);
      localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      return;
    }
    try {
      const res = await fetch('/api/social-posts/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const updatedSocial = [...(dbState?.socialPosts || [])];
        const idx = updatedSocial.findIndex(p => p.id === post.id);
        const savedPost = { ...post, id: post.id || `post-${Date.now()}` };
        if (idx > -1) {
          updatedSocial[idx] = savedPost;
        } else {
          updatedSocial.unshift(savedPost);
        }
        const nextState = { ...dbState, socialPosts: updatedSocial };
        setDbState(nextState);
        localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      }
    } catch (_) {}
  };

  const handleDeleteSocialPost = async (postId: string) => {
    if (isOfflineMode) {
      const updated = (dbState?.socialPosts || []).filter((p: any) => p.id !== postId);
      const nextState = { ...dbState, socialPosts: updated };
      setDbState(nextState);
      localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      return;
    }
    try {
      const res = await fetch('/api/social-posts/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: postId })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const updated = (dbState?.socialPosts || []).filter((p: any) => p.id !== postId);
        const nextState = { ...dbState, socialPosts: updated };
        setDbState(nextState);
        localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      }
    } catch (_) {}
  };

  const handleGenerateAiPost = async () => {
    setSocialPromptLoading(true);
    if (isOfflineMode) {
      setTimeout(() => {
        setNewPostData({
          title: "AI Suggested Draft",
          caption: `⚠️ Statutory Regulation Guide: Essential legal standards for ${socialTopicPrompt}. Mitigate organizational friction through automated legal pipelines.\n\n#Compliance #LegalOpsPro #BusinessPakistan`,
          platforms: ["Facebook", "LinkedIn"],
          status: "Draft",
          scheduledTime: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16),
          image: "",
          designConfig: {
            theme: socialThemeMode || "Elegant Slate",
            textColor: "#E2E8F0",
            bgColor: "#1E293B",
            heading: `${socialTopicPrompt.toUpperCase()} DIGEST`,
            subheading: "Managing Regulatory Directives",
            tagline: "LEGALOPS PRO OPERATIONS GROUP"
          }
        });
        setSocialPromptLoading(false);
      }, 500);
      return;
    }
    try {
      const res = await fetch('/api/ai/suggest-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: socialTopicPrompt, themeMode: socialThemeMode })
      });
      if (res.ok) {
        const item = await res.json();
        setNewPostData({
          title: item.title,
          caption: item.caption,
          platforms: ["Facebook", "LinkedIn"],
          status: "Draft",
          scheduledTime: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16),
          image: "",
          designConfig: item.designConfig
        });
      }
    } catch (_) {
      // Mock Generator fallback
      setNewPostData({
        title: "AI Suggested Draft",
        caption: `⚠️ Statutory Regulation Guide: Essential legal standards for ${socialTopicPrompt}. Mitigate organizational friction through automated legal pipelines.\n\n#Compliance #LegalOpsPro #BusinessPakistan`,
        platforms: ["Facebook", "LinkedIn"],
        status: "Draft",
        scheduledTime: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16),
        image: "",
        designConfig: {
          theme: socialThemeMode || "Elegant Slate",
          textColor: "#E2E8F0",
          bgColor: "#1E293B",
          heading: `${socialTopicPrompt.toUpperCase()} DIGEST`,
          subheading: "Managing Regulatory Directives",
          tagline: "LEGALOPS PRO OPERATIONS GROUP"
        }
      });
    }
    setSocialPromptLoading(false);
  };

  const handleLinkWhatsApp = async (phoneToLink: string) => {
    setWaSessionLoading(true);
    if (isOfflineMode) {
      const mockAcct = {
        id: `wa-${activeUserId}`,
        userId: activeUserId,
        userName: dbState?.users?.find((u: any) => u.id === activeUserId)?.name || "Operational Agent",
        phone: phoneToLink,
        status: "linked",
        deviceInfo: "Meta Multi-Device Server Node / Verified Proxy",
        linkedAt: new Date().toISOString()
      };
      const nextSec = [...(dbState?.whatsappAccounts || [])].filter(w => w.userId !== activeUserId);
      nextSec.push(mockAcct);
      const nextState = { ...dbState, whatsappAccounts: nextSec };
      setDbState(nextState);
      localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      setWaSessionLoading(false);
      setIsWaSettingsOpen(false);
      return;
    }
    try {
      const res = await fetch('/api/whatsapp/link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: activeUserId, phone: phoneToLink })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const mockAcct = {
          id: `wa-${activeUserId}`,
          userId: activeUserId,
          userName: dbState?.users?.find((u: any) => u.id === activeUserId)?.name || "Operational Agent",
          phone: phoneToLink,
          status: "linked",
          deviceInfo: "Meta Multi-Device Server Node / Verified Proxy",
          linkedAt: new Date().toISOString()
        };
        const nextSec = [...(dbState?.whatsappAccounts || [])].filter(w => w.userId !== activeUserId);
        nextSec.push(mockAcct);
        const nextState = { ...dbState, whatsappAccounts: nextSec };
        setDbState(nextState);
        localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      }
    } catch (_) {}
    setWaSessionLoading(false);
    setIsWaSettingsOpen(false);
  };

  const handleUnlinkWhatsApp = async (tgtUserId: string) => {
    if (isOfflineMode) {
      const updated = (dbState?.whatsappAccounts || []).map((w: any) => {
        if (w.userId === tgtUserId) {
          return { ...w, status: "unlinked", linkedAt: "" };
        }
        return w;
      });
      const nextState = { ...dbState, whatsappAccounts: updated };
      setDbState(nextState);
      localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      return;
    }
    try {
      const res = await fetch('/api/whatsapp/unlink', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: tgtUserId })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const updated = (dbState?.whatsappAccounts || []).map((w: any) => {
          if (w.userId === tgtUserId) {
            return { ...w, status: "unlinked", linkedAt: "" };
          }
          return w;
        });
        const nextState = { ...dbState, whatsappAccounts: updated };
        setDbState(nextState);
        localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      }
    } catch (_) {}
  };

  const handleSaveWorkflow = async (wf: any) => {
    if (isOfflineMode) {
      const list = [...(dbState?.workflows || [])];
      const idx = list.findIndex(w => w.id === wf.id);
      const item = { ...wf, id: wf.id || `wf-${Date.now()}` };
      if (idx > -1) {
        list[idx] = item;
      } else {
        list.push(item);
      }
      const nextState = { ...dbState, workflows: list };
      setDbState(nextState);
      localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      setActiveWorkflowId(null);
      return;
    }
    try {
      const res = await fetch('/api/workflows/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflow: wf })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const list = [...(dbState?.workflows || [])];
        const idx = list.findIndex(w => w.id === wf.id);
        const item = { ...wf, id: wf.id || `wf-${Date.now()}` };
        if (idx > -1) {
          list[idx] = item;
        } else {
          list.push(item);
        }
        const nextState = { ...dbState, workflows: list };
        setDbState(nextState);
        localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      }
    } catch (_) {}
    setActiveWorkflowId(null);
  };

  const handleDeleteWorkflow = async (id: string) => {
    if (isOfflineMode) {
      const updated = (dbState?.workflows || []).filter((w: any) => w.id !== id);
      const nextState = { ...dbState, workflows: updated };
      setDbState(nextState);
      localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      return;
    }
    try {
      const res = await fetch('/api/workflows/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const updated = (dbState?.workflows || []).filter((w: any) => w.id !== id);
        const nextState = { ...dbState, workflows: updated };
        setDbState(nextState);
        localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      }
    } catch (_) {}
  };

  const handleTriggerWorkflowTest = async (id: string) => {
    setTestingWfId(id);
    if (isOfflineMode) {
      const wf = dbState?.workflows?.find((w: any) => w.id === id);
      if (wf) {
        const firedLog = {
          id: `log-${Date.now()}`,
          workflowId: id,
          workflowName: wf.name,
          time: new Date().toISOString(),
          details: `Manual test initiated. Trigger [${wf.trigger}] successfully evaluated. Action completed: [${wf.action}] dispatched onto operational team member: ${wf.target}.`
        };
        const logs = [firedLog, ...(dbState?.workflowLogs || [])];
        const nextState = { ...dbState, workflowLogs: logs };
        setDbState(nextState);
        localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
      }
      setTimeout(() => setTestingWfId(null), 1000);
      return;
    }
    try {
      const res = await fetch('/api/workflows/test-trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const wf = dbState?.workflows?.find((w: any) => w.id === id);
        if (wf) {
          const firedLog = {
            id: `log-${Date.now()}`,
            workflowId: id,
            workflowName: wf.name,
            time: new Date().toISOString(),
            details: `Manual test initiated. Trigger [${wf.trigger}] successfully evaluated. Action completed: [${wf.action}] dispatched onto operational team member: ${wf.target}.`
          };
          const logs = [firedLog, ...(dbState?.workflowLogs || [])];
          const nextState = { ...dbState, workflowLogs: logs };
          setDbState(nextState);
          localStorage.setItem("legalops_emulated_db", JSON.stringify(nextState));
        }
      }
    } catch (_) {}
    setTimeout(() => setTestingWfId(null), 1000);
  };

  // Fetch complete database state filtered by RBAC
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const hn = window.location.hostname;
      if (hn.endsWith(".netlify.app") || hn.endsWith(".vercel.app") || hn.endsWith(".github.io") || hn.includes("netlify") || hn.includes("vercel")) {
        return true;
      }
    }
    return false;
  });

  const mutateLocalDb = (updater: (db: any) => any) => {
    let localDbStr = localStorage.getItem("legalops_emulated_db");
    let localDb = localDbStr ? JSON.parse(localDbStr) : null;
    if (localDb) {
      const updated = updater(localDb);
      localStorage.setItem("legalops_emulated_db", JSON.stringify(updated));
    }
  };

  // Fetch complete database state filtered by RBAC
  const fetchDbState = async (userId: string) => {
    setLoading(true);
    try {
      const isStaticDeployment = typeof window !== "undefined" && (() => {
        const hn = window.location.hostname;
        return hn.endsWith(".netlify.app") || hn.endsWith(".vercel.app") || hn.endsWith(".github.io") || hn.includes("netlify") || hn.includes("vercel");
      })();

      if (isOfflineMode || isStaticDeployment) {
        setIsOfflineMode(true);
        throw new Error("Static environment mode active.");
      }

      const res = await fetch(`/api/db-state?userId=${userId}`);
      if (!res.ok) {
        throw new Error("HTTP state error: " + res.status);
      }
      const data = await res.json();
      setDbState(data);
      setIsOfflineMode(false);
    } catch (err) {
      console.warn("Backend API unavailable or CORS issue. Running self-contained local storage DB engine:", err);
      setIsOfflineMode(true);
      let localDbStr = localStorage.getItem("legalops_emulated_db");
      let localDb: any = null;
      if (localDbStr) {
        try {
          localDb = JSON.parse(localDbStr);
        } catch (_) {
          localDb = null;
        }
      }
      if (!localDb) {
        localDb = {
          users: [
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
            { id: "13", name: "Shiraz", role: "NON_SYSTEM", level: 5, department: "Rider & Logistics Services", email: "shiraz@nonuser.com", phone: "+92 345 1111111", reportingTo: "7", baseSalary: 35000, active: true },
            { id: "14", name: "Waseem", role: "NON_SYSTEM", level: 5, department: "Operations Support Staff", email: "waseem@nonuser.com", phone: "+92 345 2222222", reportingTo: "7", baseSalary: 30000, active: true },
            { id: "15", name: "Zeeshan Jr", role: "NON_SYSTEM", level: 5, department: "Operations Support Staff", email: "zeeshanjr@nonuser.com", phone: "+92 345 3333333", reportingTo: "7", baseSalary: 30000, active: true },
            { id: "16", name: "Zeeshan Haider", role: "NON_SYSTEM", level: 5, department: "Operations Support Staff", email: "zeeshandh@nonuser.com", phone: "+92 345 4444444", reportingTo: "7", baseSalary: 30000, active: true }
          ],
          cases: [
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
              assignedTo: ["2", "6"],
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
              assignedTo: ["3", "11"],
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
          ],
          leads: [
            { id: "lead-1", name: "Nadeem Akhtar", company: "Akhtar Cotton Mills", phone: "+92 312 9876543", email: "nadeem@akhtarcotton.pk", source: "WhatsApp", status: "Qualified", priority: "High", assignedTo: "12", notes: "Needs assistance registering a new commercial company and setting up Sales Tax registrations.", createdAt: "2026-06-05", score: 85 },
            { id: "lead-2", name: "Rehana Karim", phone: "+92 311 4567890", email: "rehana.k@gmail.com", source: "Social Media", status: "New", priority: "Medium", assignedTo: "12", notes: "Inquired through Facebook about land litigation appeal process.", createdAt: "2026-06-08", score: 62 },
            { id: "lead-3", name: "Zaheer Abbas", company: "Z-Tech Logistical Solutions", phone: "+92 321 9988776", email: "zaheer@ztech.com", source: "Website", status: "Proposal", priority: "High", assignedTo: "12", notes: "Wants a complete audit of contracts and customer service level agreements.", createdAt: "2026-05-29", score: 91 }
          ],
          tasks: [
            { id: "task-1", title: "Draft Appeal of SECP Disclosures Notice", description: "Review Case #101 documents and prepare a robust appeal grounds draft for High Court filing.", assignedTo: "6", assignedBy: "2", department: "Contracts, Litigation & Admin", priority: "Critical", status: "In Progress", dueDate: "2026-06-12", estimatedHours: 8, actualHours: 2, subtasks: [{ id: "st-1", title: "Extract Section 43 discrepancies", completed: true }, { id: "st-2", title: "Write Case Grounds outline", completed: false }], comments: [], createdAt: "2026-06-08" },
            { id: "task-2", title: "Submit Monthly Sales Tax Returns", description: "Ensure annual audit filing matches monthly withholding reports before portal closing.", assignedTo: "11", assignedBy: "3", department: "Tax Returns Department", priority: "High", status: "To Do", dueDate: "2026-06-15", estimatedHours: 12, actualHours: 0, subtasks: [], comments: [], createdAt: "2026-06-09" },
            { id: "task-3", title: "Prepare Cash Ledger Petty Vouchers", description: "Hamid to organize weekly banking vouchers, cash ledger reconciliations and rider checkups.", assignedTo: "7", assignedBy: "4", department: "Operations, Accounting & HR", priority: "Medium", status: "To Do", dueDate: "2026-06-10", estimatedHours: 4, actualHours: 0, subtasks: [], comments: [], createdAt: "2026-06-09" }
          ],
          attendance: [
            { id: "att-1", userId: "7", userName: "Hamid", date: "2026-06-08", checkInTime: "10:20 AM", checkOutTime: "06:15 PM", status: "Present", geofencePassed: true },
            { id: "att-2", userId: "10", userName: "Asad", date: "2026-06-08", checkInTime: "10:28 AM", checkOutTime: "06:00 PM", status: "Present", geofencePassed: true },
            { id: "att-3", userId: "12", userName: "Areesha", date: "2026-06-08", checkInTime: "10:52 AM", checkOutTime: "06:05 PM", status: "Late", lateReasoning: "Traffic delay on Shahrah-e-Faisal", geofencePassed: true },
            { id: "att-4", userId: "13", userName: "Shiraz", date: "2026-06-08", checkInTime: "10:30 AM", checkOutTime: "06:30 PM", status: "Present", geofencePassed: false }
          ],
          leaveRequests: [
            { id: "lr-1", userId: "10", userName: "Asad", leaveType: "Sick", startDate: "2026-06-11", endDate: "2026-06-11", status: "Pending", reason: "Slight dental procedure discomfort.", approvedBy: "" }
          ],
          payroll: [
            { id: "pay-1", userId: "10", userName: "Asad", salaryMonth: "May 2026", basicSalary: 60000, allowances: 5000, deductions: 2000, netPaid: 63000, status: "Paid" },
            { id: "pay-2", userId: "12", userName: "Areesha", salaryMonth: "May 2026", basicSalary: 55000, allowances: 4000, deductions: 1000, netPaid: 58000, status: "Paid" },
            { id: "pay-3", userId: "13", userName: "Shiraz (Rider)", salaryMonth: "May 2026", basicSalary: 35000, allowances: 8000, deductions: 0, netPaid: 43000, status: "Paid" }
          ],
          invoices: [
            { id: "inv-201", invoiceNumber: "INV-2026-001", caseId: "case-101", caseTitle: "Habib Bank Limited vs. Securities Exchange", clientName: "Habib Bank Limited", amount: 250000, status: "Partial", dueDate: "2026-06-20", createdAt: "2026-05-15", items: [{ description: "Initial Brief Filing & SECP documentation prep", quantity: 1, rate: 250000, amount: 250000 }] },
            { id: "inv-202", invoiceNumber: "INV-2026-002", caseId: "case-102", caseTitle: "Al-Hamd Rice Mills Withholding Exemption", clientName: "Al-Hamd Rice Mills Ltd", amount: 200000, status: "Paid", dueDate: "2026-06-10", createdAt: "2026-05-10", items: [{ description: "FBR exemption log representations", quantity: 1, rate: 200000, amount: 200000 }] }
          ],
          expenses: [
            { id: "exp-301", description: "Rider dispatch high court courier fuel reimbursement", category: "Travel / Rider Fuel", amount: 4500, recordedBy: "7", date: "2026-06-08", isReimbursable: true },
            { id: "exp-302", description: "Weekly high-speed photocopy papers & stationary bundle", category: "Office Supplies", amount: 12000, recordedBy: "7", date: "2026-06-07", isReimbursable: false }
          ],
          chats: [
            { id: "chat-global", name: "Firm-Wide Announcements", isGroup: true, participants: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"], unreadCount: 0, lastMessageText: "Welcome to LegalOps Pro ERP platform!", lastMessageTime: "2026-06-09T10:00:00Z" },
            { id: "chat-ops", name: "Operations & Administration Group", isGroup: true, participants: ["2", "4", "7", "12"], unreadCount: 0, lastMessageText: "Hamid, please update Shiraz's logistics dispatch list today.", lastMessageTime: "2026-06-09T11:00:00Z" },
            { id: "chat-wa-ext-1", name: "+92 312 9876543 (Nadeem Akhtar)", isGroup: false, participants: ["2", "12"], isExternalWhatsApp: true, unreadCount: 2, lastMessageText: "Please send the agreement proposal by today.", lastMessageTime: "2026-06-09T09:30:00Z" }
          ],
          messages: [
            { id: "msg-1", chatId: "chat-global", senderId: "2", senderName: "Sarosh Sultan", text: "Welcome to LegalOps Pro ERP platform everyone! Let's ensure high-density communication here.", timestamp: "2026-06-09T09:15:00Z", type: "text", status: "read" },
            { id: "msg-2", chatId: "chat-ops", senderId: "4", senderName: "Asif Yousuf", text: "Hamid, please update Shiraz's logistics dispatch list today.", timestamp: "2026-06-09T11:00:00Z", type: "text", status: "read" },
            { id: "msg-3", chatId: "chat-wa-ext-1", senderId: "client", senderName: "Nadeem Akhtar (FBR Lead)", text: "Salam, I've received your business profile brochure. Can we proceed with company registration details?", timestamp: "2026-06-09T09:20:00Z", type: "text", status: "delivered" },
            { id: "msg-4", chatId: "chat-wa-ext-1", senderId: "client", senderName: "Nadeem Akhtar (FBR Lead)", text: "Please send the agreement proposal by today.", timestamp: "2026-06-09T09:30:00Z", type: "text", status: "delivered" }
          ],
          reports: [
            { id: "rep-1", title: "Daily Task Resource Load Analysis", visualizationType: "Bar Chart", metric: "Tasks Count", groupBy: "priority", filters: [], isScheduled: true, scheduleFrequency: "Daily" },
            { id: "rep-2", title: "Monthly Firm Revenue & Collection Efficiency Status", visualizationType: "KPI Card", metric: "Revenue Sum", groupBy: "status", filters: [], isScheduled: true, scheduleFrequency: "Monthly" }
          ],
          pettyCash: 45000
        };
        localStorage.setItem("legalops_emulated_db", JSON.stringify(localDb));
      }

      // Emulate RBAC filtering client-side
      const current = localDb.users.find((u: any) => u.id === userId);
      const filtered = { ...localDb };
      if (current && current.role === "CLIENT") {
        const clientsCases = (localDb.cases || []).filter((c: any) => 
          c.clientName?.toLowerCase() === current.name?.toLowerCase() || 
          c.id === current.assignedCaseId
        );
        const clientsCaseIds = clientsCases.map((c: any) => c.id);
        filtered.cases = clientsCases;
        filtered.invoices = (localDb.invoices || []).filter((i: any) => i.caseId && clientsCaseIds.includes(i.caseId));
        filtered.tasks = [];
        filtered.leads = [];
        filtered.payroll = [];
        filtered.expenses = [];
        filtered.attendance = [];
        filtered.leaveRequests = [];
        filtered.chats = [];
        filtered.messages = [];
        filtered.reports = [];
        filtered.pettyCash = 0;
      } else if (current && current.level > 2 && current.role !== "PARTNER") {
        const userLevel = current.level;
        const userDept = current.department;
        filtered.tasks = localDb.tasks.filter((t: any) => {
          const isSelf = t.assignedTo === userId || t.assignedBy === userId;
          const assigneeObj = localDb.users.find((u: any) => u.id === t.assignedTo);
          const isSubordinate = assigneeObj && assigneeObj.reportingTo === userId;
          const isSameDeptSenior = userLevel === 3 && t.department === userDept;
          return isSelf || isSubordinate || isSameDeptSenior;
        });
        filtered.cases = localDb.cases.filter((c: any) => {
          const hasAssignment = c.assignedTo.includes(userId);
          const isDeptManaged = current.level <= 3 && c.caseType && (
            (current.id === "7" && ["SECP", "Withholding"].includes(c.caseType)) ||
            (current.id === "8" && ["Contracts", "Litigation", "Appeals"].includes(c.caseType)) ||
            (current.id === "9" && ["Tax & Audit"].includes(c.caseType))
          );
          return hasAssignment || isDeptManaged;
        });
        filtered.leads = localDb.leads.filter((l: any) => {
          return l.assignedTo === userId || current.id === "7";
        });
      }

      setDbState({
        roleSelf: localDb.users.find((u: any) => u.id === userId),
        allUsers: localDb.users,
        users: localDb.users,
        cases: filtered.cases || [],
        leads: filtered.leads || [],
        tasks: filtered.tasks || [],
        chats: filtered.chats || [],
        messages: filtered.messages || [],
        attendance: filtered.attendance || localDb.attendance || [],
        leaveRequests: filtered.leaveRequests || localDb.leaveRequests || [],
        payroll: filtered.payroll || localDb.payroll || [],
        invoices: filtered.invoices || localDb.invoices || [],
        expenses: filtered.expenses || localDb.expenses || [],
        reports: filtered.reports || localDb.reports || [],
        pettyCash: filtered.pettyCash !== undefined ? filtered.pettyCash : (localDb.pettyCash || 0)
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI daily Briefing on load
  const loadAiBriefing = async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch('/api/ai/predictive-brief');
      if (!res.ok) {
        throw new Error("HTTP error: " + res.status);
      }
      const data = await res.json();
      setAiBriefing(data.brief);
    } catch (err) {
      setAiBriefing("Secure AI Sandbox: Daily Operational Brief — Sultan Ahmed Khan is active. Attendance rates are at 94% today. Abdul Qadir has completed all assigned Tax Return procedures on time! Muzammil's SECP Court Appeal is highlighted for action tomorrow.");
    } finally {
      setBriefingLoading(false);
    }
  };

  useEffect(() => {
    fetchDbState(activeUserId);
  }, [activeUserId]);

  useEffect(() => {
    loadAiBriefing();
    // Verify GPS Availability
    if (navigator.geolocation) {
      setGpsSupported(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        setGpsLatitude(pos.coords.latitude);
        setGpsLongitude(pos.coords.longitude);
      });
    }
  }, []);

  const [pendingSwitchUserId, setPendingSwitchUserId] = useState<string | null>(null);

  const handleRoleChange = (userId: string) => {
    if (authLockMode) {
      const selectedUser = (dbState?.allUsers || []).find((u: any) => u.id === userId);
      if (selectedUser) {
        setLoginUsername(selectedUser.clientId || selectedUser.email || "");
        setLoginPassword("");
        setLoginError("");
        setPendingSwitchUserId(userId);
        setIsAuthenticated(false);
      }
    } else {
      setActiveUserId(userId);
      setMobileMenuOpen(false);
    }
  };

  // Rest API Actions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const taskDetails = {
      ...newTask,
      assignedBy: activeUserId,
      department: dbState.allUsers.find((u: any) => u.id === newTask.assignedTo)?.department || "Executive Office"
    };

    if (isOfflineMode) {
      mutateLocalDb((db) => {
        db.tasks.unshift({
          ...taskDetails,
          id: `task-${Date.now()}`,
          createdAt: new Date().toISOString().split('T')[0],
          subtasks: [],
          comments: [],
          actualHours: 0
        });
        return db;
      });
      await fetchDbState(activeUserId);
      setActiveModal(null);
      setNewTask({ title: "", description: "", assignedTo: "10", priority: "Medium", status: "To Do", dueDate: "2026-06-15", estimatedHours: 6 });
      return;
    }

    try {
      const payload = { task: taskDetails };
      const res = await fetch('/api/tasks/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        setActiveModal(null);
        setNewTask({ title: "", description: "", assignedTo: "10", priority: "Medium", status: "To Do", dueDate: "2026-06-15", estimatedHours: 6 });
      }
    } catch (err) {
      alert("Error building task.");
    }
  };

  const handleUpdateTaskStatus = async (taskId: string, status: string) => {
    if (isOfflineMode) {
      mutateLocalDb((db) => {
        const index = db.tasks.findIndex((t: any) => t.id === taskId);
        if (index > -1) {
          db.tasks[index].status = status;
        }
        return db;
      });
      await fetchDbState(activeUserId);
      return;
    }

    try {
      const targetTask = dbState.tasks.find((t: any) => t.id === taskId);
      if (!targetTask) return;
      const res = await fetch('/api/tasks/update', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: { ...targetTask, status } })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const confirmation = window.confirm("Are you sure you want to permanently delete this task record? This is an irreversible operation.");
    if (!confirmation) return;

    if (isOfflineMode) {
      mutateLocalDb((db) => {
        db.tasks = db.tasks.filter((t: any) => t.id !== taskId);
        return db;
      });
      await fetchDbState(activeUserId);
      return;
    }

    try {
      const res = await fetch(`/api/tasks/${taskId}?userId=${activeUserId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to delete task.");
      }
    } catch (err) {
      alert("Error contacting platform backend.");
    }
  };

  const handleCreateCase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOfflineMode) {
      const cRecord = {
        ...newCase,
        id: `case-${Date.now()}`,
        filingDate: new Date().toISOString().split('T')[0],
        assignedTo: ["2", "6"],
        unpaidFees: newCase.estimatedFees || 200000,
        timeline: [
          { id: `evt-${Date.now()}`, date: new Date().toISOString().split('T')[0], title: "Case Intake", description: `Authorized case starting file registration under legal brief context.`, performedBy: "Sarosh Sultan", type: "status" }
        ],
        documents: []
      };
      mutateLocalDb((db) => {
        db.cases.unshift(cRecord);
        return db;
      });
      setSelectedCaseId(cRecord.id);
      await fetchDbState(activeUserId);
      setActiveModal(null);
      setNewCase({ title: "", clientName: "", clientType: "Corporate", caseType: "Contracts", priority: "Medium", estimatedFees: 200000, courtName: "District Court Karachi", opposingParty: "" });
      return;
    }

    try {
      const res = await fetch('/api/cases/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseData: { ...newCase, filingDate: new Date().toISOString().split('T')[0], assignedTo: ["2", "6"] } })
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedCaseId(data.caseRecord.id);
        await fetchDbState(activeUserId);
        setActiveModal(null);
        setNewCase({ title: "", clientName: "", clientType: "Corporate", caseType: "Contracts", priority: "Medium", estimatedFees: 200000, courtName: "District Court Karachi", opposingParty: "" });
      }
    } catch (err) {
      alert("Error.");
    }
  };

  const handleUploadDocumentMock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!documentUploadName) return;

    if (isOfflineMode) {
      const newDoc = {
        id: `doc-${Date.now()}`,
        name: documentUploadName,
        category: "Evidence",
        uploadedBy: dbState.roleSelf?.name || "System Operator",
        uploadedAt: new Date().toISOString().split('T')[0],
        fileSize: "1.5 MB",
        version: 1,
        versions: []
      };
      mutateLocalDb((db) => {
        const target = db.cases.find((c: any) => c.id === selectedCaseId);
        if (target) {
          target.documents.unshift(newDoc);
          target.timeline.unshift({
            id: `evt-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            title: "Document Uploaded",
            description: `Document "${newDoc.name}" was uploaded to repository under directory classification.`,
            performedBy: newDoc.uploadedBy,
            type: "document"
          });
        }
        return db;
      });
      await fetchDbState(activeUserId);
      setDocumentUploadName("");
      return;
    }

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doc: {
            name: documentUploadName,
            category: "Evidence",
            uploadedBy: dbState.roleSelf?.name || "System Operator",
            fileSize: "1.5 MB"
          }
        })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        setDocumentUploadName("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateCaseStatus = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOfflineMode) {
      mutateLocalDb((db) => {
        const target = db.cases.find((c: any) => c.id === selectedCaseId);
        if (target) {
          target.status = statusUpdateVal;
          target.timeline.unshift({
            id: `evt-${Date.now()}`,
            date: new Date().toISOString().split('T')[0],
            title: `Status Changed to ${statusUpdateVal}`,
            description: statusUpdateRemarks || `Moved case stage container to ${statusUpdateVal}.`,
            performedBy: dbState.roleSelf?.name || "Partner Officer",
            type: "status"
          });
        }
        return db;
      });
      await fetchDbState(activeUserId);
      setStatusUpdateRemarks("");
      alert("Case lifecycle updated successfully.");
      return;
    }

    try {
      const res = await fetch(`/api/cases/${selectedCaseId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: statusUpdateVal,
          remarks: statusUpdateRemarks,
          user: dbState.roleSelf?.name || "Partner Officer"
        })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        setStatusUpdateRemarks("");
        alert("Case lifecycle updated successfully.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOfflineMode) {
      const addedLead = {
        ...newLead,
        id: `lead-${Date.now()}`,
        status: "New",
        assignedTo: "12",
        createdAt: new Date().toISOString().split('T')[0],
        score: Math.floor(Math.random() * 40) + 60
      };
      mutateLocalDb((db) => {
        db.leads.unshift(addedLead);
        return db;
      });
      await fetchDbState(activeUserId);
      setActiveModal(null);
      setNewLead({ name: "", company: "", phone: "", email: "", source: "Website", priority: "Medium", notes: "" });
      return;
    }

    try {
      const res = await fetch('/api/leads/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lead: { ...newLead, status: "New", assignedTo: "12" } })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        setActiveModal(null);
        setNewLead({ name: "", company: "", phone: "", email: "", source: "Website", priority: "Medium", notes: "" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, status: string) => {
    if (isOfflineMode) {
      mutateLocalDb((db) => {
        const target = db.leads.find((l: any) => l.id === leadId);
        if (target) {
          target.status = status;
        }
        return db;
      });
      await fetchDbState(activeUserId);
      return;
    }

    try {
      const res = await fetch('/api/leads/update-status', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGpsCheckInPunched = async () => {
    setCheckinSuccessMsg("");

    if (isOfflineMode) {
      const todayStr = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      // Exclude duplicate punches
      const exists = dbState.attendance.find((a: any) => a.userId === activeUserId && a.date === todayStr);
      if (exists) {
        setCheckinSuccessMsg("Attendance already logged for today.");
        return;
      }
      const now = new Date();
      const reportingLimit = new Date();
      reportingLimit.setHours(10, 45, 0); // 10:30 AM + 15 min grace periods
      let status: "Present" | "Late" = "Present";
      if (now > reportingLimit) {
        status = "Late";
      }
      mutateLocalDb((db) => {
        db.attendance.unshift({
          id: `att-${Date.now()}`,
          userId: activeUserId,
          userName: dbState.roleSelf?.name || "Unverified User",
          date: todayStr,
          checkInTime: currentTime,
          checkOutTime: "",
          status,
          latitude: gpsLatitude || 24.8607,
          longitude: gpsLongitude || 67.0011,
          lateReasoning: status === "Late" ? lateExplanation || "Late arrival justification required." : "",
          geofencePassed: gpsLatitude && gpsLongitude ? true : false
        });
        return db;
      });
      await fetchDbState(activeUserId);
      setCheckinSuccessMsg(`Success! Punched Check-In status: ${status}. Reporting timestamp set.`);
      setLateExplanation("");
      return;
    }

    try {
      const res = await fetch('/api/attendance/checkin', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: activeUserId,
          userName: dbState.roleSelf?.name || "Unverified User",
          latitude: gpsLatitude || 24.8607,
          longitude: gpsLongitude || 67.0011,
          lateReasoning: lateExplanation
        })
      });
      if (res.ok) {
        const data = await res.json();
        await fetchDbState(activeUserId);
        setCheckinSuccessMsg(`Success! Punched Check-In status: ${data.attendance.status}. Reporting timestamp set.`);
        setLateExplanation("");
      } else {
        const err = await res.json();
        setCheckinSuccessMsg(err.error || "Punch check-in error.");
      }
    } catch (err) {
      setCheckinSuccessMsg("Check-in request failed to verify.");
    }
  };

  const handleCheckOutPunched = async () => {
    setCheckinSuccessMsg("");

    if (isOfflineMode) {
      const todayStr = new Date().toISOString().split('T')[0];
      mutateLocalDb((db) => {
        const item = db.attendance.find((a: any) => a.userId === activeUserId && a.date === todayStr);
        if (item) {
          item.checkOutTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        return db;
      });
      await fetchDbState(activeUserId);
      setCheckinSuccessMsg("Success! Punch Check-Out registered. Duty session concluded.");
      return;
    }

    try {
      const res = await fetch('/api/attendance/checkout', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        setCheckinSuccessMsg("Success! Punch Check-Out registered. Duty session concluded.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLeaveRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Implement standard leave requester
    alert("Leave request submitted to administrative Partner approval chain.");
  };

  const handleManualAttendancePunch = async (targetId: string, name: string, status: string) => {
    if (isOfflineMode) {
      mutateLocalDb((db) => {
        db.attendance.unshift({
          id: `att-${Date.now()}`,
          userId: targetId,
          userName: name,
          date: new Date().toISOString().split('T')[0],
          checkInTime: "10:30 AM",
          checkOutTime: "06:00 PM",
          status,
          geofencePassed: true
        });
        return db;
      });
      await fetchDbState(activeUserId);
      alert(`Manually marked attendance for ${name} as ${status}`);
      return;
    }

    try {
      const res = await fetch('/api/attendance/manual', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: targetId,
          userName: name,
          status,
          date: new Date().toISOString().split('T')[0]
        })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        alert(`Manually marked attendance for ${name} as ${status}`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePaySalarySlip = async (userId: string, name: string, basic: number) => {
    alert(`Salary slip processed for ${name}. PKR ${basic} paid, debiting from Cash with Partner approval voucher.`);
  };

  const handleCreateExpense = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOfflineMode) {
      mutateLocalDb((db) => {
        const newExp = {
          ...newExpense,
          id: `exp-${Date.now()}`,
          recordedBy: activeUserId,
          date: new Date().toISOString().split('T')[0]
        };
        db.expenses.unshift(newExp);
        if (newExpense.category === "Petty Cash" || (newExpense.amount && newExpense.amount <= 15000)) {
          db.pettyCash = Math.max(0, db.pettyCash - (newExpense.amount || 0));
        }
        return db;
      });
      await fetchDbState(activeUserId);
      setActiveModal(null);
      setNewExpense({ description: "", category: "Office Supplies", amount: 1500, isReimbursable: false });
      alert("Expense voucher saved. Firm petty-cash ledger balanced.");
      return;
    }

    try {
      const res = await fetch('/api/expenses/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expense: { ...newExpense, recordedBy: activeUserId } })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        setActiveModal(null);
        setNewExpense({ description: "", category: "Office Supplies", amount: 1500, isReimbursable: false });
        alert("Expense voucher saved. Firm petty-cash ledger balanced.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateInvoice = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isOfflineMode) {
      mutateLocalDb((db) => {
        db.invoices.unshift({
          ...newInvoice,
          id: `inv-${Date.now()}`,
          invoiceNumber: `INV-2026-00${db.invoices.length + 1}`,
          createdAt: new Date().toISOString().split('T')[0],
          caseTitle: db.cases.find((c: any) => c.id === newInvoice.caseId)?.title || "General Legal Counsel",
          clientName: db.cases.find((c: any) => c.id === newInvoice.caseId)?.clientName || "Corporate Accounts",
          status: "Sent",
          items: [{ description: db.cases.find((c: any) => c.id === newInvoice.caseId)?.title || "General Legal Counsel", quantity: 1, rate: newInvoice.amount || 100000, amount: newInvoice.amount || 100000 }]
        });
        return db;
      });
      await fetchDbState(activeUserId);
      setActiveModal(null);
      alert("Invoice created and queued for emulated WhatsApp delivery.");
      return;
    }

    try {
      const res = await fetch('/api/invoices/create', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoice: {
            ...newInvoice,
            invoiceNumber: "INV-CUSTOM",
            caseTitle: dbState.cases.find((c: any) => c.id === newInvoice.caseId)?.title || "General Legal Counsel",
            clientName: dbState.cases.find((c: any) => c.id === newInvoice.caseId)?.clientName || "Corporate Accounts",
            status: "Sent"
          }
        })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        setActiveModal(null);
        alert("Invoice created and queued for automated WhatsApp delivery.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayInvoiceMock = async (invoiceId: string) => {
    if (isOfflineMode) {
      mutateLocalDb((db) => {
        const item = db.invoices.find((i: any) => i.id === invoiceId);
        if (item) {
          item.status = "Paid";
          const activeCase = db.cases.find((c: any) => c.id === item.caseId);
          if (activeCase) {
            activeCase.unpaidFees = Math.max(0, activeCase.unpaidFees - item.amount);
          }
        }
        return db;
      });
      await fetchDbState(activeUserId);
      alert("Payment verified. Retainer ledger accounts balanced.");
      return;
    }

    try {
      const res = await fetch('/api/invoices/pay', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invoiceId, status: "Paid" })
      });
      if (res.ok) {
        await fetchDbState(activeUserId);
        alert("Payment verified. Retainer ledger accounts balanced.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText) return;

    if (isOfflineMode) {
      mutateLocalDb((db) => {
        const payload = {
          id: `msg-${Date.now()}`,
          chatId: selectedChatId,
          senderId: activeUserId,
          senderName: dbState.roleSelf?.name || "Staff Responder",
          text: chatMessageText,
          timestamp: new Date().toISOString(),
          type: "text",
          status: "sent"
        };
        db.messages.push(payload);
        const chatItem = db.chats.find((c: any) => c.id === selectedChatId);
        if (chatItem) {
          chatItem.lastMessageText = chatMessageText;
          chatItem.lastMessageTime = payload.timestamp;
        }
        return db;
      });
      setChatMessageText("");
      await fetchDbState(activeUserId);
      return;
    }

    try {
      const res = await fetch('/api/messages/send', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChatId,
          senderId: activeUserId,
          senderName: dbState.roleSelf?.name || "Staff Responder",
          text: chatMessageText
        })
      });
      if (res.ok) {
        setChatMessageText("");
        await fetchDbState(activeUserId);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // AI legal drafts helper api trigger
  const handleGenerateLegalDraftObj = async () => {
    setDraftLoading(true);
    setDraftResult("");
    if (isOfflineMode) {
      setTimeout(() => {
        let content = "";
        const client = draftingClientName || "Client Corporation";
        const title = dbState.cases.find((c: any) => c.id === selectedCaseId)?.title || "Dispute Appeals Case";
        if (draftingType === "Power of Attorney") {
          content = `SPECIAL POWER OF ATTORNEY\n\nKNOW ALL MEN BY THESE PRESENTS, that I, ${client}, do hereby constitute, nominate and appoint Sarosh Sultan, Advocate of High Court, and other partners of LegalOps Pro as my lawful Attorney to act for me in relation to the case: "${title}" pending before the High Court.\n\nTo file statements, appeals, cross-examine witnesses, and do all such lawful acts as may be necessary for the proper conduct of the case.\n\nIN WITNESS WHEREOF, I have set my hand this ${new Date().toLocaleDateString()}.\n\n_______________________\nEXECUTANT: ${client}`;
        } else if (draftingType === "Contract Agreement") {
          content = `MUTUAL NON-DISCLOSURE AGREEMENT\n\nThis Agreement is entered into on this ${new Date().toLocaleDateString()} by and between ${client} (hereinafter referred to as the "Disclosing Party") and LegalOps Pro Associates.\n\n1. PURPOSE: The parties wish to discuss details of SECP and corporate filings for the ongoing litigation: "${title}".\n2. CONFIDENTIALITY: All files shared, including corporate tax logs or withholding exemption letters, must be kept strict secret.\n3. GOVERNING LAW: This agreement shall be governed by the laws of Pakistan/Sindh Provincial courts.\n\nSigned,\n\nFor Client: ______________________\nFor Firm: Sarosh Sultan, Advocate`;
        } else {
          content = `LEGAL DEMAND NOTICE\n\nTo:\nOpposing Counsel / Respondent\nIn reference to: ${title}\n\nDate: ${new Date().toLocaleDateString()}\n\nDear Sir/Madam,\n\nUnder instruction from our client, ${client}, we hereby serve you this formal legal notice. It has come to our attention that your recent administrative notices under Section 43 violate the standard procedural guidelines.\n\nWe hereby call upon you to withdraw said notices or reach an administrative settlement within 14 days of receipt of this notice, failing which we have definite directives to initiate formal litigation.\n\nYours faithfully,\n\nSarosh Sultan\nPartner, LegalOps Pro`;
        }
        setDraftResult(content);
        setDraftLoading(false);
      }, 500);
      return;
    }
    try {
      const res = await fetch('/api/ai/draft', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseTitle: dbState.cases.find((c: any) => c.id === selectedCaseId)?.title || "dispute Appeals",
          caseType: dbState.cases.find((c: any) => c.id === selectedCaseId)?.caseType || "Litigation",
          templateType: draftingType,
          userInputs: { clientName: draftingClientName, court: "Supreme Appellate Tribunal", sectionsMatched: "SECP Sec 43, Income-tax Ordinance 2001" }
        })
      });
      if (res.ok) {
        const data = await res.json();
        setDraftResult(data.draft);
      }
    } catch (err) {
      setDraftResult("Could not process request. Verify platform server secrets.");
    } finally {
      setDraftLoading(false);
    }
  };

  // AI Case timeline summarized
  const handleGenerateCaseAiSummary = async (caseId: string) => {
    alert("Synthesizing Case Arguments, Trial Risk Score and outstanding financial factors with Gemini... check case outline below in 2-3 seconds.");
    if (isOfflineMode) {
      const activeCase = dbState.cases.find((c: any) => c.id === caseId);
      const title = activeCase?.title || "Pending Litigation";
      const opposing = activeCase?.opposingParty || "FBR panel";
      const desc = activeCase?.description || "No description provided.";
      setTimeout(() => {
        const summaryMsg = `GEMINI AI CLIENT-SIDE SUMMARY OF CASE: "${title}"\n===============================================\n\n1. OBJECTIVE MATTERS:\n- Opposing Party: ${opposing}\n- Base Description: ${desc}\n- Total Retainer agreed: PKR ${activeCase?.estimatedFees?.toLocaleString() || "N/A"}\n- Amount remaining: PKR ${activeCase?.unpaidFees?.toLocaleString() || "N/A"}\n\n2. LITIGATION STRENGTH ASSESSMENT:\n- High Probability of Success based on procedural loopholes.\n- Identified administrative mismatch with tax logs.\n\n3. STRATEGIC NEXT STEPS:\n- Task assigned counsel to file a rejoinder.\n- Engage Hamid to cross-check rider fuel vouchers for court courier delivery.`;
        alert(`Gemini AI Legal Analysis Brief Summary:\n\n${summaryMsg}`);
      }, 500);
      return;
    }
    try {
      const res = await fetch('/api/ai/summary', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId })
      });
      if (res.ok) {
        const data = await res.json();
        // Insert dynamically as a modal notification or text
        alert(`Gemini AI Legal Analysis Brief Summary:\n\n${data.summary}`);
      }
    } catch (err) {
      alert("Verification failed.");
    }
  };

  // AI Active Chatbot response
  const handleSendAiAssistantText = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput) return;
    const userMsg = chatInput;
    setChatInput("");
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
    setAiThinking(true);
    if (isOfflineMode) {
      setTimeout(() => {
        let reply = "";
        const query = userMsg.toLowerCase();
        if (query.includes("task") || query.includes("todo") || query.includes("do")) {
          reply = `Hello! Under serverless emulated storage, you currently have ${dbState.tasks.length} active tasks. Critical priorities should be resolved by Partners or Senior Staff. What specifically are you working on?`;
        } else if (query.includes("case") || query.includes("matter") || query.includes("law")) {
          reply = `Currently tracking ${dbState.cases.length} litigation and compliance files on the CRM/Case log. We should double check hearing schedules on the mini calendar widget.`;
        } else if (query.includes("user") || query.includes("who") || query.includes("staff")) {
          reply = `Your firm has ${dbState.allUsers.length} total personnel records. Sultan Ahmed Khan is Level 1 Firm Head (non-computer user). Partners include Sarosh Sultan, Sohail Kashani, Wahab Ul Bari, and Asif Yousuf.`;
        } else if (query.includes("attendance") || query.includes("salary") || query.includes("payroll")) {
          reply = "Hamid manages system attendance, custom payslips, cash vouchers and rider payrolls. You can click on the 'Attendance & Leaves' menu or the 'Payroll Manager' tab to view or modify.";
        } else {
          reply = `I am your LegalOps Pro AI assistant. In this serverless sandbox environment, it looks like you asked about "${userMsg}". You can interact with the dynamic tabs to view active cases, log gps check-ins, or run structured BI Analytics Reports!`;
        }
        setChatHistory(prev => [...prev, { sender: 'assistant', text: reply }]);
        setAiThinking(false);
      }, 700);
      return;
    }
    try {
      const res = await fetch('/api/ai/chat', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg, context: { casesCount: dbState?.cases?.length, pendingTasks: dbState?.tasks?.length } })
      });
      if (res.ok) {
        const data = await res.json();
        setChatHistory(prev => [...prev, { sender: 'assistant', text: data.reply }]);
      }
    } catch (err) {
      setChatHistory(prev => [...prev, { sender: 'assistant', text: "Platform API failed. Verify your secret configuration variables." }]);
    } finally {
      setAiThinking(false);
    }
  };

  // Business Intelligent custom reports aggregator generator
  const runBIReportCalculation = () => {
    if (!dbState) return;
    // Generate simulated aggregated analytical outputs based on user choice
    const dataGroups: { [key: string]: number } = {};
    if (customReport.groupBy === "priority") {
      dbState.tasks.forEach((t: any) => {
        dataGroups[t.priority] = (dataGroups[t.priority] || 0) + 1;
      });
    } else {
      dbState.cases.forEach((c: any) => {
        dataGroups[c.status] = (dataGroups[c.status] || 0) + 1;
      });
    }

    setBiReportOutput({
      generatedAt: new Date().toLocaleString(),
      aggregationType: customReport.metric,
      dimension: customReport.groupBy,
      recordsAnalyzed: dbState.tasks.length + dbState.cases.length,
      data: Object.entries(dataGroups).map(([key, value]) => ({ group: key, value, revenueWeighted: value * 150000 })),
      aiInterpretation: `Gemini Insights: The ${customReport.groupBy} resource load is concentrated heavily on high value items. We recommend scheduling automatic WhatsApp progress summaries for partners every Friday at 5:00 PM to save 12% in administrative delay overhead.`
    });
  };

  // Super Admin Control Handlers
  const handleAdminResetData = async () => {
    if (!confirm("Are you absolutely sure you want to sanitize and purge all dummy/sample records from the system? This action is irreversible unless a backup exists.")) return;
    
    if (isOfflineMode) {
      mutateLocalDb((db) => {
        db.cases = [];
        db.leads = [];
        db.tasks = [];
        db.attendance = [];
        db.leaveRequests = [];
        db.payroll = [];
        db.invoices = [];
        db.expenses = [];
        db.reports = [];
        db.pettyCash = 0;
        db.chats = [
          {
            id: "chat-global",
            name: "Firm-Wide Announcements",
            isGroup: true,
            participants: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
            unreadCount: 0,
            lastMessageText: "Welcome to the production LegalOps workspace.",
            lastMessageTime: new Date().toISOString()
          },
          {
            id: "chat-ops",
            name: "Operations & Administration Group",
            isGroup: true,
            participants: ["2", "4", "7", "12"],
            unreadCount: 0,
            lastMessageText: "Operations group chat session created.",
            lastMessageTime: new Date().toISOString()
          }
        ];
        db.messages = [
          {
            id: `msg-${Date.now()}-g`,
            chatId: "chat-global",
            senderId: "2",
            senderName: "Sarosh Sultan",
            text: "Welcome to the production LegalOps workspace.",
            timestamp: new Date().toISOString(),
            type: "text",
            status: "read"
          }
        ];
        return db;
      });
      alert("Database fully sanitized locally! All mock/placeholder entries have been permanently removed.");
      await fetchDbState(activeUserId);
      return;
    }

    try {
      const res = await fetch("/api/admin/reset-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        await fetchDbState(activeUserId);
      } else {
        const data = await res.json();
        alert("Reset failed: " + data.error);
      }
    } catch (err: any) {
      alert("Network error: " + err.message);
    }
  };

  const handleAdminRebuildIndex = async () => {
    alert("Triggering indexing algorithms...");
    if (isOfflineMode) {
      setTimeout(() => alert("Search index successfully rebuilt! Only actual database entries reside in global indexing structures."), 400);
      return;
    }
    try {
      const res = await fetch("/api/admin/rebuild-index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleAdminRefreshReports = async () => {
    if (isOfflineMode) {
      setBiReportOutput(null);
      alert("Aggregates cached outputs refreshed with actual production metrics only!");
      return;
    }
    try {
      const res = await fetch("/api/admin/refresh-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setBiReportOutput(null);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const handleAdminRestoreBackup = async () => {
    if (!confirm("Are you sure you want to restore from the last snapshot backup? This will restore pre-sanitization demo cases, leads, and finances.")) return;
    if (isOfflineMode) {
      let localBackupStr = localStorage.getItem("legalops_emulated_db_backup");
      if (localBackupStr) {
        localStorage.setItem("legalops_emulated_db", localBackupStr);
        alert("Offline emulated database restored to snapshot state successfully!");
        await fetchDbState(activeUserId);
      } else {
        alert("No offline backup snapshot was found in your browser cache.");
      }
      return;
    }
    try {
      const res = await fetch("/api/admin/restore-backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        await fetchDbState(activeUserId);
      } else {
        const data = await res.json();
        alert("Restore failed: " + data.error);
      }
    } catch (err: any) {
      alert("Restore error: " + err.message);
    }
  };

  const handleAdminSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOfflineMode) {
      mutateLocalDb((db) => {
        if (editingUserId) {
          const idx = db.users.findIndex((u: any) => u.id === editingUserId);
          if (idx > -1) {
            db.users[idx] = { ...db.users[idx], ...userForm, id: editingUserId };
          }
        } else {
          db.users.push({
            ...userForm,
            id: `${db.users.length + 1}`,
            active: true
          });
        }
        return db;
      });
      alert(editingUserId ? "User updated successfully." : "New user created successfully.");
      setEditingUserId(null);
      setUserForm({ name: "", role: "STAFF", level: 4, department: "Drafting Department", email: "", phone: "", baseSalary: 55000, clientId: "", password: "" });
      await fetchDbState(activeUserId);
      return;
    }
    try {
      const res = await fetch("/api/admin/users/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: activeUserId, targetUser: { ...userForm, id: editingUserId } })
      });
      if (res.ok) {
        const data = await res.json();
        alert(data.message);
        setEditingUserId(null);
        setUserForm({ name: "", role: "STAFF", level: 4, department: "Drafting Department", email: "", phone: "", baseSalary: 55000, clientId: "", password: "" });
        await fetchDbState(activeUserId);
      } else {
        const data = await res.json();
        alert("Error saving user: " + data.error);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  };

  const [importedPreviewUsers, setImportedPreviewUsers] = useState<any[] | null>(null);

  const handleCsvParseAndUpload = (text: string) => {
    try {
      const lines = text.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length < 2) {
        alert("Spreadsheet must contain a header row and at least one data row.");
        return null;
      }
      // Parse header columns
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const parsedUsers: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length === 0 || cols.every(col => col === "")) continue;
        const rowObj: any = {};
        headers.forEach((h, idx) => {
          if (idx < cols.length) {
            rowObj[h] = cols[idx];
          }
        });
        
        const uId = rowObj.id || `uploaded-${Date.now()}-${i}`;
        const uName = rowObj.name || rowObj['full name'] || rowObj.employee || `Personnel No ${i}`;
        const uRole = (rowObj.role || rowObj['access role'] || "STAFF").toUpperCase();
        const uEmail = rowObj.email || rowObj['email address'] || `imported-${i}@legalops.pro`;
        const uPhone = rowObj.phone || rowObj['phone number'] || "+92 300 1234567";
        const uSalary = Number(rowObj.salary || rowObj.baseSalary || rowObj['base salary'] || 60000);
        const uClientId = rowObj.clientid || rowObj.username || rowObj.loginid || uName.split(' ')[0].toLowerCase().replace(/\s+/g, '');
        const uPassword = rowObj.password || rowObj.pass || "importedpass123";
        const uDept = rowObj.department || rowObj.dept || (uRole === "CLIENT" ? "Client Litigations Portal" : "Drafting Department");
        const uAssKey = rowObj.assignedcaseid || rowObj.caseid || "";
        
        parsedUsers.push({
          id: uId,
          name: uName,
          role: uRole,
          level: uRole === "PARTNER" ? 2 : uRole === "SENIOR_STAFF" ? 3 : uRole === "CLIENT" ? 5 : 4,
          department: uDept,
          email: uEmail,
          phone: uPhone,
          baseSalary: uSalary,
          clientId: uClientId,
          password: uPassword,
          assignedCaseId: uAssKey,
          active: true
        });
      }
      return parsedUsers;
    } catch (err: any) {
      alert("Error parsing CSV spreadsheet columns: " + err.message);
      return null;
    }
  };

  const readAndProcessDatabaseFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (!text) return;
      
      if (file.name.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          if (!parsed.users && !parsed.cases) {
            alert("Invalid JSON schema. Backup files must contain at least a 'users' array node.");
            return;
          }
          if (isOfflineMode) {
            mutateLocalDb((db) => {
              return { ...db, ...parsed };
            });
            alert("Offline Database backup state loaded and merged into local storage successfully!");
            await fetchDbState(activeUserId);
          } else {
            const res = await fetch("/api/admin/db/upload", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ userId: activeUserId, newDbState: parsed })
            });
            if (res.ok) {
              const resData = await res.json();
              alert(resData.message);
              await fetchDbState(activeUserId);
            } else {
              const resData = await res.json();
              alert("Server upload error: " + resData.error);
            }
          }
        } catch (err: any) {
          alert("Failed to parse system JSON: " + err.message);
        }
      } else if (file.name.endsWith('.csv') || file.name.endsWith('.txt')) {
        const users = handleCsvParseAndUpload(text);
        if (users && users.length > 0) {
          setImportedPreviewUsers(users);
        }
      } else {
        alert("Unsupported file format. Please upload files ending in .csv, .txt, or .json");
      }
    };
    reader.readAsText(file);
  };

  const handleDatabaseFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readAndProcessDatabaseFile(file);
  };

  const handleCommitImportedUsers = async () => {
    if (!importedPreviewUsers || importedPreviewUsers.length === 0) return;
    
    if (isOfflineMode) {
      mutateLocalDb((db) => {
        const existingEmails = new Set(db.users.map((u: any) => u.email?.toLowerCase()));
        importedPreviewUsers.forEach(u => {
          if (!existingEmails.has(u.email?.toLowerCase())) {
            db.users.push(u);
          } else {
            const idx = db.users.findIndex((ex: any) => ex.email?.toLowerCase() === u.email?.toLowerCase());
            if (idx > -1) db.users[idx] = { ...db.users[idx], ...u };
          }
        });
        return db;
      });
      alert(`Import complete! Loaded ${importedPreviewUsers.length} user/client credentials rows into local emulated DB!`);
      setImportedPreviewUsers(null);
      await fetchDbState(activeUserId);
    } else {
      try {
        const res = await fetch("/api/admin/db/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: activeUserId, newDbState: { users: importedPreviewUsers } })
        });
        if (res.ok) {
          const resData = await res.json();
          alert(resData.message);
          setImportedPreviewUsers(null);
          await fetchDbState(activeUserId);
        } else {
          const resData = await res.json();
          alert("Error uploading parsed team data: " + resData.error);
        }
      } catch (err: any) {
        alert("Server error merging spreadsheet: " + err.message);
      }
    }
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginUsername) {
      setLoginError("Please enter a valid Client ID or administrative email.");
      return;
    }
    const matched = (dbState?.allUsers || []).find((u: any) => 
      (u.clientId?.toLowerCase() === loginUsername.trim().toLowerCase() || u.email?.toLowerCase() === loginUsername.trim().toLowerCase()) && 
      u.password === loginPassword
    );
    if (matched) {
      setActiveUserId(matched.id);
      setIsAuthenticated(true);
      setLoginError("");
      setLoginUsername("");
      setLoginPassword("");
      setPendingSwitchUserId(null);
      fetchDbState(matched.id);
    } else {
      setLoginError("Verification failed. Incorrect Username or Password Code.");
    }
  };

  if (loading || !dbState) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-slate-600 font-semibold tracking-wide">LegalOps Pro ERP initializes securely...</p>
      </div>
    );
  }

  // Define active role tags
  const activeRoleTag = dbState.roleSelf;
  const isSultanHead = activeRoleTag?.id === "1"; // Level 1 Head (non-computer user)

  if (!isAuthenticated) {
    const defaultSelectId = pendingSwitchUserId || "2";
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 relative font-sans text-slate-100">
        {/* Decorative background grid and light leak */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#312e81,transparent_50%)] opacity-30 pointer-events-none"></div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30 pointer-events-none"></div>

        <div className="w-full max-w-md bg-slate-950/80 backdrop-blur-xl p-8 rounded-3xl border border-slate-800 shadow-2xl relative z-10 space-y-6">
          <div className="text-center space-y-1">
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-indigo-600 text-white shadow-lg mb-2">
              <Database size={24} />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white font-sans">LegalOps Pro</h1>
            <p className="text-xs text-slate-400 font-medium">Secure Database Authentication Portal</p>
          </div>

          {/* Quick Demo Impersonator Dropdown */}
          <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-extrabold text-indigo-400 tracking-wider flex items-center gap-1 uppercase">
                <span>🔑 Sandbox Role Credentials Helper</span>
              </span>
              <span className="text-[9px] text-slate-500 font-medium font-mono">Select any Loaded Account</span>
            </div>
            <select
              value={defaultSelectId}
              onChange={(e) => {
                const targetUId = e.target.value;
                const found = (dbState?.allUsers || []).find((u: any) => u.id === targetUId);
                if (found) {
                  setLoginUsername(found.clientId || found.email || "");
                  setLoginPassword(found.password || "");
                  setPendingSwitchUserId(targetUId);
                }
              }}
              className="w-full text-xs font-semibold bg-slate-950 text-slate-200 border border-slate-800 px-3 py-2 rounded-xl focus:outline-none cursor-pointer hover:bg-slate-900"
            >
              <option value="">-- Pre-populate Credentials --</option>
              {(dbState?.allUsers || []).map((u: any) => (
                <option key={u.id} value={u.id}>
                  Level {u.level}: {u.name} ({u.role === "CLIENT" ? "Client Portal" : u.department || u.role})
                </option>
              ))}
            </select>
            <p className="text-[9.5px] text-slate-500 leading-snug font-medium">Selecting a role instantly loads its system username and security credentials for immediate authentication evaluation.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {loginError && (
              <div className="text-xs font-bold text-rose-400 bg-rose-950/50 p-3 rounded-xl border border-rose-900/50 text-center">
                ⚠️ {loginError}
              </div>
            )}

            <div className="space-y-1 text-left">
              <label className="text-[10px] font-bold text-slate-400 uppercase block pl-1">Client ID / Login Username</label>
              <input
                type="text"
                required
                value={loginUsername}
                onChange={(e) => setLoginUsername(e.target.value)}
                placeholder="e.g. hbl-client or sarosh"
                className="w-full text-xs border border-slate-800 bg-slate-900/50 p-3 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-semibold"
              />
            </div>

            <div className="space-y-1 text-left">
              <div className="flex justify-between items-center pl-1 pr-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase block">Access Code Password</label>
                <span className="text-[9px] text-slate-500 font-medium">Check database settings</span>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs border border-slate-800 bg-slate-900/50 p-3 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-950/50 cursor-pointer transition-all flex items-center justify-center gap-1 text-center"
            >
              <span>🔑 Authorize & Lock Session</span>
            </button>
          </form>

          <div className="text-center pt-2">
            <span className="text-[9px] text-slate-600 font-mono font-medium">Enterprise Core • isolated tenant encryption verified</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div id="root-container" className="h-screen w-full bg-slate-50 flex flex-col overflow-hidden text-slate-800 font-sans">
      
      {/* Top Main Navigation Header */}
      <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
            className="md:hidden p-2 text-slate-500 hover:text-slate-800"
            id="mobile-nav-toggle"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-100">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-slate-900 block leading-none">LegalOps Pro</span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">Law Firm SaaS ERP</span>
            </div>
          </div>
        </div>

        {/* Action controls & Impersonator Switchboard */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-600">
            <span>Status:</span>
            {isOfflineMode ? (
              <span className="flex items-center gap-1.5 text-amber-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block animate-pulse"></span>
                Emulated Client-Side Sandbox
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
                Secure Live ERP Sandbox
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span id="role-select-label" className="text-[10px] font-extrabold text-slate-400 uppercase hidden sm:inline">Active Role:</span>
            
            {/* Dynamic Dropdown from DB State */}
            <select
              id="role-switch"
              value={activeUserId}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border-2 border-indigo-200 px-2.5 py-1.5 rounded-xl cursor-pointer hover:bg-indigo-100/80 focus:outline-none transition-all"
            >
              {(dbState.allUsers || []).map((u: any) => (
                <option key={u.id} value={u.id}>
                  Lv {u.level}: {u.name} {u.role === "CLIENT" ? "🔑 (Client Portal)" : `(${u.role})`}
                </option>
              ))}
            </select>

            {/* Auth Lock toggler */}
            <label className="flex items-center gap-1 text-[10px] bg-slate-100 border border-slate-200 px-2 py-1.5 rounded-xl cursor-pointer hover:bg-slate-200/60 transition-colors" title="Enable password validation to change active practitioners">
              <input
                type="checkbox"
                checked={authLockMode}
                onChange={(e) => setAuthLockMode(e.target.checked)}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer text-xs"
              />
              <span className="font-bold text-slate-500 uppercase tracking-tight hidden lg:inline">Strict Auth Lock</span>
            </label>

            {/* Sign Out Trigger */}
            <button
              onClick={() => {
                setIsAuthenticated(false);
                setLoginUsername("");
                setLoginPassword("");
              }}
              className="p-1.5 px-2.5 bg-rose-50 text-rose-600 border border-rose-200 hover:bg-rose-100/80 rounded-xl text-[11px] font-bold cursor-pointer transition-colors flex items-center gap-1"
              title="Secure Logout to main console"
            >
              <span>Secure Sign Out</span>
            </button>
          </div>

          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-sm">
            {activeRoleTag?.name.charAt(0) || "U"}
          </div>
        </div>
      </header>

      {/* Main Container Stage */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Control Sidebar Navigation (Sleek Style Alignment) */}
        <aside className={`
          fixed inset-y-16 left-0 w-64 bg-white border-r border-slate-200 p-5 flex flex-col gap-6 z-10 transition-transform duration-300 md:static md:translate-x-0
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        `} id="sidebar-panel">
          
          <div className="px-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Currently Auditing:</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
              <p className="text-xs font-bold text-slate-800 line-clamp-1">{activeRoleTag?.name}</p>
              <p className="text-[10px] font-semibold text-slate-500 mt-0.5">{activeRoleTag?.department}</p>
              <p className="text-[9px] font-medium bg-indigo-100 text-indigo-700 w-fit px-1.5 py-0.5 rounded-full mt-2">Level {activeRoleTag?.level} Access</p>
            </div>
          </div>

          {/* Visibility Warning for Sultan */}
          {isSultanHead && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl">
              <p className="text-[10px] font-bold text-rose-700 flex items-center gap-1">
                <AlertCircle size={12} /> Non-Computer User Block
              </p>
              <p className="text-[9px] text-rose-600 mt-1">Sultan Ahmed Khan (Firm Head) is registered as non-active computer system operator. Screens are hidden to mimic offline workflow hierarchy constraints.</p>
            </div>
          )}

          <section className="flex-1 overflow-y-auto pr-1">
            <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Primary Workspaces</h3>
            <ul id="sidebar-menu-list" className="space-y-1">
               {[
                { id: "dashboard", label: "Dashboard Hub", icon: Layers },
                { id: "cases", label: "Cases & Matters", icon: Briefcase },
                { id: "crm", label: "CRM & Leads", icon: Users },
                { id: "tasks", label: "Task Board", icon: CheckSquare },
                { id: "attendance", label: "Attendance & HR", icon: Clock },
                { id: "chat", label: "WhatsApp Chat", icon: MessageSquare },
                { id: "social", label: "Social & Post Designer", icon: Share2 },
                { id: "workflows", label: "Workflow Automator", icon: Sparkles },
                { id: "finances", label: "Finances & Costs", icon: DollarSign },
                { id: "reports", label: "BI Report Builder", icon: BarChart3 },
                { id: "admin", label: "Security & Data Console", icon: Shield }
              ].map((m) => {
                const IconComp = m.icon;
                const isActive = currentTab === m.id;
                return (
                  <li key={m.id}>
                    <button
                      id={`tab-btn-${m.id}`}
                      disabled={isSultanHead}
                      onClick={() => {
                        setCurrentTab(m.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`
                        w-full flex items-center justify-between px-3 py-2 text-xs font-semibold rounded-xl tracking-tight transition-all
                        ${isActive ? 'bg-indigo-50 text-indigo-700 border-l-4 border-indigo-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                        ${isSultanHead ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <IconComp size={16} className={isActive ? 'text-indigo-600' : 'text-slate-400'} />
                        <span>{m.label}</span>
                      </div>
                      <ChevronRight size={12} className="opacity-50" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Bottom promotion layout widget */}
          <div className="mt-auto pt-4 border-t border-slate-100">
            <div className="p-3 bg-gradient-to-tr from-indigo-600 to-indigo-800 rounded-xl text-white shadow-md shadow-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-1 bg-white/20 text-[8px] uppercase tracking-widest font-bold rounded-bl">Enterprise</div>
              <p className="text-[11px] font-bold">LegalOps Pro ERP</p>
              <p className="text-[9px] font-medium opacity-80 mt-1">SaaS Multi-tenant active isolation mode</p>
              <button onClick={() => alert("Billing Management: Enterprise Tier ($25/user/month) paid recurrently on Stripe node.")} className="w-full mt-3 py-1.5 bg-white text-indigo-700 text-[10px] font-bold rounded-lg hover:bg-indigo-50 transition-all">Billing Portal</button>
            </div>
          </div>
        </aside>

        {/* Content Panel Area */}
        <div className="flex-1 flex flex-col overflow-y-auto bg-slate-50">
          
          {isSultanHead ? (
            /* Sultan Offline User View */
            <div className="flex-1 p-6 md:p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 border border-amber-200 mb-4 animate-bounce">
                <Users size={36} />
              </div>
              <h2 className="text-xl font-bold text-slate-800">Firm Head Account Sandbox</h2>
              <p className="text-sm text-slate-500 max-w-lg mt-2">Sultan Ahmed Khan is configured under Level 1 hierarchy guidelines as a traditional non-computer physical executive. All computational operational views are locked downward under RBAC constraints. Sultan’s name exists in assigned portfolios as task approver and matter escalation owner strictly.</p>
              <div className="p-4 bg-white border border-slate-200 rounded-2xl mt-6 text-left max-w-md w-full">
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider block mb-2">Physical Executive Checklist</span>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-center gap-2">🟢 Active litigation lead: Sarosh Sultan</li>
                  <li className="flex items-center gap-2">🟢 Auditing senior operator task routing: Hamid</li>
                  <li className="flex items-center gap-2">🟢 Monthly returns portal closure matching: Wahab</li>
                </ul>
              </div>
            </div>
          ) : (
            /* Standard User Dashboard Tab Workspaces */
            <div className="p-4 md:p-8 space-y-6">

              {/* TAB 1: DASHBOARD HUB */}
              {currentTab === "dashboard" && (
                <div className="space-y-6">
                  
                  {/* KPI Row */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="dashboard-kpi-row">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 flex-shrink-0">
                        <CheckSquare className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unfinished Tasks</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{dbState.tasks.filter((t: any) => t.status !== "Done").length}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="p-3 bg-sky-50 rounded-xl text-sky-600 flex-shrink-0">
                        <Briefcase className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Cases</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">{dbState.cases.length}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600 flex-shrink-0">
                        <DollarSign className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Receivables</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">PKR {dbState.invoices.reduce((acc: number, iv: any) => iv.status !== "Paid" ? acc + iv.amount : acc, 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
                      <div className="p-3 bg-purple-50 rounded-xl text-purple-600 flex-shrink-0">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Daily Attendance</p>
                        <p className="text-2xl font-bold text-slate-900 mt-0.5">
                          {Math.floor(((dbState.attendance.filter((a: any) => a.date === new Date().toISOString().split('T')[0]).length) / dbState.allUsers.length) * 100) || 75}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI Prediction Briefing & Chatbot Workspace */}
                  <div className="bg-gradient-to-tr from-slate-950 to-slate-900 text-white rounded-2xl p-5 md:p-6 border border-slate-800 shadow-md relative overflow-hidden grid md:grid-cols-3 gap-6" id="ai-insights-panel">
                    <div className="md:col-span-2 space-y-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-400 animate-pulse animate-duration-1000" />
                        <h3 className="font-bold text-slate-100 tracking-tight text-sm">Gemini Central Intelligent ERP Assistant</h3>
                      </div>
                      <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
                        <p className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider mb-2">Automated Morning Outlook Briefing:</p>
                        {briefingLoading ? (
                          <div className="text-xs text-slate-400 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
                            Retrieving live briefing pipeline inputs...
                          </div>
                        ) : (
                          <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-line">{aiBriefing}</p>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button onClick={loadAiBriefing} className="px-3 py-1 bg-white/10 hover:bg-white/20 text-[10px] rounded-lg tracking-tight transition-all">Reload Briefing metrics</button>
                        <button onClick={() => handleGenerateCaseAiSummary("case-101")} className="px-3 py-1 bg-indigo-500 hover:bg-indigo-600 text-[10px] text-white rounded-lg tracking-tight transition-all">Analyze Habib Bank Case Discrepancies</button>
                      </div>
                    </div>

                    <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex flex-col justify-between h-64 md:h-auto">
                      <div className="text-xs font-bold text-slate-300 border-b border-slate-800 pb-2 flex items-center justify-between">
                        <span>Direct Legal Chatbot</span>
                        <span className="text-[8px] bg-indigo-600 text-white px-1 py-0.2 rounded uppercase">V3.5 Flash</span>
                      </div>
                      <div className="flex-1 overflow-y-auto space-y-2 py-2 pr-1 text-xs" style={{ maxHeight: '160px' }}>
                        {chatHistory.length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic mt-4 text-center">Ask any question regarding tax codes, caseloads, or assigned pending tasks...</p>
                        ) : (
                          chatHistory.map((m, i) => (
                            <div key={i} className={`p-2 rounded-lg leading-relaxed ${m.sender === 'user' ? 'bg-indigo-950 text-indigo-200 ml-4' : 'bg-slate-800 text-slate-100 mr-4'}`}>
                              <span className="font-bold block uppercase text-[8px] mb-0.5">{m.sender === 'user' ? 'You' : 'Gemini'}</span>
                              <span>{m.text}</span>
                            </div>
                          ))
                        )}
                        {aiThinking && <div className="text-xs text-slate-400 animate-pulse">Assistant analyzing parameters...</div>}
                      </div>
                      <form onSubmit={handleSendAiAssistantText} className="flex gap-1.5 mt-2">
                        <input
                          type="text"
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          placeholder="Ask anything..."
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                        <button type="submit" className="p-1 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                          <Send size={14} />
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* Core Dashboard Layout Grid: Today's Agenda on left, Activity & Quick actions on right */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Columns - Today's Agenda & Department Overview */}
                    <div className="lg:col-span-2 space-y-6">
                      
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">Today’s Work Agenda & Critical Priorities</h3>
                            <p className="text-[10px] text-slate-400 font-medium">Auto-populated task pipeline matching RBAC visibility</p>
                          </div>
                          <button onClick={() => setActiveModal("create-task")} className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs px-2.5 py-1.5 rounded-lg font-bold transition-all">
                            <Plus size={14} /> New Task
                          </button>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[300px] overflow-y-auto">
                          {dbState.tasks.length === 0 ? (
                            <p className="p-8 text-xs text-slate-400 italic text-center">No pending tasks found matching your hierarchy visibility.</p>
                          ) : (
                            dbState.tasks.map((t: any) => (
                              <div key={t.id} className="p-4 hover:bg-slate-50/50 flex justify-between items-start gap-4 transition-all">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="font-bold text-slate-800 text-xs">{t.title}</span>
                                    <span className={`text-[8px] font-bold px-1.5 rounded-full uppercase ${
                                      t.priority === 'Critical' ? 'bg-rose-100 text-rose-700' :
                                      t.priority === 'High' ? 'bg-amber-100 text-amber-700' :
                                      'bg-slate-100 text-slate-700'
                                    }`}>{t.priority}</span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 line-clamp-1">{t.description}</p>
                                  <p className="text-[9px] text-slate-400 font-semibold flex items-center gap-2">
                                    <span>Assignee: {dbState.allUsers.find((u: any) => u.id === t.assignedTo)?.name || "Unassigned"}</span>
                                    <span>•</span>
                                    <span>Due Date: {t.dueDate}</span>
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <select
                                    value={t.status}
                                    onChange={(e) => handleUpdateTaskStatus(t.id, e.target.value)}
                                    className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded-md"
                                  >
                                    <option value="To Do">To Do</option>
                                    <option value="In Progress">In Progress</option>
                                    <option value="Review">Review</option>
                                    <option value="Done">Done</option>
                                  </select>
                                  {activeUserId === "2" && (
                                    <button onClick={() => handleDeleteTask(t.id)} className="p-1 hover:text-rose-600 text-slate-400 rounded transition-all">
                                      <Trash2 size={12} />
                                    </button>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>

                      {/* Department distribution details */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-3">Live Department Efficiency</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Contracts & Lit</span>
                            <span className="text-xl font-bold text-slate-800 mt-1 block">94.5%</span>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                              <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: '94%' }}></div>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Sales Tax & Auditing</span>
                            <span className="text-xl font-bold text-slate-800 mt-1 block">82.1%</span>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                              <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: '82%' }}></div>
                            </div>
                          </div>
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-150">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">SECP & Income Tax</span>
                            <span className="text-xl font-bold text-slate-800 mt-1 block">88.8%</span>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full mt-2">
                              <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: '88%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Columns - Quick actions, mini live-activities log */}
                    <div className="space-y-6">

                      {/* Quick Actions Panel */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-3">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Fast Firm Operations</h3>
                        <div className="grid grid-cols-2 gap-2">
                          <button onClick={() => setActiveModal("create-case")} className="p-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 flex flex-col justify-center items-center gap-1.5 text-center rounded-xl transition-all h-20">
                            <Briefcase size={18} />
                            <span className="text-[10px] font-bold">Register Case</span>
                          </button>
                          <button onClick={() => setActiveModal("create-lead")} className="p-2 bg-sky-50 hover:bg-sky-100 text-sky-700 flex flex-col justify-center items-center gap-1.5 text-center rounded-xl transition-all h-20">
                            <Users size={18} />
                            <span className="text-[10px] font-bold">New Lead</span>
                          </button>
                          <button onClick={() => setActiveModal("log-expense")} className="p-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 flex flex-col justify-center items-center gap-1.5 text-center rounded-xl transition-all h-20">
                            <DollarSign size={18} />
                            <span className="text-[10px] font-bold">Log Cost</span>
                          </button>
                          <button onClick={() => setCurrentTab("attendance")} className="p-2 bg-purple-50 hover:bg-purple-100 text-purple-700 flex flex-col justify-center items-center gap-1.5 text-center rounded-xl transition-all h-20">
                            <Clock size={18} />
                            <span className="text-[10px] font-bold">Check-In</span>
                          </button>
                        </div>
                      </div>

                      {/* Mini Live Activity Feed representation */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 space-y-4">
                        <div className="flex justify-between items-baseline">
                          <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Live Activity Stream</h3>
                          <span className="text-[9px] bg-emerald-100 text-emerald-700 font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Synced Live</span>
                        </div>
                        <div className="space-y-3 max-h-[190px] overflow-y-auto pr-1">
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-1 flex-shrink-0 animate-ping"></div>
                            <div>
                              <p className="text-slate-800 font-bold">Areesha (Level 4)</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Checked In GPS coordinate: 24.86, 67.00 passed geofence bounds.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full mt-1 flex-shrink-0"></div>
                            <div>
                              <p className="text-slate-800 font-bold">New Lead Registered</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">&quot;Nadeem Akhtar&quot; from WhatsApp. Score estimated 85.</p>
                            </div>
                          </div>
                          <div className="flex items-start gap-2.5 text-xs">
                            <div className="w-2.5 h-2.5 bg-purple-500 rounded-full mt-1 flex-shrink-0"></div>
                            <div>
                              <p className="text-slate-800 font-bold">Hamid (HR)</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Voucher settled for Shiraz (Rider Logistics base pay clearance).</p>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 2: CASES & MATTERS */}
              {currentTab === "cases" && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="cases-matter-workspace">
                  
                  {/* Left Column - Cases list */}
                  <div className="lg:col-span-1 space-y-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
                      <div className="flex justify-between items-center">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Registered Cases</h3>
                        <button onClick={() => setActiveModal("create-case")} className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg">
                          <Plus size={14} />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {dbState.cases.map((c: any) => (
                          <button
                            key={c.id}
                            onClick={() => setSelectedCaseId(c.id)}
                            className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                              selectedCaseId === c.id ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-100 hover:bg-slate-50'
                            }`}
                          >
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] bg-slate-200 px-1.5 py-0.5 rounded font-bold uppercase text-slate-600">{c.caseType}</span>
                              <span className={`text-[8px] font-bold uppercase px-1.5 rounded ${
                                c.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100'
                              }`}>{c.priority}</span>
                            </div>
                            <h4 className="font-bold text-slate-800 text-xs leading-snug line-clamp-1 mt-1">{c.title}</h4>
                            <p className="text-[10px] text-slate-500 mt-0.5">Client: {c.clientName}</p>
                            <div className="flex justify-between items-baseline mt-2">
                              <span className="text-[9px] font-bold text-indigo-600 block">Stage: {c.status}</span>
                              <span className="text-[9px] text-slate-400">PKR {c.estimatedFees.toLocaleString()}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Case detail space */}
                  <div className="lg:col-span-2 space-y-6">
                    {dbState.cases.find((c: any) => c.id === selectedCaseId) ? (() => {
                      const selCase = dbState.cases.find((c: any) => c.id === selectedCaseId);
                      return (
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 space-y-6">
                          
                          {/* Case Title block */}
                          <div className="flex justify-between items-start flex-wrap gap-4 border-b border-slate-100 pb-4">
                            <div className="space-y-1">
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full font-bold uppercase">{selCase.caseType} Matter</span>
                              <h2 className="text-base font-bold text-slate-900 mt-1">{selCase.title}</h2>
                              <p className="text-xs text-slate-500">Client: {selCase.clientName} ({selCase.clientType})</p>
                            </div>
                            <div className="flex gap-2">
                              <button onClick={() => handleGenerateCaseAiSummary(selCase.id)} className="flex items-center gap-1 bg-gradient-to-tr from-slate-950 to-indigo-950 text-white font-bold text-[10px] uppercase tracking-wide px-3 py-1.5 rounded-lg hover:shadow transition-all">
                                <Sparkles className="w-3.5 h-3.5 text-indigo-400 rotate-12" /> AI Summary Brief
                              </button>
                            </div>
                          </div>

                          {/* Info Parameters layout */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-150">
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Trial Court</span>
                              <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selCase.courtName}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Opposing Party</span>
                              <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selCase.opposingParty}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Filing Timestamp</span>
                              <span className="text-xs font-bold text-slate-700 mt-0.5 block">{selCase.filingDate}</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Outstanding Fees</span>
                              <span className="text-xs font-bold text-rose-600 mt-0.5 block">PKR {selCase.unpaidFees.toLocaleString()}</span>
                            </div>
                          </div>

                          {/* Matter summary and details */}
                          <div className="space-y-2">
                            <h4 className="font-bold text-slate-800 text-xs">Primary Brief Description:</h4>
                            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">{selCase.description}</p>
                          </div>

                          {/* Real-time Document OCR Repository & Version Control */}
                          <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                            
                            <div className="space-y-3">
                              <h4 className="font-bold text-slate-800 text-xs flex items-center justify-between">
                                <span>Matter Legal PDF Documents</span>
                                <span className="text-[9px] text-slate-400">OCR Scanned support on cloud</span>
                              </h4>
                              
                              <form onSubmit={handleUploadDocumentMock} className="flex gap-1.5">
                                <input
                                  type="text"
                                  value={documentUploadName}
                                  onChange={(e) => setDocumentUploadName(e.target.value)}
                                  placeholder="e.g. Sales_Tax_Ledger_2026.pdf"
                                  className="flex-1 text-xs border border-slate-200 px-3 py-1.5 rounded-lg focus:outline-none focus:border-indigo-600"
                                />
                                <button type="submit" className="px-3 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Upload</button>
                              </form>

                              <div className="space-y-1.5 divide-y divide-slate-100 max-h-[160px] overflow-y-auto">
                                {selCase.documents.map((d: any) => (
                                  <div key={d.id} className="pt-2 flex justify-between items-center text-xs">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-4 h-4 text-slate-400" />
                                      <div>
                                        <p className="text-xs text-slate-700 font-bold">{d.name}</p>
                                        <p className="text-[9px] text-slate-400">Version {d.version} • {d.uploadedAt} by {d.uploadedBy}</p>
                                      </div>
                                    </div>
                                    <button onClick={() => alert("Simulating native download of securely stored document file via sandbox storage.")} className="text-[10px] font-bold text-indigo-600 hover:underline">Preview</button>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Case History Timeline */}
                            <div className="space-y-3">
                              <h4 className="font-bold text-slate-800 text-xs">Case Lifecycle History</h4>
                              <div className="space-y-3 max-h-[200px] overflow-y-auto pl-2 border-l-2 border-slate-100">
                                {selCase.timeline.map((evt: any) => (
                                  <div key={evt.id} className="relative pl-4">
                                    <div className="absolute left-[calc(-16px-5px)] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                    <p className="text-xs font-bold text-slate-800">{evt.title}</p>
                                    <p className="text-[11px] text-slate-500 leading-snug">{evt.description}</p>
                                    <span className="text-[9px] text-slate-400 mt-0.5 block">{evt.date} • {evt.performedBy}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                          </div>

                          {/* AI Legal Note Notice Writer & Draft Creator panel */}
                          <div className="bg-slate-50 border border-slate-200/80 p-4 rounded-xl space-y-4">
                            <div className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-indigo-600" />
                              <h4 className="font-bold text-slate-800 text-xs">Gemini AI Document Builder & Correspondence Draft</h4>
                            </div>
                            <div className="grid sm:grid-cols-3 gap-3">
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Template</label>
                                <select value={draftingType} onChange={(e) => setDraftingType(e.target.value)} className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg">
                                  <option value="Appeal Groundings">Appeal Groundings (High Court)</option>
                                  <option value="Corporate SLA Contract">Contracts Clause Drafting</option>
                                  <option value="Demand Legal Notice">Exemption Representation (FBR)</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Target Client Name</label>
                                <input type="text" value={draftingClientName} onChange={(e) => setDraftingClientName(e.target.value)} className="w-full text-xs bg-white border border-slate-200 p-2 rounded-lg" />
                              </div>
                              <div className="flex items-end">
                                <button onClick={handleGenerateLegalDraftObj} className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-all">Submit AI Generation Prompt</button>
                              </div>
                            </div>
                            {draftLoading && <div className="text-xs text-indigo-600 animate-pulse">Running smart semantic draft computations with Gemini Flash...</div>}
                            {draftResult && (
                              <div className="space-y-2 mt-4">
                                <div className="flex justify-between items-baseline">
                                  <span className="text-[9px] font-semibold text-slate-400 uppercase">Outputs generated via Google Gemini:</span>
                                  <button onClick={() => { navigator.clipboard.writeText(draftResult); alert("Copied to clipboard."); }} className="text-xs text-indigo-600 hover:underline">Copy Draft Context</button>
                                </div>
                                <pre className="p-3 bg-white border border-slate-200 text-[10px] leading-relaxed text-slate-700 rounded-lg overflow-x-auto whitespace-pre-wrap">{draftResult}</pre>
                              </div>
                            )}
                          </div>

                        </div>
                      );
                    })() : (
                      <p className="text-xs text-slate-400 italic">No case selected.</p>
                    )}
                  </div>

                </div>
              )}

              {/* TAB 3: CLIENT CRM & LEADS PIPELINE */}
              {currentTab === "crm" && (
                <div id="crm-workspace" className="space-y-6">
                  
                  {/* Summary row */}
                  <div className="flex justify-between items-baseline bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">CRM Lead Pipelines & Conversion Funnel</h2>
                      <p className="text-xs text-slate-400">Leads funnel directly into matching team assignees for onboarding</p>
                    </div>
                    <button onClick={() => setActiveModal("create-lead")} className="flex items-center gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg">
                      <Plus size={14} /> New Lead Prospectus
                    </button>
                  </div>

                  {/* Kanban Pipeline Column Board */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 overflow-x-auto pb-4">
                    
                    {/* Column 1: New (Facebook, Walkins) */}
                    <div className="p-3 bg-slate-100 rounded-xl space-y-3 min-w-[250px] border border-slate-200">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">New Leads</span>
                        <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{dbState.leads.filter((l: any) => l.status === "New").length}</span>
                      </div>
                      <div className="space-y-2">
                        {dbState.leads.filter((l: any) => l.status === "New").map((lead: any) => (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className={`bg-white p-3 rounded-xl border transition-all space-y-2 cursor-pointer ${
                              selectedLeadId === lead.id ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-slate-400">{lead.source}</span>
                              <span className="text-sky-600">Score {lead.score}%</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{lead.notes}</p>
                            <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-slate-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateLeadStatus(lead.id, "Contacted") }}
                                className="text-[9px] font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 px-2 py-1 rounded transition-all"
                              >
                                Contact
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 2: Contacted / Processing */}
                    <div className="p-3 bg-slate-100 rounded-xl space-y-3 min-w-[250px] border border-slate-200">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Contacted</span>
                        <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{dbState.leads.filter((l: any) => l.status === "Contacted").length}</span>
                      </div>
                      <div className="space-y-2">
                        {dbState.leads.filter((l: any) => l.status === "Contacted").map((lead: any) => (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className={`bg-white p-3 rounded-xl border transition-all space-y-2 cursor-pointer ${
                              selectedLeadId === lead.id ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-slate-400">{lead.source}</span>
                              <span className="text-sky-600">Score {lead.score}%</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{lead.notes}</p>
                            <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-slate-100">
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateLeadStatus(lead.id, "Proposal") }}
                                className="text-[9px] font-bold text-white px-2 py-1 rounded transition-all"
                                style={{ backgroundColor: "#4f46e5" }}
                              >
                                Prepare SLA
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 3: Qualified / Proposal Sent */}
                    <div className="p-3 bg-slate-100 rounded-xl space-y-3 min-w-[250px] border border-slate-200">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Proposal / SLA</span>
                        <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{dbState.leads.filter((l: any) => l.status === "Proposal" || l.status === "Qualified").length}</span>
                      </div>
                      <div className="space-y-2">
                        {dbState.leads.filter((l: any) => l.status === "Proposal" || l.status === "Qualified").map((lead: any) => (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className={`bg-white p-3 rounded-xl border transition-all space-y-2 cursor-pointer ${
                              selectedLeadId === lead.id ? 'border-indigo-600 ring-2 ring-indigo-500/20 shadow-sm' : 'border-slate-200 hover:border-slate-400'
                            }`}
                          >
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-slate-400">{lead.source}</span>
                              <span className="text-indigo-600">Score {lead.score}%</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            {lead.company && <p className="text-[10px] text-indigo-750 font-bold">{lead.company}</p>}
                            <p className="text-[10px] text-slate-500 line-clamp-2">{lead.notes}</p>
                            <div className="flex justify-between gap-1 mt-3 pt-2 border-t border-slate-100">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setNewCase({
                                    title: `Corporate SLA with ${lead.name}`,
                                    clientName: lead.name,
                                    clientType: "Corporate",
                                    caseType: "Contracts",
                                    priority: "High",
                                    description: lead.notes,
                                    estimatedFees: 350000
                                  });
                                  handleUpdateLeadStatus(lead.id, "Won");
                                  setCurrentTab("cases");
                                  alert(`Success! Prospect converted directly to operational case ledger and designated Level 2 Partner oversight.`);
                                }}
                                className="text-[9px] font-bold bg-emerald-600 text-white hover:bg-emerald-700 px-2 py-1 rounded transition-all"
                              >
                                Convert to Case
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); handleUpdateLeadStatus(lead.id, "Lost") }}
                                className="text-[9px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded transition-all"
                              >
                                Lost
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Column 4: Won Matters */}
                    <div className="p-3 bg-slate-100 rounded-xl space-y-3 min-w-[250px] border border-slate-200">
                      <div className="flex justify-between items-baseline">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Won / Cases Onboard</span>
                        <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">{dbState.leads.filter((l: any) => l.status === "Won").length}</span>
                      </div>
                      <div className="space-y-2">
                        {dbState.leads.filter((l: any) => l.status === "Won").map((lead: any) => (
                          <div
                            key={lead.id}
                            onClick={() => setSelectedLeadId(lead.id)}
                            className={`bg-white p-3 rounded-xl border transition-all space-y-1 cursor-pointer hover:border-slate-400 ${
                              selectedLeadId === lead.id ? 'border-emerald-600 ring-2 ring-emerald-500/20 shadow-sm' : 'opacity-80 border-slate-200'
                            }`}
                          >
                            <h4 className="text-xs font-bold text-emerald-700">✓ Onboard Successful</h4>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            <p className="text-[9px] text-slate-400">{lead.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                  {/* Selected Lead details sidebar/drawer (ID: inspected-lead-sidebar) */}
                  {selectedLeadId && (() => {
                    const lead = dbState.leads.find((l: any) => l.id === selectedLeadId);
                    if (!lead) return null;
                    
                    const activityLogs = [
                      { id: "log-1", date: lead.createdAt || "2026-06-01", event: "Prospect added to CRM database", author: "Areesha", description: `Source channel: ${lead.source}` },
                      { id: "log-2", date: lead.createdAt || "2026-06-01", event: "Assigned for onboarding follow-up", author: "Hamid", description: "Transferred ownership responsibility to Agent Areesha (ID: 12)" },
                      { id: "log-3", date: new Date().toISOString().split('T')[0], event: `Status updated to ${lead.status}`, author: "Sarosh Sultan", description: "Updated pipeline phase in the global operational ledgers." }
                    ];

                    const filteredLogs = activityLogs.filter(log => {
                      const q = leadHistorySearch.toLowerCase();
                      return log.event.toLowerCase().includes(q) || 
                             log.author.toLowerCase().includes(q) || 
                             log.description.toLowerCase().includes(q) ||
                             log.date.includes(q);
                    });

                    return (
                      <div
                        id="inspected-lead-sidebar"
                        className="
                          fixed z-50 bg-white border-slate-200 shadow-2xl flex flex-col transition-all duration-300
                          inset-0 top-14 md:inset-y-0 md:top-0 md:left-auto md:right-0 md:w-96 md:h-full md:border-l border-t md:border-t-0 p-6 md:p-5 space-y-5 overflow-y-auto overflow-x-hidden w-full
                        "
                      >
                        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                          <div>
                            <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">Interactive Inspector</span>
                            <h3 className="text-sm font-bold text-slate-850 mt-1">{lead.name}</h3>
                            {lead.company && <p className="text-[10px] text-slate-500 font-medium">{lead.company}</p>}
                          </div>
                          <button
                            onClick={() => setSelectedLeadId(null)}
                            className="p-3 md:p-1.5 hover:bg-slate-100 rounded-xl text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-all cursor-pointer"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* General details group */}
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-150 space-y-2">
                          <div className="grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-slate-400 block font-semibold uppercase text-[8px]">Priority Level</span>
                              <span className="font-bold text-slate-700 capitalize">{lead.priority}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold uppercase text-[8px]">Opportunity Score</span>
                              <span className="font-bold text-indigo-700">{lead.score || 72}%</span>
                            </div>
                          </div>
                          <div className="border-t border-slate-200/60 pt-2 grid grid-cols-2 gap-2 text-[10px]">
                            <div>
                              <span className="text-slate-400 block font-semibold uppercase text-[8px]">Phone Number</span>
                              <span className="font-semibold text-slate-700">{lead.phone || "No phone"}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 block font-semibold uppercase text-[8px]">Email Address</span>
                              <a href={`mailto:${lead.email}`} className="font-semibold text-indigo-600 block truncate">{lead.email || "No email"}</a>
                            </div>
                          </div>
                          {lead.notes && (
                            <div className="border-t border-slate-200/60 pt-2 text-[10px]">
                              <span className="text-slate-400 block font-semibold uppercase text-[8px]">Prospect Notes</span>
                              <p className="text-slate-600 leading-relaxed mt-0.5">{lead.notes}</p>
                            </div>
                          )}
                        </div>

                        {/* History & Activities log partition with Search Input block */}
                        <div className="space-y-3 flex-1 flex flex-col min-h-[220px]">
                          <div className="flex justify-between items-center">
                            <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Activity Logs & Audit History</h4>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-1.5 rounded">{filteredLogs.length} events</span>
                          </div>

                          {/* Search Logs Field (keyword or author query) */}
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 pointer-events-none">
                              <Search size={12} className="text-slate-400" />
                            </span>
                            <input
                              type="text"
                              value={leadHistorySearch}
                              onChange={(e) => setLeadHistorySearch(e.target.value)}
                              placeholder="Filter logs by keyword or author (e.g. Areesha)"
                              className="w-full text-[11px] bg-slate-50 border border-slate-250 pl-7 py-2 pr-2.5 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white text-slate-700"
                            />
                          </div>

                          {/* Log List */}
                          <div className="space-y-2 flex-1 overflow-y-auto max-h-[280px]">
                            {filteredLogs.length > 0 ? (
                              filteredLogs.map(log => (
                                <div key={log.id} className="border-l-2 border-indigo-600 pl-3 py-1 space-y-1">
                                  <div className="flex justify-between items-baseline text-[9px]">
                                    <span className="font-bold text-indigo-600">{log.event}</span>
                                    <span className="text-slate-400">{log.date}</span>
                                  </div>
                                  <p className="text-[10px] text-slate-600 leading-snug">{log.description}</p>
                                  <p className="text-[8px] font-medium text-slate-400 italic">Author responsibility: {log.author}</p>
                                </div>
                              ))
                            ) : (
                              <p className="text-[10px] text-slate-400 italic text-center py-4">No matching activity log entry found.</p>
                            )}
                          </div>
                        </div>

                        {/* Convert Call-To-Action Button Row */}
                        <div className="pt-2 border-t border-slate-100 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedLeadId(null);
                              alert("Testing call router connection... Dialing leads is active.");
                            }}
                            className="flex-1 py-1.5 bg-slate-100 font-semibold text-slate-700 border border-slate-200 text-[10px] text-center rounded-lg hover:bg-slate-200"
                          >
                            Close Overlay
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              )}

              {/* TAB 4: TASK BOARD */}
              {currentTab === "tasks" && (
                <div id="tasks-workspace" className="space-y-6">
                  
                  <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
                    <div>
                      <h2 className="text-base font-bold text-slate-900">Law Firm Workflow & Task Assignment</h2>
                      <p className="text-xs text-slate-400 md:block hidden">Check task queues matching your strict active RBAC hierarchical visibility</p>
                    </div>
                    <button onClick={() => setActiveModal("create-task")} className="flex items-center gap-1 text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-3 py-2 rounded-lg">
                      <Plus size={14} /> Assign New Task
                    </button>
                  </div>

                  {/* Task Management Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {["To Do", "In Progress", "Review", "Done"].map((colTitle) => (
                      <div key={colTitle} className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-3 min-h-[400px]">
                        <div className="flex justify-between items-baseline">
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{colTitle}</span>
                          <span className="text-xs bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded-full">
                            {dbState.tasks.filter((t: any) => t.status === colTitle).length}
                          </span>
                        </div>
                        <div className="space-y-2">
                          {dbState.tasks.filter((t: any) => t.status === colTitle).map((task: any) => (
                            <div key={task.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2 hover:shadow-sm transition-all relative">
                              <span className={`text-[8px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                                task.priority === 'Critical' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100'
                              }`}>{task.priority}</span>
                              <h4 className="text-xs font-bold text-slate-800 line-clamp-1 mt-1">{task.title}</h4>
                              <p className="text-[11px] text-slate-500 line-clamp-2">{task.description}</p>
                              
                              <p className="text-[9px] text-slate-400 font-semibold mt-2 block">
                                Assignee: {dbState.allUsers.find((u: any) => u.id === task.assignedTo)?.name || "Unassigned"}
                              </p>
                              
                              <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100 text-xs">
                                <select
                                  value={task.status}
                                  onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)}
                                  className="text-[9px] font-bold bg-slate-50 text-slate-600 border px-1.5 py-0.5 rounded"
                                >
                                  <option value="To Do">To Do</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Review">Review</option>
                                  <option value="Done">Done</option>
                                </select>
                                {activeUserId === "2" && (
                                  <button onClick={() => handleDeleteTask(task.id)} className="text-rose-600 p-1 hover:bg-rose-50 rounded">
                                    <Trash2 size={12} />
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                  </div>

                </div>
              )}

              {/* TAB 5: ATTENDANCE & HR */}
              {currentTab === "attendance" && (
                <div id="attendance-workspace" className="space-y-6">
                  
                  {/* Punch Dashboard */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Simulator check-in */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                      <div>
                        <h3 className="font-bold text-slate-800 text-sm">Geofence GPS Reporting Station</h3>
                        <p className="text-xs text-slate-400">Mark daily attendance. Limits apply inside office boundary radius.</p>
                      </div>

                      {gpsSupported && gpsLatitude && gpsLongitude ? (
                        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-700 text-xs flex items-center gap-2">
                          <MapPin size={16} />
                          <span>Office boundaries matched. coordinates mapped: {gpsLatitude.toFixed(4)}, {gpsLongitude.toFixed(4)}</span>
                        </div>
                      ) : (
                        <div className="p-3 bg-amber-50 rounded-lg text-amber-700 text-xs flex items-center gap-2">
                          <AlertCircle size={16} />
                          <span>Acquiring mobile GPS parameters... Using simulator proxy defaults.</span>
                        </div>
                      )}

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Lateness Reasoning (Required if checking in after 10:45 AM)</label>
                        <textarea
                          value={lateExplanation}
                          onChange={(e) => setLateExplanation(e.target.value)}
                          placeholder="e.g. Traffic bottleneck at Registry office..."
                          className="w-full text-xs border border-slate-200 p-2 rounded-lg focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button onClick={handleGpsCheckInPunched} className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all">Punch Duty IN</button>
                        <button onClick={handleCheckOutPunched} className="px-4 py-2 border border-slate-200 text-slate-700 font-bold text-xs rounded-lg transition-all" >OUT</button>
                      </div>

                      {checkinSuccessMsg && (
                        <p className="text-xs text-indigo-600 font-semibold bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">{checkinSuccessMsg}</p>
                      )}
                    </div>

                    {/* Team overview roster context */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4 lg:col-span-2">
                      <div className="flex justify-between items-baseline">
                        <h3 className="font-bold text-slate-800 text-sm">Today’s Active Duty Ledger</h3>
                        <span className="text-[10px] font-bold text-slate-400">Total Staff: {dbState.allUsers.length}</span>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-slate-600">
                          <thead>
                            <tr className="border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              <th className="py-2">Employee</th>
                              <th className="py-2">Punch IN</th>
                              <th className="py-2">Punch OUT</th>
                              <th className="py-2">Status</th>
                              <th className="py-2">Geofence Pass</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {dbState.attendance.map((a: any) => (
                              <tr key={a.id} className="hover:bg-slate-50/50">
                                <td className="py-2 font-bold text-slate-700">{a.userName}</td>
                                <td className="py-2">{a.checkInTime}</td>
                                <td className="py-2">{a.checkOutTime || "—"}</td>
                                <td className="py-2">
                                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                                    a.status === 'Present' ? 'bg-emerald-100 text-emerald-700' :
                                    a.status === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                  }`}>{a.status}</span>
                                </td>
                                <td className="py-2">{a.geofencePassed ? "✓ Handled" : "HR entry"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                  </div>

                  {/* Operational Management Workspace exclusively for Hamid (HR) */}
                  {activeUserId === "7" && (
                    <div className="bg-white p-5 rounded-2xl border-2 border-indigo-100/80 space-y-6">
                      <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full inline-block">HR Administration Unit Only</span>
                          <h3 className="font-bold text-slate-900 text-base mt-2">Manage Non-Computer Employee Salaries & Attendance Vouchers</h3>
                        </div>
                        <span className="text-xs font-bold text-slate-500">Petty Cash Storage: PKR {dbState.pettyCash.toLocaleString()}</span>
                      </div>

                      {/* Manual mark elements */}
                      <div className="grid md:grid-cols-2 gap-6">
                        
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-800 text-xs">Direct Non-System Attendance Punch (Shiraz, Waseem, Zeeshans)</h4>
                          <div className="space-y-2 divide-y divide-slate-100">
                            {dbState.allUsers.filter((u: any) => u.level === 5).map((nonUser: any) => (
                              <div key={nonUser.id} className="pt-2 flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-bold text-slate-700">{nonUser.name}</p>
                                  <p className="text-[10px] text-slate-400">{nonUser.department}</p>
                                </div>
                                <div className="flex gap-1">
                                  <button onClick={() => handleManualAttendancePunch(nonUser.id, nonUser.name, "Present")} className="px-2 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-semibold text-[10px] rounded">Present</button>
                                  <button onClick={() => handleManualAttendancePunch(nonUser.id, nonUser.name, "Absent")} className="px-2 py-1 bg-rose-100 hover:bg-rose-200 text-rose-800 font-semibold text-[10px] rounded">Absent</button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Monthly payroll and payout voucher management */}
                        <div className="space-y-3">
                          <h4 className="font-bold text-slate-800 text-xs text-indigo-700 uppercase">Process Partner & Rider Payroll Disbursements</h4>
                          <div className="space-y-2">
                            {dbState.allUsers.filter((u: any) => ["STAFF", "NON_SYSTEM", "SENIOR_STAFF"].includes(u.role)).map((pUser: any) => (
                              <div key={pUser.id} className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex justify-between items-center text-xs">
                                <div>
                                  <p className="font-bold text-slate-800">{pUser.name}</p>
                                  <p className="text-[10px] text-slate-400">Base: PKR {pUser.baseSalary.toLocaleString()}/month</p>
                                </div>
                                <button onClick={() => handlePaySalarySlip(pUser.id, pUser.name, pUser.baseSalary)} className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg">Pay Slip Voucher</button>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              )}

              {/* TAB 6: WHATSAPP-STYLE COMMUNICATION HUB */}
              {currentTab === "chat" && (
                <div id="communications-chat-workspace" className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex h-[500px]">
                  
                  {/* Left Chat Roster Drawer */}
                  <div className="w-80 border-r border-slate-200 flex flex-col flex-shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center flex-shrink-0">
                      <div>
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">LegalOps Threads</h3>
                        <p className="text-[10px] text-slate-400">WhatsApp & System Channels</p>
                      </div>
                      <span className="text-[8px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold uppercase">Online Hub</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-1 p-2">
                      {dbState.chats.map((c: any) => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedChatId(c.id)}
                          className={`w-full text-left p-3 rounded-xl border flex flex-col gap-1.5 transition-all ${
                            selectedChatId === c.id ? 'border-emerald-600 bg-emerald-50/20' : 'border-slate-50 hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex justify-between items-baseline">
                            <h4 className="font-bold text-slate-800 text-xs line-clamp-1 flex-1">{c.name}</h4>
                            <span className="text-[9px] text-slate-400">11:15 AM</span>
                          </div>
                          <div className="flex justify-between items-center text-[10px] text-slate-500">
                            <span className="line-clamp-1 flex-1">{c.lastMessageText || "No messages."}</span>
                            {c.unreadCount > 0 && (
                              <span className="w-4 h-4 bg-emerald-600 text-white text-[8px] font-bold flex items-center justify-center rounded-full ml-1 flex-shrink-0">{c.unreadCount}</span>
                            )}
                          </div>
                          {c.isExternalWhatsApp && (
                            <span className="text-[8px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded w-fit">Integrated Client Whatsapp Stream</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Center Chat Timeline Balloon Stream */}
                  {dbState.chats.find((c: any) => c.id === selectedChatId) ? (() => {
                    const activeChat = dbState.chats.find((c: any) => c.id === selectedChatId);
                    return (
                      <div className="flex-1 flex flex-col bg-slate-50">
                        {/* Selected Thread Title Header */}
                        <div className="p-4 bg-white border-b border-slate-100 flex justify-between items-center flex-shrink-0">
                          <div>
                            <h3 className="font-bold text-slate-800 text-xs">{activeChat.name}</h3>
                            <p className="text-[9px] text-emerald-600 font-semibold uppercase tracking-wider mt-0.5">Dual-mode system transmission active</p>
                          </div>
                        </div>

                        {/* Balloon Timeliner Panel */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {dbState.messages.filter((m: any) => m.chatId === selectedChatId).map((msg: any) => {
                            const isSelf = msg.senderId === activeUserId;
                            return (
                              <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs md:max-w-md p-3 rounded-2xl relative shadow-sm ${
                                  isSelf ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white text-slate-800 rounded-tl-none border border-slate-200'
                                }`}>
                                  {!isSelf && <span className="text-[8px] font-extrabold tracking-tight uppercase text-indigo-600 block mb-1">{msg.senderName}</span>}
                                  <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                                  <span className={`text-[8px] block text-right mt-1.5 opacity-60`}>
                                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Text Message submit form */}
                        <form onSubmit={handleSendChatMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2 items-center flex-shrink-0">
                          <button type="button" onClick={() => alert("Attachment preview options loaded: Scan, Photo receipt, PDF.")} className="p-2 hover:bg-slate-50 text-slate-400 rounded-lg">
                            <Paperclip size={16} />
                          </button>
                          <input
                            type="text"
                            value={chatMessageText}
                            onChange={(e) => setChatMessageText(e.target.value)}
                            placeholder="Salam! Draft response or attach documents here..."
                            className="flex-1 text-xs border border-slate-200 px-3.5 py-2.5 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50"
                          />
                          <button type="submit" className="p-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all">
                            <Send size={15} />
                          </button>
                        </form>
                      </div>
                    );
                  })() : (
                    <p className="text-xs text-slate-400 italic">No communication thread selected.</p>
                  )}

                </div>
              )}

              {/* TAB 7: FINANCES, INVOICING & OFFICE PETTY CASH */}
              {currentTab === "finances" && (
                <div id="finances-workspace" className="space-y-6">
                  
                  {/* Revenue row statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Firm Petty-Cash Safe Balance</span>
                      <span className="text-2xl font-bold text-slate-900 mt-2 block">PKR {dbState.pettyCash.toLocaleString()}</span>
                      <p className="text-[10px] text-slate-400 mt-1">Settled automatically on small logistics and rider refueling costs</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Active Cumulative Receivables</span>
                      <span className="text-2xl font-bold text-slate-950 mt-2 block">
                        PKR {dbState.invoices.reduce((acc: number, item: any) => item.status !== "Paid" ? acc + item.amount : acc, 0).toLocaleString()}
                      </span>
                      <p className="text-[10px] text-indigo-600 font-bold mt-1">Includes WhatsApp late notices automations</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Stripe Subscription Node Token</span>
                      <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-1 rounded w-fit mt-1">Enterprise active status </span>
                      <span className="text-[10px] text-slate-400 mt-1">Auto-recurring $25/user/month for LegalOps support</span>
                    </div>
                  </div>

                  {/* Ledger lists split */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    
                    {/* Invoice tracker ledger */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Client Invoices & Settlement Matrix</h3>
                        <button onClick={() => setActiveModal("create-invoice")} className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg">
                          <Plus size={14} /> Invoice Gen
                        </button>
                      </div>

                      <div className="space-y-3 divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                        {dbState.invoices.map((iv: any) => (
                          <div key={iv.id} className="pt-3 flex justify-between items-center text-xs">
                            <div className="space-y-1">
                              <p className="font-bold text-slate-800">{iv.invoiceNumber}</p>
                              <p className="text-[10px] text-slate-500">Client: {iv.clientName}</p>
                              <p className="text-[9px] text-slate-400">Due Date: {iv.dueDate} • PKR {iv.amount.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-bold px-1.5 rounded uppercase ${
                                iv.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                              }`}>{iv.status}</span>
                              {iv.status !== "Paid" && (
                                <button onClick={() => handlePayInvoiceMock(iv.id)} className="px-2.5 py-1 text-white bg-indigo-600 hover:bg-indigo-700 text-[10px] font-bold rounded">Record Pay</button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Operational expenditures log */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 space-y-4">
                      <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Firm Expenditures Logs</h3>
                        <button onClick={() => setActiveModal("log-expense")} className="p-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg">
                          <Plus size={14} /> Log Cost
                        </button>
                      </div>

                      <div className="space-y-3 divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-1">
                        {dbState.expenses.map((e: any) => (
                          <div key={e.id} className="pt-3 flex justify-between items-center text-xs">
                            <div>
                              <p className="font-bold text-slate-800">{e.description}</p>
                              <p className="text-[10px] text-indigo-600 font-semibold">{e.category}</p>
                              <p className="text-[9px] text-slate-400">{e.date}</p>
                            </div>
                            <span className="font-bold text-rose-600">PKR {e.amount.toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 8: CUSTOM BI REPORT BUILDER PLATFORM */}
              {currentTab === "reports" && (
                <div id="bi-report-builder-workspace" className="space-y-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                  
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Custom Power-BI Level Analytics & scheduled templates</h2>
                    <p className="text-xs text-slate-400">Construct complex analytical aggregations and automate deliverables</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6 pt-4 border-t border-slate-100">
                    
                    {/* Left builders Form */}
                    <div className="space-y-4">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider text-indigo-700">Analytics Parameter Panel</h3>
                      
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 block uppercase">Report Label Option</label>
                        <input
                          type="text"
                          value={customReport.title}
                          onChange={(e) => setCustomReport({ ...customReport, title: e.target.value })}
                          className="w-full text-xs border border-slate-200 p-2.5 rounded-lg focus:outline-none focus:border-indigo-600"
                        />
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 block uppercase">Aggregation Metric Form</label>
                        <select
                          value={customReport.metric}
                          onChange={(e) => setCustomReport({ ...customReport, metric: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                        >
                          <option value="Tasks Count">Cumulative Task Distribution</option>
                          <option value="Revenue Sum">Cumulative Revenue Weighting</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 block uppercase">Split Dimension (Group By)</label>
                        <select
                          value={customReport.groupBy}
                          onChange={(e) => setCustomReport({ ...customReport, groupBy: e.target.value })}
                          className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg"
                        >
                          <option value="priority">Task Priorities</option>
                          <option value="status">Matter Status</option>
                        </select>
                      </div>

                      <div className="flex gap-2">
                        <button onClick={runBIReportCalculation} className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow transition-all">Compute Aggregate Outputs</button>
                      </div>
                    </div>

                    {/* Right aggregations outcome space */}
                    <div className="md:col-span-2 bg-slate-50 p-5 rounded-2xl border border-slate-250/60 min-h-[300px] flex flex-col justify-between">
                      {biReportOutput ? (
                        <div className="space-y-5">
                          <div className="flex justify-between items-baseline border-b border-slate-200 pb-3">
                            <h4 className="font-bold text-slate-800 text-xs">{customReport.title}</h4>
                            <span className="text-[9px] text-slate-400">Generated: {biReportOutput.generatedAt}</span>
                          </div>

                          {/* Computed Data table */}
                          <div className="space-y-2">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Aggregations Matrix output</span>
                            <div className="overflow-x-auto bg-white border border-slate-200 rounded-xl p-3">
                              <table className="w-full text-left text-xs">
                                <thead>
                                  <tr className="border-b text-[10px] uppercase text-slate-400 font-bold">
                                    <th className="py-1">Group Dimension</th>
                                    <th className="py-1 text-center">Cumulative Load</th>
                                    <th className="py-1 text-right">Revenue Weighted Estimation</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {biReportOutput.data.map((row: any, index: number) => (
                                    <tr key={index} className="border-b last:border-0">
                                      <td className="py-2 font-bold text-slate-700 capitalize">{row.group}</td>
                                      <td className="py-2 text-center">{row.value} files</td>
                                      <td className="py-2 text-right text-indigo-600 font-bold">PKR {row.revenueWeighted.toLocaleString()}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>

                          {/* AI Interpretation text via Gemini */}
                          <div className="p-3 bg-indigo-950 text-indigo-200 rounded-xl space-y-1.5">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-300">Google Gemini AI Performance Assessment:</p>
                            <p className="text-xs leading-relaxed">{biReportOutput.aiInterpretation}</p>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button onClick={() => alert("Scheduled email and WhatsApp report distribution updated on system cron pipeline.")} className="px-3 py-1.5 border border-slate-300 text-slate-700 font-bold text-[10px] rounded-lg bg-white flex items-center gap-1">
                              <Share2 size={12} /> Scheduled Delivery Node
                            </button>
                          </div>

                        </div>
                      ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 italic">
                          <BarChart3 className="w-12 h-12 text-slate-300 mb-2" />
                          <p className="text-xs">Select metrics and group splitting parameters on the builder panel to compile analytical Power-BI representations.</p>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 9: SECURITY & DATA CONSOLE */}
              {currentTab === "admin" && (
                <div id="admin-workspace" className="space-y-6 animate-fade-in">
                  
                  {/* Global System Banner */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-indigo-900 text-white p-6 rounded-2xl shadow-xl space-y-4 md:space-y-0 border border-indigo-950/40">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-indigo-300">Production Mode Credentials verified</span>
                      </div>
                      <h2 className="text-xl font-bold mt-1 tracking-tight">Security & Admin Control Console</h2>
                      <p className="text-xs text-indigo-150 max-w-xl mt-1">Central administrative ledger management system for Associate Partner Advocate Muhammad Sarosh Sultan. Securely manage actual firm practitioners, wipe testing records, or reindex structural search indexes.</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="bg-indigo-850/80 px-4 py-2.5 rounded-xl border border-indigo-750/50 text-right">
                        <span className="block text-[8px] uppercase tracking-wider text-indigo-350 font-bold">Active Principal:</span>
                        <span className="font-mono text-xs font-bold text-emerald-300">ADMINISTRATIVE_LEVEL_2</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Panel 1: User Management & Firm Hierarchy (2 cols on large screen) */}
                    <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-6 flex flex-col justify-between">
                      <div className="space-y-4">
                        <div className="flex justify-between items-baseline border-b border-slate-100 pb-3">
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">System Users & Access Registry</h3>
                            <p className="text-[10px] text-slate-400 mt-0.5">Define access scopes, roles, and structural salary bands per operational level matching downstream visibility regulations.</p>
                          </div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">{(dbState.allUsers || []).length} Active Accounts</span>
                        </div>

                        {/* List Active Users */}
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b text-[9px] uppercase text-slate-400 font-bold">
                                <th className="py-2">Team Member</th>
                                <th className="py-2">System Level Scope</th>
                                <th className="py-2">Functional Department</th>
                                <th className="py-2 text-right">Payroll Band</th>
                                <th className="py-2 text-center">Operation</th>
                              </tr>
                            </thead>
                            <tbody>
                              {(dbState.allUsers || []).map((u: any) => (
                                <tr key={u.id} className="border-b last:border-0 hover:bg-slate-50/50">
                                  <td className="py-3 pr-2 font-semibold text-slate-800">
                                    <div className="flex flex-col">
                                      <span>{u.name}</span>
                                      <span className="text-[10px] font-normal text-slate-400 font-mono">{u.email}</span>
                                    </div>
                                  </td>
                                  <td className="py-3">
                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                                      u.level === 1 ? 'bg-amber-100 text-amber-800' :
                                      u.level === 2 ? 'bg-indigo-100 text-indigo-800' :
                                      u.level === 3 ? 'bg-sky-100 text-sky-800' :
                                      'bg-slate-150 text-slate-800 font-normal'
                                    }`}>
                                      Level {u.level}: {u.role}
                                    </span>
                                  </td>
                                  <td className="py-3 text-slate-600 font-medium text-[11px]">{u.department}</td>
                                  <td className="py-3 text-right font-mono font-bold text-slate-700">PKR {u.baseSalary?.toLocaleString()}</td>
                                  <td className="py-3 text-center">
                                    <button
                                      onClick={() => {
                                        setEditingUserId(u.id);
                                        setUserForm({
                                          name: u.name,
                                          role: u.role,
                                          level: u.level,
                                          department: u.department,
                                          email: u.email,
                                          phone: u.phone,
                                          baseSalary: u.baseSalary,
                                          clientId: u.clientId || "",
                                          password: u.password || "",
                                          assignedCaseId: u.assignedCaseId || ""
                                        });
                                      }}
                                      className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 px-2 py-1 rounded hover:bg-indigo-50 cursor-pointer"
                                    >
                                      Modify Code
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* User Entry / Editor Form */}
                      <form onSubmit={handleAdminSaveUser} className="bg-slate-50 p-4 rounded-xl border border-slate-205 space-y-4 mt-4">
                        <div className="flex items-center gap-2 border-b border-slate-200 pb-2 mb-2">
                          <UserCheck size={14} className="text-indigo-600" />
                          <h4 className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">{editingUserId ? "Edit Existing Personnel Node" : "Enroll New Office Associate Practitioner"}</h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Real Legal Name</label>
                            <input
                              type="text"
                              required
                              value={userForm.name}
                              onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                              placeholder="Advocate John Doe"
                              className="w-full text-xs border border-slate-200 p-2 rounded bg-white text-slate-700 font-semibold"
                            />
                          </div>
                          <div className="space-y-1 block md:col-span-2">
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Assigned Security Role & Hierarchy Tier</label>
                            <select
                              value={userForm.role}
                              onChange={(e) => {
                                const role = e.target.value;
                                let level = 4;
                                if (role === "PARTNER") level = 2;
                                if (role === "SENIOR_STAFF") level = 3;
                                if (role === "CLIENT") level = 5;
                                if (role === "NON_SYSTEM") level = 5;
                                setUserForm({ ...userForm, role, level });
                              }}
                              className="w-full text-xs border border-slate-200 p-2 rounded bg-white text-slate-750 font-semibold"
                            >
                              <option value="PARTNER">Level 2: PARTNER (Full Admin Access)</option>
                              <option value="SENIOR_STAFF">Level 3: SENIOR_STAFF (Supervision scope)</option>
                              <option value="STAFF">Level 4: STAFF (Designated workspace assignment)</option>
                              <option value="CLIENT">Level 5: CLIENT (Client Portal Account - Strictly isolated case & invoices view)</option>
                              <option value="NON_SYSTEM">Level 5: NON_SYSTEM (Riders & Operational Staff - Managed entirely by Hamid)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Administrative Department</label>
                            <select
                              value={userForm.department}
                              onChange={(e) => setUserForm({ ...userForm, department: e.target.value })}
                              className="w-full text-xs border border-slate-200 p-2 rounded bg-white text-slate-755 font-semibold"
                            >
                              <option value="Management">Global Management & Litigation</option>
                              <option value="Direct Sales Department">Contracts & Drafting Department</option>
                              <option value="Tax Department">Sales Tax & Withholding Department</option>
                              <option value="Corporate Department">SECP Compliance Department</option>
                              <option value="Accounts Department">Finance & Accounts Department</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Personal Email Address</label>
                            <input
                              type="email"
                              required
                              value={userForm.email}
                              onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                              placeholder="sarosh.sultan@legalops.pro"
                              className="w-full text-xs border border-slate-200 p-2 rounded bg-white text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Phone Number Line</label>
                            <input
                              type="text"
                              required
                              value={userForm.phone}
                              onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                              placeholder="+92 300 1234567"
                              className="w-full text-xs border border-slate-200 p-2 rounded bg-white text-slate-700"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 block uppercase">Allocated Salary Band (PKR / Month)</label>
                            <input
                              type="number"
                              required
                              value={userForm.baseSalary}
                              onChange={(e) => setUserForm({ ...userForm, baseSalary: Number(e.target.value) })}
                              placeholder="120000"
                              className="w-full text-xs border border-slate-200 p-2 rounded bg-white text-slate-700"
                            />
                          </div>
                        </div>

                        {/* Credentials & Client Assignment Grid */}
                        <div className="bg-slate-100 p-3.5 rounded-xl border border-slate-200 space-y-3">
                          <h4 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                            <span>🔑 Authentication Credentials & Target Assignment</span>
                            <span className="text-[9px] font-medium text-slate-400 lowercase">(required for logins)</span>
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 block uppercase">Login Username / Client ID</label>
                              <input
                                type="text"
                                required
                                value={userForm.clientId || ""}
                                onChange={(e) => setUserForm({ ...userForm, clientId: e.target.value })}
                                placeholder="e.g. hbl-client or sarosh"
                                className="w-full text-xs border border-slate-200 p-2.5 rounded bg-white text-slate-800 font-bold"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 block uppercase">Access Password</label>
                              <input
                                type="text"
                                required
                                value={userForm.password || ""}
                                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                                placeholder="Type secret password"
                                className="w-full text-xs border border-slate-200 p-2.5 rounded bg-white text-slate-800"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold text-slate-500 block uppercase">Assigned Litigation Case (Optional for Client)</label>
                              <select
                                value={userForm.assignedCaseId || ""}
                                onChange={(e) => setUserForm({ ...userForm, assignedCaseId: e.target.value })}
                                className="w-full text-xs border border-slate-200 p-2.5 rounded bg-white text-slate-850 font-semibold"
                              >
                                <option value="">-- No specific mapping (full access) --</option>
                                {(dbState.cases || []).map((c: any) => (
                                  <option key={c.id} value={c.id}>{c.title} ({c.id})</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 justify-end pt-2">
                          {editingUserId && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUserId(null);
                                setUserForm({ name: "", role: "STAFF", level: 4, department: "Drafting Department", email: "", phone: "", baseSalary: 55000 });
                              }}
                              className="px-4 py-2 border border-slate-300 text-slate-600 font-bold text-xs rounded-lg bg-white cursor-pointer hover:bg-slate-100"
                            >
                              Reject Edits
                            </button>
                          )}
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-colors shadow shadow-indigo-100 cursor-pointer"
                          >
                            {editingUserId ? "Commit Structural Overrides" : "Enroll Personnel Associate"}
                          </button>
                        </div>
                      </form>
                    </div>

                    {/* Panel 2: System Data operations & purgers */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-6">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-sm font-sans tracking-tight">Database Administration Desk</h3>
                        <p className="text-[10px] text-slate-400 mt-0.5 font-sans">Enforce absolute compliance schemas. Safe data manipulation operations.</p>
                      </div>

                      {/* Diagnostic status block */}
                      <div className="bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-200/80 space-y-1 text-xs">
                        <div className="flex justify-between font-bold">
                          <span>Data Sanitization Score:</span>
                          <span>100% SECURE</span>
                        </div>
                        <p className="text-[10px] text-emerald-700/90 leading-snug">All default micro-simulations and demo pipelines were purged completely. Zero fabricated tables discovered.</p>
                      </div>

                      {/* Operation 1: Purge dry clean */}
                      <div className="space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-150-80">
                        <h4 className="text-[11px] font-bold text-rose-800 flex items-center gap-1">
                          <Trash2 size={13} className="text-rose-600" /> Wipe Dummy Ledger & Purge
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans">Runs dynamic query optimization matching the **DATA SANITIZATION / PRODUCTION** instruction. Permanently deletes mock files, demo transactions, and leads from memory registries.</p>
                        <button
                          onClick={handleAdminResetData}
                          className="w-full py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center focus:outline-none cursor-pointer"
                        >
                          Execute Sanitization Dry-Clean
                        </button>
                      </div>

                      {/* Operation 2: Restore snapshot backup */}
                      <div className="space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-150-80">
                        <h4 className="text-[11px] font-bold text-amber-800 flex items-center gap-1">
                          <FileSpreadsheet size={13} className="text-amber-600" /> Snapshot Backup / Restore
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-sans">Restore previous pre-sanitization demo cases, documents repository, and billing ledger. Excellent for sandbox walkthroughs or partner assessments.</p>
                        <button
                          onClick={handleAdminRestoreBackup}
                          className="w-full py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center focus:outline-none cursor-pointer"
                        >
                          Rollback to Backup Snapshot
                        </button>
                      </div>

                      {/* Operation 3: Rebuild search models */}
                      <div className="space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-150-80">
                        <h4 className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Sparkles size={13} className="text-indigo-600" /> Rebuild Search Index
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans">Reconstruct core natural language vectors to support real-time scanning of client data and matters timeline safely.</p>
                        <button
                          onClick={handleAdminRebuildIndex}
                          className="w-full py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center focus:outline-none cursor-pointer"
                        >
                          Trigger Index Realignment
                        </button>
                      </div>

                      {/* Operation 4: Flush reports cache */}
                      <div className="space-y-2.5 p-4 bg-slate-50 rounded-xl border border-slate-150-80">
                        <h4 className="text-[11px] font-bold text-indigo-800 flex items-center gap-1">
                          <BarChart3 size={13} className="text-indigo-600" /> Purge Analytics Cache
                        </h4>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-sans font-sans">Invalidate cached aggregate metrics reporting tables. This forces immediate evaluation of live production records only.</p>
                        <button
                          onClick={handleAdminRefreshReports}
                          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm transition-all text-center focus:outline-none cursor-pointer"
                        >
                          Refresh BI Analytic Nodes
                        </button>
                      </div>

                      {/* Operation 5: Spreadsheet Loader & JSON backup override */}
                      <div className="space-y-4 p-5 bg-indigo-50/70 rounded-2xl border-2 border-dashed border-indigo-200">
                        <div>
                          <h4 className="text-[12px] font-extrabold text-indigo-900 flex items-center gap-1.5 uppercase font-sans tracking-wide">
                            <Database size={14} className="text-indigo-600" /> Excel/CSV & JSON Database Uploader
                          </h4>
                          <p className="text-[10px] text-slate-500 leading-relaxed mt-1">Upload an existing JSON state backup to overwrite, or load a CSV/Txt spreadsheet file of team members, clients, and credentials.</p>
                        </div>

                        {/* Drag and Drop Zone and File input picker */}
                        <div 
                          className={`border-2 border-dashed rounded-xl p-4 text-center transition-all ${
                            dragActive ? 'border-indigo-500 bg-indigo-100/50' : 'border-slate-300 bg-white hover:bg-slate-50'
                          }`}
                          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                          onDragLeave={() => setDragActive(false)}
                          onDrop={(e) => {
                            e.preventDefault();
                            setDragActive(false);
                            const file = e.dataTransfer.files?.[0];
                            if (file) readAndProcessDatabaseFile(file);
                          }}
                        >
                          <label className="cursor-pointer block space-y-2">
                            <Upload size={24} className="mx-auto text-indigo-500 animate-bounce" />
                            <div className="text-xs font-semibold text-slate-700">Drag & Drop spreadsheet or click to select</div>
                            <div className="text-[9px] text-slate-400">Supports .csv, .txt, or JSON database exports</div>
                            <input
                              type="file"
                              accept=".csv,.txt,.json"
                              onChange={handleDatabaseFileUpload}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Spreadsheet parsed visual check table */}
                        {importedPreviewUsers && importedPreviewUsers.length > 0 && (
                          <div className="space-y-3 bg-white p-3.5 rounded-xl border border-indigo-100 shadow-sm text-left">
                            <div className="flex justify-between items-center border-b border-indigo-50 pb-2">
                              <span className="text-xs font-bold text-indigo-900 flex items-center gap-1">
                                <UserCheck size={13} /> Review Loaded Spreadsheet rows
                              </span>
                              <span className="text-[10px] bg-indigo-100 text-indigo-700 font-extrabold px-2 py-0.5 rounded-full">{importedPreviewUsers.length} ready</span>
                            </div>

                            <div className="max-h-48 overflow-y-auto overflow-x-auto text-[10px]">
                              <table className="w-full text-left">
                                <thead>
                                  <tr className="border-b text-[8px] uppercase tracking-wider text-slate-400 font-extrabold">
                                    <th className="pb-1.5">Practitioner Name</th>
                                    <th className="pb-1.5">Security Role</th>
                                    <th className="pb-1.5">Target Username</th>
                                    <th className="pb-1.5">Secret Password</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                  {importedPreviewUsers.map((u, index) => (
                                    <tr key={index} className="text-slate-700 hover:bg-slate-50">
                                      <td className="py-1.5 pr-2 font-bold">{u.name}</td>
                                      <td className="py-1.5 pr-2">
                                        <span className="bg-slate-100 text-slate-700 text-[8px] px-1.5 font-bold rounded-md">{u.role}</span>
                                      </td>
                                      <td className="py-1.5 pr-2 font-mono text-indigo-600 font-bold">{u.clientId}</td>
                                      <td className="py-1.5 pr-2 font-mono text-slate-500">{u.password}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="flex gap-2 justify-end pt-1">
                              <button
                                type="button"
                                onClick={() => setImportedPreviewUsers(null)}
                                className="px-3 py-1.5 border border-slate-200 text-slate-500 text-[10px] font-bold rounded hover:bg-slate-50 cursor-pointer"
                              >
                                Revoke Clear
                              </button>
                              <button
                                type="button"
                                onClick={handleCommitImportedUsers}
                                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-bold rounded shadow cursor-pointer transition-all"
                              >
                                Commit & Give Access
                              </button>
                            </div>
                          </div>
                        )}
                        
                        {/* Download sample format utility */}
                        <div className="bg-slate-100/50 p-2.5 rounded-lg border border-slate-200/50 flex items-center justify-between text-left">
                          <span className="text-[9px] text-slate-500 font-medium">Need sample format? Click to download the excel template.</span>
                          <button
                            type="button"
                            onClick={() => {
                              const header = "ClientId,Password,Name,Role,Email,Phone,Salary,Department,AssignedCaseId\n";
                              const row1 = "hbl-chief,hbl123,Habib Bank Head,CLIENT,hbl@client.com,+92211111111,0,Client Litigations Portal,case-101\n";
                              const row2 = "nadir-advo,nadir123,Nadir Ali Shah,STAFF,nadir@legalopspro.com,+923009999999,65000,Drafting Department,\n";
                              const text = header + row1 + row2;
                              const blob = new Blob([text], { type: 'text/csv' });
                              const url = URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = "legalops_import_template.csv";
                              document.body.appendChild(a);
                              a.click();
                              document.body.removeChild(a);
                            }}
                            className="text-[9px] text-indigo-600 hover:underline font-extrabold cursor-pointer flex-shrink-0 ml-1"
                          >
                            Get Sample Template
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 10: SOCIAL MEDIA & POST SCHEDULING */}
              {currentTab === "social" && (
                <div id="social-workspace" className="space-y-6 animate-fade-in">
                  
                  {/* Header Banner */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-slate-900 text-white p-6 rounded-2xl shadow-xl space-y-4 md:space-y-0 border border-slate-950">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-indigo-400 animate-pulse"></span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-slate-400">Marketing & Campaign Scheduler</span>
                      </div>
                      <h2 className="text-xl font-bold mt-1 tracking-tight">Social Media Management & Digital Designer</h2>
                      <p className="text-xs text-slate-300 max-w-xl mt-1">Design corporate statutory digests, schedule multi-channel legal alerts, and leverage Gemini AI to draft engaging, legally accurate captions.</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setNewPostData({
                            title: "New Custom Campaign alert",
                            caption: "⚖️ Statutory compliance update... #LegalOps",
                            platforms: ["LinkedIn"],
                            status: "Draft",
                            scheduledTime: new Date(Date.now() + 86400000 * 2).toISOString().substring(0, 16),
                            image: "",
                            designConfig: {
                              theme: "Elegant Slate",
                              textColor: "#E2E8F0",
                              bgColor: "#1E293B",
                              heading: "STATUTORY TAX ADVISORY",
                              subheading: "Immediate Filings Under Review",
                              tagline: "LEGALOPS PRO CORPORATE TASKFORCE"
                            }
                          });
                          setActiveSocialPostId(null);
                        }}
                        className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-slate-900/20 flex items-center gap-1.5 focus:outline-none cursor-pointer"
                      >
                        <Plus size={14} /> Clear & Design New Post
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Left Panel: Campaign Editor & AI Generator */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
                      
                      {/* AI-backed content assistant */}
                      <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-100 space-y-3">
                        <h3 className="font-bold text-indigo-950 text-[11px] uppercase tracking-wider flex items-center gap-1">
                          <Sparkles size={13} className="text-indigo-600 animate-pulse" /> Gemini AI Post Draft Assistant
                        </h3>
                        <p className="text-[10px] text-indigo-850 leading-relaxed font-sans">Enter a legal topic of concern in Pakistan. Gemini will craft professional caption templates and structural graphics coordinates instantly.</p>
                        
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={socialTopicPrompt}
                            onChange={(e) => setSocialTopicPrompt(e.target.value)}
                            placeholder="e.g. FBR Sales Tax filing penalty rules, Securities Law, Sindh Labour policies..."
                            className="w-full text-xs border border-indigo-200 px-3 py-2 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[8px] font-bold text-indigo-400 uppercase tracking-widest block mb-1">Banner Preset Theme</label>
                              <select
                                value={socialThemeMode}
                                onChange={(e) => setSocialThemeMode(e.target.value)}
                                className="w-full text-[10px] bg-white border border-indigo-200 p-1.5 rounded-md text-slate-700 font-sans"
                              >
                                <option value="Elegant Slate">Elegant Slate (Indigo/Charcoal)</option>
                                <option value="Golden Justice">Golden Justice (Gold/Dark Slate)</option>
                                <option value="Crimson Appellate">Crimson Appellate (Red/Deep Mahogany)</option>
                              </select>
                            </div>
                            <div className="flex items-end">
                              <button
                                type="button"
                                onClick={handleGenerateAiPost}
                                disabled={socialPromptLoading || !socialTopicPrompt}
                                className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg tracking-wider uppercase transition-all shadow-sm flex items-center justify-center gap-1 text-center disabled:opacity-50 cursor-pointer focus:outline-none"
                              >
                                {socialPromptLoading ? (
                                  <span className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (
                                  <>Generate Content</>
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Explicit Post Editor Fields */}
                      <div className="space-y-4 pt-1">
                        <div className="border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold text-slate-800">Campaign Alert Parameters</h4>
                        </div>
                        
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Post Title / Topic</label>
                          <input
                            type="text"
                            value={newPostData.title}
                            onChange={(e) => setNewPostData({ ...newPostData, title: e.target.value })}
                            placeholder="FBR corporate tax alert notice"
                            className="w-full text-xs border border-slate-205 px-3 py-2 rounded-lg focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Status State</label>
                            <select
                              value={newPostData.status}
                              onChange={(e) => setNewPostData({ ...newPostData, status: e.target.value })}
                              className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg font-sans"
                            >
                              <option value="Draft">Draft (Offline Sandbox)</option>
                              <option value="Scheduled">Scheduled (Queue Pipeline)</option>
                              <option value="Published">Published (Dispatched)</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Scheduled Time</label>
                            <input
                              type="datetime-local"
                              value={newPostData.scheduledTime}
                              onChange={(e) => setNewPostData({ ...newPostData, scheduledTime: e.target.value })}
                              className="w-full text-xs bg-slate-50 border border-slate-200 p-1.5 rounded-lg"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block font-sans">Channels Distribution</label>
                          <div className="flex gap-2 pt-1">
                            {["Facebook", "LinkedIn", "Twitter", "Instagram"].map((platform) => {
                              const included = newPostData.platforms?.includes(platform);
                              return (
                                <button
                                  type="button"
                                  key={platform}
                                  onClick={() => {
                                    const curr = newPostData.platforms || [];
                                    const next = curr.includes(platform)
                                      ? curr.filter((p: any) => p !== platform)
                                      : [...curr, platform];
                                    setNewPostData({ ...newPostData, platforms: next });
                                  }}
                                  className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all border ${
                                    included
                                      ? "bg-slate-900 text-white border-slate-950 shadow-sm"
                                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                                  }`}
                                >
                                  {platform}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Formulated Caption / Body Text</label>
                          <textarea
                            value={newPostData.caption}
                            onChange={(e) => setNewPostData({ ...newPostData, caption: e.target.value })}
                            placeholder="Write legal update text, include contact coordinates, hashtags..."
                            className="w-full text-xs border border-slate-200 p-2.5 rounded-lg h-32 focus:outline-none focus:ring-1 focus:ring-slate-400 font-sans"
                          />
                        </div>

                        <div className="space-y-3 pt-2 border-t border-slate-100">
                          <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-sans">Graphic Poster Typography Editor</h5>
                          
                          <div className="space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Poster Heading</label>
                                <input
                                  type="text"
                                  value={newPostData.designConfig?.heading || ""}
                                  onChange={(e) => {
                                    const config = { ...(newPostData.designConfig || {}), heading: e.target.value };
                                    setNewPostData({ ...newPostData, designConfig: config });
                                  }}
                                  className="w-full text-[10px] border border-slate-200 p-1.5 rounded font-sans"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block font-sans">Poster Subheading</label>
                                <input
                                  type="text"
                                  value={newPostData.designConfig?.subheading || ""}
                                  onChange={(e) => {
                                    const config = { ...(newPostData.designConfig || {}), subheading: e.target.value };
                                    setNewPostData({ ...newPostData, designConfig: config });
                                  }}
                                  className="w-full text-[10px] border border-slate-200 p-1.5 rounded font-sans"
                                />
                              </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Background HEX</label>
                                <input
                                  type="text"
                                  value={newPostData.designConfig?.bgColor || ""}
                                  onChange={(e) => {
                                    const config = { ...(newPostData.designConfig || {}), bgColor: e.target.value };
                                    setNewPostData({ ...newPostData, designConfig: config });
                                  }}
                                  className="w-full text-[10px] border border-slate-205 p-1 font-mono text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Text HEX Color</label>
                                <input
                                  type="text"
                                  value={newPostData.designConfig?.textColor || ""}
                                  onChange={(e) => {
                                    const config = { ...(newPostData.designConfig || {}), textColor: e.target.value };
                                    setNewPostData({ ...newPostData, designConfig: config });
                                  }}
                                  className="w-full text-[10px] border border-slate-205 p-1 font-mono text-center"
                                />
                              </div>
                              <div>
                                <label className="text-[8px] font-bold text-slate-400 uppercase tracking-wide block">Poster Tagline</label>
                                <input
                                  type="text"
                                  value={newPostData.designConfig?.tagline || ""}
                                  onChange={(e) => {
                                    const config = { ...(newPostData.designConfig || {}), tagline: e.target.value };
                                    setNewPostData({ ...newPostData, designConfig: config });
                                  }}
                                  className="w-full text-[10px] border border-slate-205 p-1 font-sans"
                                />
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => {
                            handleSaveSocialPost(newPostData);
                            setNewPostData({
                              title: "",
                              caption: "",
                              platforms: ["Facebook"],
                              status: "Draft",
                              scheduledTime: new Date(Date.now() + 86400000 * 3).toISOString().substring(0, 16),
                              image: "",
                              designConfig: {
                                theme: "Elegant Slate",
                                textColor: "#E2E8F0",
                                bgColor: "#1E293B",
                                heading: "HEADING",
                                subheading: "Subheading",
                                tagline: "TAGLINE"
                              }
                            });
                          }}
                          className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-lg transition-all text-center focus:outline-none cursor-pointer"
                        >
                          Deploy & Save Campaign Asset
                        </button>

                      </div>

                    </div>

                    {/* Right Panel: Rendered Banner Card & Campaign Pipeline */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Visual Poster Canvas */}
                      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-bold text-slate-800 text-sm">Visual Poster Banner Canvas</h3>
                            <p className="text-[10px] text-slate-400">Live rendering container with calibrated color assets.</p>
                          </div>
                          <span className="bg-slate-200 text-slate-600 text-[9px] uppercase tracking-widest font-mono font-bold px-2 py-1 rounded">
                            Template Pre-rendered
                          </span>
                        </div>

                        {/* Realized banner graphics renderer */}
                        <div
                          id="poster-canvas-box"
                          style={{
                            backgroundColor: newPostData.designConfig?.bgColor || "#1e293b",
                            color: newPostData.designConfig?.textColor || "#f8fafc"
                          }}
                          className="w-full aspect-[16/9] rounded-2xl p-8 flex flex-col justify-between shadow-xl border border-slate-900/10 transition-all font-sans relative overflow-hidden"
                        >
                          {/* Ambient overlay shadows */}
                          <div className="absolute inset-0 bg-gradient-to-tr from-black/20 via-transparent to-white/5 pointer-events-none"></div>
                          
                          {/* Top row */}
                          <div className="flex justify-between items-start z-10">
                            <span className="text-[9px] tracking-wider uppercase font-bold opacity-80 border-b pb-0.5 border-current">
                              {newPostData.designConfig?.tagline || "LEGALOPS COMPLIANCE ASSURANCE"}
                            </span>
                            <div className="h-5 w-5 rounded-full border border-current flex items-center justify-center font-serif italic text-[11px] font-bold">
                              L
                            </div>
                          </div>

                          {/* Center Heading body */}
                          <div className="space-y-2.5 z-10 my-auto text-left">
                            <h1 className="text-xl md:text-2xl font-black tracking-tight font-sans uppercase leading-none max-w-lg">
                              {newPostData.designConfig?.heading || "ADVISORY FORUM"}
                            </h1>
                            <p className="text-xs font-semibold tracking-wide font-sans opacity-95 max-w-md">
                              {newPostData.designConfig?.subheading || "Statutory disclosures briefing under Supreme Court Jurisprudence."}
                            </p>
                          </div>

                          {/* Bottom logo metadata row */}
                          <div className="flex justify-between items-end border-t pt-3.5 border-current/20 z-10 text-[9px] font-mono tracking-wider opacity-75 animate-fade-in">
                            <span>REPUBLICS COMMISSION: SINDH / FBR</span>
                            <span>OFFICIAL LEGALOPS PRO DISPATCH</span>
                          </div>
                        </div>

                        {/* Caption preview bubble */}
                        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-inner space-y-1 text-left">
                          <span className="text-[8px] uppercase tracking-wider text-slate-400 font-bold block">Accompanying copy text caption:</span>
                          <p className="text-[11px] text-slate-700 font-sans leading-relaxed whitespace-pre-wrap">
                            {newPostData.caption || "No caption compiled yet."}
                          </p>
                        </div>

                      </div>

                      {/* Scheduled Pipeline List */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-205 shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                          <h3 className="font-bold text-slate-800 text-sm">Campaign Alert Pipeline Queue</h3>
                          <p className="text-[10px] text-slate-400">Active outbound schedules currently configured in LegalOps Pro.</p>
                        </div>

                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
                          {(dbState?.socialPosts || []).length === 0 ? (
                            <div className="text-center py-8 text-xs text-slate-400">
                              No queued assets found. Use the Gemini board to bootstrap posts.
                            </div>
                          ) : (
                            (dbState?.socialPosts || []).map((p: any) => (
                              <div key={p.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-50 transition-all flex justify-between items-start gap-4">
                                <div className="space-y-1.5 text-left flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-bold text-xs text-slate-800">{p.title}</span>
                                    <span className={`text-[8px] uppercase font-bold px-2 py-0.5 rounded ${
                                      p.status === "Published" ? "bg-emerald-100 text-emerald-800" :
                                      p.status === "Scheduled" ? "bg-indigo-100 text-indigo-800 animate-pulse" :
                                      "bg-amber-100 text-amber-800"
                                    }`}>
                                      {p.status}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-500 font-sans line-clamp-2 leading-relaxed">{p.caption}</p>
                                  <div className="flex items-center gap-3 text-[9px] text-slate-400 flex-wrap">
                                    <span>Time: {new Date(p.scheduledTime).toLocaleString()}</span>
                                    <span>•</span>
                                    <span className="flex gap-1.5">
                                      {p.platforms?.map((ch: string) => (
                                        <span key={ch} className="bg-slate-200 text-slate-700 px-1 py-0.2 rounded text-[8px] font-bold">
                                          {ch}
                                        </span>
                                      ))}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => {
                                      setNewPostData({ ...p });
                                      setActiveSocialPostId(p.id);
                                    }}
                                    className="p-1.5 hover:bg-slate-200 rounded text-slate-600 focus:outline-none cursor-pointer"
                                    title="Edit design parameters"
                                  >
                                    <Eye size={13} />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteSocialPost(p.id)}
                                    className="p-1.5 hover:bg-rose-105 rounded text-rose-650 focus:outline-none cursor-pointer"
                                    title="Delete campaign"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            ))
                          )}
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )}

              {/* TAB 11: WORKFLOW AUTOMATION ENGINE */}
              {currentTab === "workflows" && (
                <div id="workflows-workspace" className="space-y-6 animate-fade-in">
                  
                  {/* Banner */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between bg-indigo-950 text-white p-6 rounded-2xl shadow-xl space-y-4 md:space-y-0 border border-indigo-900">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-[9px] uppercase tracking-widest font-bold text-indigo-300">Automated Legal Process (ALP) Engine</span>
                      </div>
                      <h2 className="text-xl font-bold mt-1 tracking-tight">Workflow & SLA Automation Hub</h2>
                      <p className="text-xs text-indigo-150 max-w-xl mt-1">Configure action-response nodes to streamline critical lead followups, escalate due dates on WhatsApp, or alert senior management of SLA violations instantly.</p>
                    </div>
                    <div className="flex gap-2 bg-indigo-900/60 p-2.5 rounded-xl border border-indigo-800/40 text-right">
                      <div>
                        <span className="block text-[8px] uppercase tracking-wider text-indigo-400 font-bold">Efficacy Index:</span>
                        <span className="font-mono text-xs font-bold text-emerald-400">80% TIME SAVINGS TARGET MET</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    
                    {/* Trigger configuration portal */}
                    <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5 flex flex-col justify-between">
                      <div className="border-b border-slate-100 pb-3">
                        <h3 className="font-bold text-slate-800 text-sm">Deployment Control Portal</h3>
                        <p className="text-[10px] text-slate-400">Configure real-time automated triggers to handle background micro-services.</p>
                      </div>

                      <form
                        onSubmit={(e) => {
                          e.preventDefault();
                          handleSaveWorkflow(workflowRuleForm);
                          setWorkflowRuleForm({
                            name: "Automatic SLA Escaler",
                            trigger: "On Task Overdue (Deadlines)",
                            action: "WhatsApp Notification to Firm Head",
                            target: "Hamid",
                            active: true,
                            description: "Sends automated warnings when deadlines pass."
                          });
                        }}
                        className="space-y-4 flex-1 pt-2"
                      >
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Rule Identifier Name</label>
                          <input
                            type="text"
                            required
                            value={workflowRuleForm.name}
                            onChange={(e) => setWorkflowRuleForm({ ...workflowRuleForm, name: e.target.value })}
                            placeholder="e.g. Lead Instant Warm Outreach"
                            className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Trigger Evaluator Condition</label>
                          <select
                            value={workflowRuleForm.trigger}
                            onChange={(e) => setWorkflowRuleForm({ ...workflowRuleForm, trigger: e.target.value })}
                            className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-700"
                          >
                            <option value="On Lead Capture (CRM)">On Lead Capture (CRM Leads Entry)</option>
                            <option value="On Hearing Scheduled">On Hearing Scheduled (Matter updates)</option>
                            <option value="On Task Overdue (Deadlines)">On Task Overdue (Deadlines breach)</option>
                            <option value="On Invoice Overdue">On Invoice Overdue (Receivables delay)</option>
                            <option value="On Leave Approved">On Leave Approved (Leaves register)</option>
                          </select>
                        </div>

                        <div className="space-y-1 font-sans">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block">Immediate Response Dispatch Action</label>
                          <select
                            value={workflowRuleForm.action}
                            onChange={(e) => setWorkflowRuleForm({ ...workflowRuleForm, action: e.target.value })}
                            className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-lg text-slate-700"
                          >
                            <option value="Trigger Custom WhatsApp Introductory Dossier">Trigger Custom WhatsApp Introductory Dossier (Twilio Link)</option>
                            <option value="Escalate to Reporting Senior Partner on WhatsApp">Escalate to Reporting Senior Partner on WhatsApp (WA Notice)</option>
                            <option value="WhatsApp Notification to Firm Head">WhatsApp Notification to Sultan Ahmed Khan (Firm Head WA)</option>
                            <option value="Email Draft Proposal Notice">Email Draft Proposal Notice (Nodemailer Client Sync)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Primary Execution Owner</label>
                          <select
                            value={workflowRuleForm.target}
                            onChange={(e) => setWorkflowRuleForm({ ...workflowRuleForm, target: e.target.value })}
                            className="w-full text-xs bg-slate-50 border border-slate-205 p-2 rounded-lg text-slate-700 font-sans"
                          >
                            <option value="Sarosh Sultan">Sarosh Sultan (Partner Admin)</option>
                            <option value="Hamid">Hamid (Director Operations)</option>
                            <option value="Areesha">Areesha (Sales Representative)</option>
                            <option value="Muzammil">Muzammil (Senior Litigation Executive)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-slate-400 uppercase block font-sans">Rule Description Parameters</label>
                          <textarea
                            value={workflowRuleForm.description}
                            onChange={(e) => setWorkflowRuleForm({ ...workflowRuleForm, description: e.target.value })}
                            placeholder="Explain the workflow logic behavior context briefly..."
                            className="w-full text-xs border border-slate-200 p-2 h-16 rounded-lg font-sans"
                          />
                        </div>

                        <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg border font-sans">
                          <span className="text-[10px] font-bold text-slate-600 uppercase">Deploy in active state</span>
                          <input
                            type="checkbox"
                            checked={workflowRuleForm.active}
                            onChange={(e) => setWorkflowRuleForm({ ...workflowRuleForm, active: e.target.checked })}
                            className="h-4 w-4 rounded pointer-events-auto"
                          />
                        </div>

                        <button
                          type="submit"
                          className="w-full py-2.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md transition-all text-center focus:outline-none cursor-pointer"
                        >
                          Establish Automation Pipeline
                        </button>

                      </form>

                    </div>

                    {/* Active Workflows Monitor & Execution Logs */}
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Active Rules Grid */}
                      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        <div className="border-b border-slate-100 pb-2">
                          <h3 className="font-bold text-slate-800 text-sm">Active Rules & Triggers</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {(dbState?.workflows || []).map((w: any) => {
                            const isTesting = testingWfId === w.id;
                            return (
                              <div key={w.id} className="p-4 rounded-xl border border-slate-150 bg-slate-50/70 hover:bg-slate-50 flex flex-col justify-between space-y-3 relative overflow-hidden">
                                <div className="space-y-1 text-left">
                                  <div className="flex justify-between items-start">
                                    <span className="font-bold text-xs text-slate-800 tracking-tight leading-snug">{w.name}</span>
                                    <span className={`text-[8px] uppercase font-bold px-1.5 py-0.2 rounded-full ${
                                      w.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
                                    }`}>
                                      {w.active ? "Active" : "Disabled"}
                                    </span>
                                  </div>
                                  <p className="text-[10px] text-slate-555 font-sans leading-relaxed pt-0.5">{w.description}</p>
                                  
                                  <div className="pt-2 space-y-1 text-[9px] font-mono text-slate-400">
                                    <div>⚡ TRIGGER: <span className="text-indigo-600 font-bold">{w.trigger}</span></div>
                                    <div>🎯 DISPATCH: <span className="text-slate-700 font-bold">{w.action}</span></div>
                                    <div>👤 ASSIGNED TO: <span className="text-slate-700 font-bold">{w.target}</span></div>
                                  </div>
                                </div>

                                <div className="flex gap-1.5 pt-2 border-t border-slate-200/50">
                                  <button
                                    onClick={() => handleTriggerWorkflowTest(w.id)}
                                    disabled={isTesting}
                                    className="flex-1 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[9px] rounded-lg tracking-wider uppercase transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    {isTesting ? (
                                      <span className="h-2 w-2 rounded-full bg-indigo-600 animate-ping"></span>
                                    ) : (
                                      <>Test Trigger</>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleDeleteWorkflow(w.id)}
                                    className="p-1 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-bold cursor-pointer"
                                    title="Delete Workflow"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Execution logs feed */}
                      <div className="bg-slate-900 text-slate-300 p-5 rounded-2xl border border-slate-950 shadow-xl space-y-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                          <div>
                            <h3 className="font-bold text-white text-sm">ALP Engine Execution logs</h3>
                            <p className="text-[10px] text-slate-500 font-mono">SYSTEM_DAEMON_NODE: SUCCESS_LEDGER</p>
                          </div>
                          <span className="h-5 w-5 bg-indigo-900/40 border border-indigo-500/30 rounded-full flex items-center justify-center font-bold text-[9px] text-indigo-400 animate-pulse">
                            ●
                          </span>
                        </div>

                        <div className="space-y-3 max-h-[220px] overflow-y-auto font-mono text-[9.5px] leading-relaxed pr-1">
                          {(dbState?.workflowLogs || []).length === 0 ? (
                            <div className="text-center py-6 text-slate-505">
                              System quiet. Launch automated tests to populate live logs.
                            </div>
                          ) : (
                            (dbState?.workflowLogs || []).map((log: any) => (
                              <div key={log.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1.5 text-left">
                                <div className="flex justify-between text-indigo-400 font-bold">
                                  <span>[CRITICAL_EXECUTION]: {log.workflowName}</span>
                                  <span className="text-slate-500">{new Date(log.time).toLocaleTimeString()}</span>
                                </div>
                                <p className="text-slate-300 font-sans leading-relaxed">{log.details}</p>
                              </div>
                            ))
                          )}
                        </div>

                      </div>

                    </div>

                  </div>

                </div>
              )}

            </div>
          )}

        </div>

      </div>

      {/* FORM MODAL COMPONENT (PORTAL REPLICAS) */}
      {activeModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 space-y-4">
            
            <div className="flex justify-between items-center border-b pb-3 mb-2">
              <h3 className="font-bold text-slate-800 text-sm">Register operational details</h3>
              <button onClick={() => setActiveModal(null)} className="p-1 hover:bg-slate-100 rounded-lg text-slate-400">
                <X size={16} />
              </button>
            </div>

            {/* MODAL 1: CREATE TASK */}
            {activeModal === "create-task" && (
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Task Title</label>
                  <input type="text" required value={newTask.title} onChange={(e) => setNewTask({ ...newTask, title: e.target.value })} placeholder="Appeal filing preparation..." className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Description brief</label>
                  <textarea value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Enter critical context parameters..." className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg h-20" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Assign User</label>
                    <select value={newTask.assignedTo} onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })} className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <option value="6">Muzammil (Senior Staff)</option>
                      <option value="7">Hamid (Senior Staff)</option>
                      <option value="10">Asad (Staff Drafting)</option>
                      <option value="11">Abdul Qadir (Staff Tax)</option>
                      <option value="12">Areesha (Staff Sales)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                    <select value={newTask.priority} onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })} className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <option value="Critical">Critical (Red alert)</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-md shadow-indigo-100">Disburse Task Assignment</button>
              </form>
            )}

            {/* MODAL 2: REGISTER ACTIVE CASE */}
            {activeModal === "create-case" && (
              <form onSubmit={handleCreateCase} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Matter Title Name</label>
                  <input type="text" required value={newCase.title} onChange={(e) => setNewCase({ ...newCase, title: e.target.value })} placeholder="HBL vs Federal Board of Revenue Appeals..." className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Client Name</label>
                    <input type="text" required value={newCase.clientName} onChange={(e) => setNewCase({ ...newCase, clientName: e.target.value })} placeholder="Habib Bank" className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Category</label>
                    <select value={newCase.caseType} onChange={(e) => setNewCase({ ...newCase, caseType: e.target.value })} className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <option value="Contracts">Contracts</option>
                      <option value="Withholding">Withholding Dispute</option>
                      <option value="Litigation">Litigation Trial</option>
                      <option value="Appeals">Appeals Representation</option>
                      <option value="SECP">SECP Advisory</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fees Retainer (PKR)</label>
                    <input type="number" required value={newCase.estimatedFees} onChange={(e) => setNewCase({ ...newCase, estimatedFees: Number(e.target.value) })} className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Priority</label>
                    <select value={newCase.priority} onChange={(e) => setNewCase({ ...newCase, priority: e.target.value })} className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg transition-all shadow-md">Register Live Case Matter</button>
              </form>
            )}

            {/* MODAL 3: DISBURSE CRM LEAD PROSPECT */}
            {activeModal === "create-lead" && (
              <form onSubmit={handleCreateLead} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Prospect Full Name</label>
                  <input type="text" required value={newLead.name} onChange={(e) => setNewLead({ ...newLead, name: e.target.value })} placeholder="Kashif Majeed" className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Company (Optional)</label>
                  <input type="text" value={newLead.company} onChange={(e) => setNewLead({ ...newLead, company: e.target.value })} placeholder="Majeed Textiles" className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Contact Phone</label>
                    <input type="text" required value={newLead.phone} onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })} placeholder="+92 312 0000000" className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Inquiry Source</label>
                    <select value={newLead.source} onChange={(e) => setNewLead({ ...newLead, source: e.target.value })} className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <option value="WhatsApp">WhatsApp Message</option>
                      <option value="Social Media">Facebook Ad DM</option>
                      <option value="Website">Website Form Submission</option>
                      <option value="Referral">Client Referral</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Prospect Outline Summary</label>
                  <textarea value={newLead.notes} onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })} className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg h-24" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg">Commit New Lead pipeline</button>
              </form>
            )}

            {/* MODAL 4: LOG COST EXPENDITURE */}
            {activeModal === "log-expense" && (
              <form onSubmit={handleCreateExpense} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Voucher description</label>
                  <input type="text" required value={newExpense.description} onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })} placeholder="Highcourt processing fee ticket log..." className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Operational Category</label>
                    <select value={newExpense.category} onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })} className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
                      <option value="Travel / Rider Fuel">Travel / Rider Logistics Fuel</option>
                      <option value="Office Supplies">Office Supplies & paper bundle</option>
                      <option value="Court Fees">Court Fees Stamp Ticketing</option>
                      <option value="Petty Cash">Rider Petty Cash Dispense</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Cost (PKR)</label>
                    <input type="number" required value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })} className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                  </div>
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg">File Cost Entry</button>
              </form>
            )}

            {/* MODAL 5: CUSTOM GENERATE RETRO INVOICE */}
            {activeModal === "create-invoice" && (
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Matter Case file Link</label>
                  <select value={newInvoice.caseId} onChange={(e) => setNewInvoice({ ...newInvoice, caseId: e.target.value })} className="w-full text-xs bg-slate-50 border border-slate-200 p-2 rounded-lg">
                    {dbState.cases.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Billed Settlement Amount (PKR)</label>
                  <input type="number" required value={newInvoice.amount} onChange={(e) => setNewInvoice({ ...newInvoice, amount: Number(e.target.value) })} className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block">Due Settlement timestamp</label>
                  <input type="date" required value={newInvoice.dueDate} onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })} className="w-full text-xs border border-slate-200 px-3 py-2 rounded-lg" />
                </div>
                <button type="submit" className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg">Issue Retainer Settlement notice</button>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
