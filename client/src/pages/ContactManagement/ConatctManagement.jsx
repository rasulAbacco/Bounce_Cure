// File: ContactManagement.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
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
  List,
  Inbox,
  Package,

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
import Orders from "./pages/Orders";
import Inboxs from "./pages/Inbox";

/**
 * NOTE:
 * This component attempts to fetch resources from multiple likely endpoints
 * to match your server mounts (examples from your server.js):
 *  - app.use("/api/leads", leadsRouter)          -> /api/leads
 *  - app.use("/api/contacts", contactRoutes)     -> /api/contacts
 *  - app.use("/tasks", taskRoutes)               -> /tasks
 *  - app.use("/deals", dealsRoutes)              -> /deals
 *  - app.use("/orders", orderRoutes)             -> /orders
 *  - app.use("/lists", listRoutes)               -> /lists
 *  - inbox may be under /api/emails or /notifications or /api/inbox
 *
 * If you have different endpoints, update the fallback arrays below.
 */

// --- UI helpers (kept same as your original) ---
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
    warn:
      "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    danger:
      "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800",
    info:
      "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800",
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
  // data states
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [orders, setOrders] = useState([]);
  const [lists, setLists] = useState([]);
  const [inbox, setInbox] = useState([]);
  const [pipelinePercents, setPipelinePercents] = useState([]);
  const [chartData, setChartData] = useState([]);

  // UI states
  const [leadModal, setLeadModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [theme] = useState("dark");
  const [newLead, setNewLead] = useState({
    name: "",
    company: "",
    status: "New",
    last: new Date().toISOString(),
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
    { icon: Package, label: "Orders" },
  ];

  const baseURL = "http://localhost:5000";

  // Helper: try multiple endpoints for a resource and return first successful result
  const fetchWithFallback = async (paths = []) => {
    for (const p of paths) {
      try {
        const url = p.startsWith("http") ? p : `${baseURL}${p}`;
        const res = await axios.get(url);
        if (res && res.status >= 200 && res.status < 300) {
          return res.data;
        }
      } catch (err) {
        // keep trying other fallbacks
        // console.debug(`fetch failed for ${p}:`, err?.response?.status || err.message);
      }
    }
    return [];
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        const promises = [
          // leads: preferred /api/leads (your server uses app.use("/api/leads", ...))
          fetchWithFallback(["/api/leads", "/leads"]),
          // tasks: your server mounts tasks at "/tasks"
          fetchWithFallback(["/tasks", "/api/tasks"]),
          // contacts: prefer /api/contacts (you have app.use("/api/contacts", ...))
          fetchWithFallback(["/api/contacts", "/contact", "/contact/"]),
          // deals: mounted at "/deals"
          fetchWithFallback(["/deals", "/api/deals"]),
          // orders: mounted at "/orders"
          fetchWithFallback(["/orders", "/api/orders"]),
          // lists: mounted at "/lists"
          fetchWithFallback(["/lists", "/api/lists"]),
          // inbox / email notifications: try likely places
          fetchWithFallback([
            "/api/emails",
            "/notifications",
            "/api/inbox",
            "/inbox",
            "/api/notifications",
          ]),
        ];

        const [
          leadsData,
          tasksData,
          contactsData,
          dealsData,
          ordersData,
          listsData,
          inboxData,
        ] = await Promise.all(promises);

        setLeads(Array.isArray(leadsData) ? leadsData : [leadsData].filter(Boolean));
        setTasks(Array.isArray(tasksData) ? tasksData : [tasksData].filter(Boolean));
        setContacts(Array.isArray(contactsData) ? contactsData : [contactsData].filter(Boolean));
        setDeals(Array.isArray(dealsData) ? dealsData : [dealsData].filter(Boolean));
        setOrders(Array.isArray(ordersData) ? ordersData : [ordersData].filter(Boolean));
        setLists(Array.isArray(listsData) ? listsData : [listsData].filter(Boolean));
        setInbox(Array.isArray(inboxData) ? inboxData : [inboxData].filter(Boolean));
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await axios.get("http://localhost:5000/stats");
        setPipelinePercents(res.data.pipelinePercents || []);
        setChartData(res.data.chartData || []);
      } catch (err) {
        console.error("Error fetching dashboard stats:", err);
      }
    };

    fetchDashboardStats();
  }, []);

  // Add lead: try preferred /api/leads then fallback to /leads
  const addLead = async (e) => {
    e.preventDefault();
    try {
      let res;
      try {
        res = await axios.post(`${baseURL}/api/leads`, newLead);
      } catch (err) {
        // fallback
        res = await axios.post(`${baseURL}/leads`, newLead);
      }
      if (res && res.data) {
        setLeads((prev) => [res.data, ...prev]);
        setLeadModal(false);
        setNewLead({ name: "", company: "", status: "New", last: new Date().toISOString() });
      }
    } catch (err) {
      console.error("Error adding lead:", err);
    }
  };

  // Add task: try /tasks then /api/tasks
  const addTask = async (e) => {
    e.preventDefault();
    try {
      let res;
      try {
        res = await axios.post(`${baseURL}/tasks`, newTask);
      } catch (err) {
        res = await axios.post(`${baseURL}/api/tasks`, newTask);
      }
      if (res && res.data) {
        setTasks((prev) => [res.data, ...prev]);
        setTaskModal(false);
        setNewTask({ title: "", due: "", status: "Pending" });
      }
    } catch (err) {
      console.error("Error adding task:", err);
    }
  };




  return (
    <DashboardLayout>
      <div className="min-h-screen bg-black text-white dark:bg-black dark:text-white pt-40 transition-colors duration-300">
        {/* Header */}
        <header className="fixed top-20 left-0 right-0 bg-black/70 dark:bg-black/40 backdrop-blur border-b border-zinc-200 dark:border-zinc-800 z-40">
          <div className="relative flex items-center justify-center px-6 py-3">
            <div className="absolute left-6 flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
              </div>
            </div>

            <nav className="flex items-center gap-4">
              {navItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.label)}
                  className={`cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl border text-sm transition ${activeTab === item.label
                    ? "bg-zinc-900 border-zinc-300 dark:border-zinc-800 text-yellow-500"
                    : "hover:bg-zinc-100 dark:hover:bg-zinc-900 border-transparent text-zinc-200 hover:text-white hover:border hover:border-yellow-500 dark:text-zinc-300"

                    }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </header>

        {/* Main */}
        <main className="p-6 space-y-6 bg-black">
          {activeTab === "Dashboard" && (
            <>
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Leads" value={leads.length} icon={Users} />
                <StatCard label="Contacts" value={contacts.length} icon={Contact2} />
                <StatCard label="Deals" value={deals.length} icon={Handshake} />
                <StatCard label="Tasks" value={tasks.length} icon={ClipboardList} />
              </div>

              {/* Pipeline + Chart */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-2">
                  <Section title="Sales Pipeline Overview" right={<Badge tone="info">This month</Badge>}>
                    {pipelinePercents.map((p) => (
                      <ProgressBar key={p.label} percent={p.value} label={p.label} />
                    ))}
                  </Section>
                </div>
                <div className="lg:col-span-3">
                  <Section title="Leads vs Deals (Trend)">
                    <div className="h-48">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-[#27272a]" />
                          <XAxis dataKey="month" stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#d4d4d8" }} />
                          <YAxis stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#d4d4d8" }} />
                          <Tooltip
                            contentStyle={{
                              background: theme === "dark" ? "#09090b" : "#fff",
                              border: "1px solid #27272a",
                              borderRadius: 12,
                            }}
                          />
                          <Line type="monotone" dataKey="leads" stroke="#f59e0b" strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="deals" stroke="#22c55e" strokeWidth={2} dot={false} />
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
                    {leads.slice(0, 3).map((a) => (
                      <li key={a.id || a._id || JSON.stringify(a)} className="flex items-start gap-3">
                        <Clock className="w-4 h-4 mt-0.5 text-zinc-400" />
                        <div>
                          <p className="text-white">{a.name ?? a.email ?? "New entry"} added</p>
                          <p className="text-xs text-zinc-500">{a.company ?? a.subject ?? ""}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Section>

                <Section
                  title="Calendar / Upcoming Tasks"
                  right={
                    <button
                      onClick={() => setActiveTab("Tasks")}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-300 text-white cursor-pointer"
                    >
                      <Plus className="w-4 h-4" /> Add Task
                    </button>
                  }
                >
                  <ul className="space-y-3">
                    {tasks.map((t) => (
                      <li
                        key={t.id || t._id || JSON.stringify(t)}
                        className="flex items-center justify-between bg-zinc-900 border border-zinc-300 dark:border-zinc-800 rounded-xl px-3 py-2"
                      >
                        <div className="flex items-center gap-3">
                          <CalendarDays className="w-4 h-4 text-zinc-400" />
                          <div>
                            <p className="text-white">{t.title ?? t.subject ?? "Untitled"}</p>
                            <p className="text-xs text-zinc-500">Due: {t.due ?? "N/A"}</p>
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
                          {t.status ?? "Pending"}
                        </Badge>

                        <Badge tone={t.status === "Scheduled" ? "info" : t.status === "Completed" ? "success" : "warn"}>{t.status}</Badge>
                      </li>
                    ))}
                  </ul>
                </Section>
              </div>
            </>
          )}

          {activeTab === "Leads" && <Leads data={leads} />}
          {activeTab === "Contacts" && <ContactsPage data={contacts} />}
          {activeTab === "Deals" && <Deals data={deals} />}
          {activeTab === "Tasks" && <Tasks data={tasks} />}
          {activeTab === "Lists" && (
            <Section title="Lists">
              <Lists data={lists} />
            </Section>
          )}
          {activeTab === "Inbox" && (
            <Section title="Inbox">
              <Inboxs data={inbox} />
            </Section>
          )}
          {activeTab === "Orders" && (
            <Section title="Orders">
              <Orders data={orders} />
            </Section>
          )}
        </main>

        {/* Lead Modal */}
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
              <button onClick={addLead} className="px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm">
                Save Lead
              </button>
            </div>
          }
        >
          <form onSubmit={addLead} className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <label className="text-sm space-y-1">
              <span className="text-zinc-700 dark:text-zinc-400">Name</span>
              <input
                value={newLead.name}
                onChange={(e) => setNewLead((v) => ({ ...v, name: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 outline-none"
                required
              />
            </label>
            <label className="text-sm space-y-1">
              <span className="text-zinc-700 dark:text-zinc-400">Company</span>
              <input
                value={newLead.company}
                onChange={(e) => setNewLead((v) => ({ ...v, company: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 outline-none"
                required
              />
            </label>
          </form>
        </Modal>

        {/* Task Modal */}
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
              <button onClick={addTask} className="px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm">
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
                onChange={(e) => setNewTask((v) => ({ ...v, title: e.target.value }))}
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
