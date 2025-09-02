// File: ContactManagement.jsx
import React, { useState, useEffect } from "react";
import {
  Users,
  Contact2,
  Handshake,
  ClipboardList,
  LayoutDashboard,
  BarChart3,
  Plus,
  CalendarDays,
  Clock,
  XCircle,
  Sun,
  Moon,
  List,       // For Lists
  Inbox,      // For Inbox
  Ticket,     // For Tickets
  Package,    // For Orders
  Eraser,     // For Clear action
  Phone,      // For Call Log
  User,       // For caller
  Clock3      // For call duration
} from "lucide-react";
import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import DashboardLayout from "../../components/DashboardLayout";
import Leads from "./pages/Leads";
import ContactsPage from "./pages/ContactsPage";
import Deals from "./pages/Deals";
import Tasks from "./pages/Tasks";
import Lists from "./pages/Lists";
import Tickets from "./pages/Tickets";
import Orders from "./pages/Orders";
import Inboxs from "./pages/Inbox";

// === UI Components ===
const Section = ({ title, children, right }) => (
  <section className="bg-black/80 dark:bg-black/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-xl transition">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold tracking-wide text-yellow-500 dark:text-yellow-400">
        {title}
      </h2>
      {right}
    </div>
    <div>{children}</div>
  </section>
);

const StatCard = ({ label, value, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.03 }}
    transition={{ duration: 0.4 }}
    className="bg-black dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-md flex items-center gap-4"
  >
    <div className="p-3 rounded-xl bg-zinc-900 dark:bg-black">
      <Icon className="w-6 h-6 text-yellow-500 dark:text-yellow-400" />
    </div>
    <div>
      <p className="text-zinc-300 dark:text-zinc-400">{label}</p>
      <p className="text-2xl font-semibold text-white">{value}</p>
    </div>
  </motion.div>
);

const ProgressBar = ({ percent, label }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-zinc-700 dark:text-zinc-300">{label}</span>
      <span className="text-zinc-600 dark:text-zinc-400">{percent}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
      <div className="h-2 bg-yellow-500" style={{ width: `${percent}%` }} />
    </div>
  </div>
);

const Badge = ({ children, tone = "default" }) => {
  const tones = {
    default:
      "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 border-zinc-300 dark:border-zinc-700",
    success:
      "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    warn: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    danger:
      "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    info: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${tones[tone]}`}
    >
      {children}
    </span>
  );
};

const Modal = ({ open, onClose, title, children, footer }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative w-full max-w-2xl bg-black dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl transition"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-500 dark:text-yellow-400">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800"
          >
            <XCircle className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && (
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            {footer}
          </div>
        )}
      </motion.div>
    </div>
  );
};

// === Call Log Component ===
const CallLog = () => {
  // Sample call log data
  const callLogs = [
    { id: 1, contact: "John Doe", number: "+1 (555) 123-4567", date: "2023-08-20", time: "10:30 AM", duration: "5:23", type: "Outgoing", status: "Completed" },
    { id: 2, contact: "Jane Smith", number: "+1 (555) 987-6543", date: "2023-08-19", time: "2:15 PM", duration: "2:45", type: "Incoming", status: "Completed" },
    { id: 3, contact: "Acme Inc.", number: "+1 (555) 456-7890", date: "2023-08-18", time: "4:45 PM", duration: "0:00", type: "Outgoing", status: "Missed" },
    { id: 4, contact: "Sam Brown", number: "+1 (555) 234-5678", date: "2023-08-17", time: "11:20 AM", duration: "12:18", type: "Incoming", status: "Completed" },
  ];

  return (
    <Section title="Call History">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-zinc-700">
              <th className="py-3 px-4 text-left text-zinc-400">Contact</th>
              <th className="py-3 px-4 text-left text-zinc-400">Number</th>
              <th className="py-3 px-4 text-left text-zinc-400">Date & Time</th>
              <th className="py-3 px-4 text-left text-zinc-400">Duration</th>
              <th className="py-3 px-4 text-left text-zinc-400">Type</th>
              <th className="py-3 px-4 text-left text-zinc-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {callLogs.map((log) => (
              <tr key={log.id} className="border-b border-zinc-800 hover:bg-zinc-900/50">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-full bg-zinc-800">
                      <User className="w-4 h-4 text-yellow-500" />
                    </div>
                    <span>{log.contact}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-zinc-300">{log.number}</td>
                <td className="py-3 px-4 text-zinc-300">
                  <div>
                    <div>{log.date}</div>
                    <div className="text-xs text-zinc-500">{log.time}</div>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-1">
                    <Clock3 className="w-3.5 h-3.5 text-zinc-500" />
                    <span>{log.duration}</span>
                  </div>
                </td>
                <td className="py-3 px-4">
                  <Badge tone={log.type === "Outgoing" ? "info" : "success"}>
                    {log.type}
                  </Badge>
                </td>
                <td className="py-3 px-4">
                  <Badge tone={log.status === "Completed" ? "success" : "danger"}>
                    {log.status}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="mt-6 flex justify-between items-center">
        <div className="text-sm text-zinc-500">
          Showing 4 of 24 call records
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black rounded-lg text-sm font-medium transition-colors">
          <Plus size={16} />
          Add Call Record
        </button>
      </div>
    </Section>
  );
};

