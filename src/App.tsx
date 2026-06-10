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
  Share2
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

  // Fetch complete database state filtered by RBAC
  const fetchDbState = async (userId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/db-state?userId=${userId}`);
      const data = await res.json();
      setDbState(data);
    } catch (err) {
      console.error("Error retrieving DB state parameters.", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch AI daily Briefing on load
  const loadAiBriefing = async () => {
    setBriefingLoading(true);
    try {
      const res = await fetch('/api/ai/predictive-brief');
      const data = await res.json();
      setAiBriefing(data.brief);
    } catch (err) {
      setAiBriefing("Could not load smart briefings. Configure your API token secrets.");
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

  const handleRoleChange = (userId: string) => {
    setActiveUserId(userId);
    setMobileMenuOpen(false);
    // Reset selections appropriate for that role
    if (userId === "10") {
      // Asad can only see single elements
    }
  };

  // Rest API Actions
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        task: {
          ...newTask,
          assignedBy: activeUserId,
          department: dbState.allUsers.find((u: any) => u.id === newTask.assignedTo)?.department || "Executive Office"
        }
      };
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
            <span className="flex items-center gap-1.5 text-emerald-600 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse"></span>
              Secure Live ERP Sandbox
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span id="role-select-label" className="text-xs font-bold text-slate-400 uppercase hidden sm:inline">Active User Role:</span>
            <select
              id="role-switch"
              value={activeUserId}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="text-xs font-bold bg-indigo-50 text-indigo-700 border-2 border-indigo-200 px-3 py-1.5 rounded-xl cursor-pointer hover:bg-indigo-100/80 focus:outline-none transition-all"
            >
              <option value="1">Level 1: Sultan Ahmed Khan (Firm Head / Non-computer)</option>
              <option value="2">Level 2: Sarosh Sultan (Partner Admin / Contracts, Appeals)</option>
              <option value="3">Level 2: Wahab Ul Bari (Partner / Tax & Audit)</option>
              <option value="4">Level 2: Asif Yousuf (Partner / SECP & Accounts)</option>
              <option value="5">Level 2: Sohail Kashani (Partner / Sales)</option>
              <option value="7">Level 3: Hamid (Senior Staff / Operations, Banking, HR)</option>
              <option value="8">Level 3: Waleed (Senior Staff / Drafting Overseer)</option>
              <option value="9">Level 3: Ahmed (Senior Staff / Tax Overseer)</option>
              <option value="10">Level 4: Asad (Drafting Staff / Reports to Waleed)</option>
              <option value="11">Level 4: Abdul Qadir (Tax Staff / Reports to Ahmed)</option>
              <option value="12">Level 4: Areesha (Routine Tasks & WhatsApp Inquiry Lead)</option>
            </select>
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
                { id: "finances", label: "Finances & Costs", icon: DollarSign },
                { id: "reports", label: "BI Report Builder", icon: BarChart3 }
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
                          <div key={lead.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-slate-400">{lead.source}</span>
                              <span className="text-sky-600">Score {lead.score}%</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{lead.notes}</p>
                            <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-slate-100">
                              <button onClick={() => handleUpdateLeadStatus(lead.id, "Contacted")} className="text-[9px] font-bold bg-slate-100 text-slate-700 px-2 py-1 rounded">Contact</button>
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
                          <div key={lead.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-slate-400">{lead.source}</span>
                              <span className="text-sky-600">Score {lead.score}%</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            <p className="text-[10px] text-slate-500 line-clamp-2">{lead.notes}</p>
                            <div className="flex justify-end gap-1 mt-3 pt-2 border-t border-slate-100">
                              <button onClick={() => handleUpdateLeadStatus(lead.id, "Proposal")} className="text-[9px] font-bold bg-indigo-500 text-white px-2 py-1 rounded">Prepare SLA</button>
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
                          <div key={lead.id} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                            <div className="flex justify-between items-center text-[9px] font-bold">
                              <span className="text-slate-400">{lead.source}</span>
                              <span className="text-indigo-600">Score {lead.score}%</span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            {lead.company && <p className="text-[10px] text-indigo-700 font-semibold">{lead.company}</p>}
                            <p className="text-[10px] text-slate-500 line-clamp-2">{lead.notes}</p>
                            <div className="flex justify-between gap-1 mt-3 pt-2 border-t border-slate-100">
                              <button onClick={() => {
                                // Convert lead directly to live operational case
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
                              }} className="text-[9px] font-bold bg-emerald-600 text-white px-2 py-1 rounded">Convert to Case</button>
                              <button onClick={() => handleUpdateLeadStatus(lead.id, "Lost")} className="text-[9px] font-bold text-rose-600 hover:bg-rose-50 px-2 py-1 rounded">Lost</button>
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
                          <div key={lead.id} className="bg-white p-3 rounded-xl border border-slate-200 opacity-80 space-y-1">
                            <h4 className="text-xs font-bold text-emerald-700">✓ Onboard Successful</h4>
                            <h4 className="text-xs font-bold text-slate-800">{lead.name}</h4>
                            <p className="text-[9px] text-slate-400">{lead.email}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>

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