// === Seed Data ===
const seedActivities = [
  { id: 1, text: "John Doe added a new contact", when: "Just now" },
  { id: 2, text: 'Jane Smith updated Deal status to "Proposal Sent"', when: "2h ago" },
  { id: 3, text: "Call scheduled with Client X", when: "Today 4:00 PM" },
];

const seedTasks = [
  { id: 1, title: "Follow-up Email with Jane", due: "Aug 20", status: "Pending" },
  { id: 2, title: "Product Demo for XYZ", due: "Aug 21", status: "Scheduled" },
];

const seedLeads = [
  { id: 1, name: "John Doe", company: "Acme Inc.", status: "New", last: "Aug 18" },
  { id: 2, name: "Jane Smith", company: "XYZ Corp", status: "Contacted", last: "Aug 17" },
  { id: 3, name: "Sam Brown", company: "Freelance", status: "Qualified", last: "Aug 19" },
];

const pipelinePercents = [
  { label: "Stage 1: Prospecting", value: 40 },
  { label: "Stage 2: Qualified", value: 25 },
  { label: "Stage 3: Proposal", value: 15 },
  { label: "Stage 4: Closed Won", value: 10 },
  { label: "Stage 5: Closed Lost", value: 10 },
];

const chartData = [
  { month: "Apr", leads: 80, deals: 24 },
  { month: "May", leads: 110, deals: 28 },
  { month: "Jun", leads: 95, deals: 31 },
  { month: "Jul", leads: 130, deals: 33 },
  { month: "Aug", leads: 124, deals: 34 },
];

// === Main Component ===
export default function ContactManagement() {
  const [leads, setLeads] = useState(seedLeads);
  const [tasks, setTasks] = useState(seedTasks);
  const [leadModal, setLeadModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [theme, setTheme] = useState("dark");
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    status: "New",
    last: "Aug 20",
  });
  const [newTask, setNewTask] = useState({
    title: "",
    due: "",
    status: "Pending",
  });

  

 

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard" },
    { icon: Users, label: "Leads" },
    { icon: Contact2, label: "Contacts" },
    { icon: Handshake, label: "Deals" },
    { icon: ClipboardList, label: "Tasks" },
    { icon: List, label: "Lists" },
    { icon: Inbox, label: "Inbox" },
    { icon: Ticket, label: "Tickets" },
    { icon: Package, label: "Orders" },
    { icon: Phone, label: "Call Log" }, // Added Call Log navigation
  ];

  // Handlers
  const addLead = (e) => {
    e.preventDefault();
    const id = leads.length ? Math.max(...leads.map((l) => l.id)) + 1 : 1;
    setLeads([{ id, ...newLead }, ...leads]);
    setLeadModal(false);
  };

  const addTask = (e) => {
    e.preventDefault();
    const id = tasks.length ? Math.max(...tasks.map((t) => t.id)) + 1 : 1;
    setTasks([{ id, ...newTask }, ...tasks]);
    setTaskModal(false);
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white dark:bg-black dark:text-white pt-40 transition-colors duration-300">
        {/* --- Header Navbar --- */}
        <header className="fixed top-20 left-0 right-0 bg-black/70 dark:bg-black/40 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 z-40">
          <div className="relative flex items-center justify-center px-6 py-3">
            {/* Brand */}
            <div className="absolute left-6 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
              </div>
              <h1 className="text-lg font-semibold text-yellow-500 dark:text-yellow-400">
                CRM Dashboard
              </h1>
            </div>
            {/* Nav Tabs */}
            <nav className="flex items-center gap-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${
                    activeTab === item.label
                      ? "bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-yellow-500"
                      : "hover:bg-zinc-100 dark:hover:bg-zinc-900 border-transparent text-zinc-200 hover:text-black dark:text-zinc-300"
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
            
          </div>
        </header>
        {/* --- Main Content --- */}
        <main className="p-6 space-y-6 bg-black">
          {activeTab === "Dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Leads This Month" value={124} icon={Users} />
                <StatCard label="New Contacts" value={87} icon={Contact2} />
                <StatCard label="Deals Closed" value={34} icon={Handshake} />
                <StatCard
                  label="Open Tasks"
                  value={tasks.length}
                  icon={ClipboardList}
                />
              </div>
              {/* Pipeline + Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <Section
                    title="Sales Pipeline Overview"
                    right={<Badge tone="info">This month</Badge>}
                  >
                    {pipelinePercents.map((p) => (
                      <ProgressBar key={p.label} percent={p.value} label={p.label} />
                    ))}
                  </Section>
                </div>
                <div className="lg:col-span-3">
                  <Section title="Leads vs Deals (Trend)">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={chartData}
                          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                        >
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#e4e4e7"
                            className="dark:stroke-[#27272a]"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="#a1a1aa"
                            tickLine={false}
                            axisLine={{ stroke: "#d4d4d8" }}
                          />
                          <YAxis
                            stroke="#a1a1aa"
                            tickLine={false}
                            axisLine={{ stroke: "#d4d4d8" }}
                          />
                          <Tooltip
                            contentStyle={{
                              background: theme === "dark" ? "#09090b" : "#fff",
                              border: "1px solid #27272a",
                              borderRadius: 12,
                            }}
                          />
                          <Line
                            type="monotone"
                            dataKey="leads"
                            stroke="#f59e0b"
                            strokeWidth={2}
                            dot={false}
                          />
                          <Line
                            type="monotone"
                            dataKey="deals"
                            stroke="#22c55e"
                            strokeWidth={2}
                            dot={false}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </Section>
                </div>
              </div>
              {/* Activities + Tasks */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Section title="Recent Activities" right={<Badge>Auto-feed</Badge>}>
                  <ul className="space-y-3">
                    {seedActivities.map((a) => (
                      <li key={a.id} className="flex items-start gap-3">
                        <Clock className="w-4 h-4 mt-0.5 text-zinc-400" />
                        <div>
                          <p className="text-white">{a.text}</p>
                          <p className="text-xs text-zinc-500">{a.when}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>
                <Section
                  title="Calendar / Upcoming Tasks"
                  right={
                    <button
                      onClick={() => setTaskModal(true)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-300 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  }
                >
                  <ul className="space-y-3">
                    {tasks.map((t) => (
                      <li
                        key={t.id}
                        className="flex items-center justify-between bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-4 h-4 text-zinc-400" />
                          <div>
                            <p className="text-white">{t.title}</p>
                            <p className="text-xs text-zinc-500">Due: {t.due}</p>
                          </div>
                        </div>
                        <Badge
                          tone={
                            t.status === "Scheduled"
                              ? "info"
                              : t.status === "Completed"
                              ? "success"
                              : "warn"
                          }
                        >
                          {t.status}
                        </Badge>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </>
          )}
          {activeTab === "Leads" && <Leads />}
          {activeTab === "Contacts" && <ContactsPage />}
          {activeTab === "Deals" && <Deals />}
          {activeTab === "Tasks" && <Tasks />}
          {activeTab === "Call Log" && <CallLog />} {/* Added Call Log tab */}
          {/* Placeholder sections */}
          {activeTab === "Lists" && (
            <Section title="Lists">
              <Lists />
            </Section>
          )}
          {activeTab === "Inbox" && (
            <Section title="Inbox">
              <Inboxs/>
            </Section>
          )}
          {activeTab === "Tickets" && (
            <Section title="Tickets">
              <Tickets />
            </Section>
          )}
          {activeTab === "Orders" && (
            <Section title="Orders">
              <Orders />
            </Section>
          )}
        </main>
        {/* --- Modals --- */}
        <Modal
          open={leadModal}
          onClose={() => setLeadModal(false)}
          title="Add New Lead"
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setLeadModal(false)}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addLead}
                className="px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm"
              >
                Save Lead
              </button>
            </div>
          }
        >
          <form
            onSubmit={addLead}
            className="grid grid-cols-1 md:grid-cols-2 gap-3"
          >
            <label className="text-sm space-y-1">
              <span className="text-zinc-700 dark:text-zinc-400">Name</span>
              <input
                value={newLead.name}
                onChange={(e) =>
                  setNewLead((v) => ({ ...v, name: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 outline-none"
                required
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="text-zinc-700 dark:text-zinc-400">Company</span>
              <input
                value={newLead.company}
                onChange={(e) =>
                  setNewLead((v) => ({ ...v, company: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 outline-none"
                required
              />
            </label>
          </form>
        </Modal>
        <Modal
          open={taskModal}
          onClose={() => setTaskModal(false)}
          title="Add New Task"
          footer={
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setTaskModal(false)}
                className="px-3 py-2 rounded-lg border border-zinc-300 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addTask}
                className="px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm"
              >
                Save Task
              </button>
            </div>
          }
        >
          <form onSubmit={addTask} className="grid grid-cols-1 gap-3">
            <label className="text-sm space-y-1">
              <span className="text-zinc-700 dark:text-zinc-400">Title</span>
              <input
                value={newTask.title}
                onChange={(e) =>
                  setNewTask((v) => ({ ...v, title: e.target.value }))
                }
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 outline-none"
                required
              />
            </label>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
}