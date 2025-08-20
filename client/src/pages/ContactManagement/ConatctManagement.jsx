import React, { useMemo, useState } from "react";
import { Bell, Plus, Search, Filter, Users, Phone, Mail, CalendarDays, CheckCircle2, XCircle, ChevronDown, LogOut, Settings, BarChart3, Contact2, Handshake, Briefcase, ClipboardList, LayoutDashboard, Home, Clock } from "lucide-react";
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
import DashboardLayout from '../../components/DashboardLayout'
// --- helper components ---
const Section = ({ title, children, right }) => (
  <section className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl font-semibold tracking-wide text-yellow-400">{title}</h2>
      {right}
    </div>
    <div>{children}</div>
  </section>
);

const StatCard = ({ label, value, icon: Icon }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-5 shadow-xl flex items-center gap-4"
  >
    <div className="p-3 rounded-xl bg-zinc-800">
      <Icon className="w-6 h-6 text-yellow-400" />
    </div>
    <div>
      <p className="text-sm text-zinc-400">{label}</p>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  </motion.div>
);

const ProgressBar = ({ percent, label }) => (
  <div className="mb-3">
    <div className="flex justify-between text-sm mb-1">
      <span className="text-zinc-300">{label}</span>
      <span className="text-zinc-400">{percent}%</span>
    </div>
    <div className="w-full h-2 rounded-full bg-zinc-800 overflow-hidden">
      <div
        className="h-2 bg-yellow-500"
        style={{ width: `${percent}%` }}
      />
    </div>
  </div>
);

const Badge = ({ children, tone = "default" }) => {
  const tones = {
    default: "bg-zinc-800 text-zinc-100 border-zinc-700",
    success: "bg-emerald-900/30 text-emerald-300 border-emerald-800",
    warn: "bg-amber-900/30 text-amber-300 border-amber-800",
    danger: "bg-rose-900/30 text-rose-300 border-rose-800",
    info: "bg-sky-900/30 text-sky-300 border-sky-800",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${tones[tone]}`}>{children}</span>
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
        className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-yellow-400">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-zinc-800">
            <XCircle className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        {footer && <div className="mt-6 pt-4 border-t border-zinc-800">{footer}</div>}
      </motion.div>
    </div>
  );
};

// --- seed data ---
const seedActivities = [
  { id: 1, text: "John Doe added a new contact", when: "Just now" },
  { id: 2, text: "Jane Smith updated Deal status to \"Proposal Sent\"", when: "2h ago" },
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

export default function ConatctManagement() {
  const [notifications, setNotifications] = useState([
    { id: 1, type: "email", msg: "New email from HR", unread: true },
    { id: 2, type: "sms", msg: "OTP: 123456", unread: true },
    { id: 3, type: "deal", msg: "Deal moved to Proposal", unread: false },
  ]);
  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications]);

  const [leads, setLeads] = useState(seedLeads);
  const [leadModal, setLeadModal] = useState(false);
  const [taskModal, setTaskModal] = useState(false);
  const [tasks, setTasks] = useState(seedTasks);

  // simple form state
  const [newLead, setNewLead] = useState({ name: "", company: "", status: "New", last: "Aug 20" });
  const [newTask, setNewTask] = useState({ title: "", due: "", status: "Pending" });

  const addLead = (e) => {
    e.preventDefault();
    const id = leads.length ? Math.max(...leads.map(l => l.id)) + 1 : 1;
    setLeads([{ id, ...newLead }, ...leads]);
    setNewLead({ name: "", company: "", status: "New", last: "Aug 20" });
    setLeadModal(false);
  };

  const addTask = (e) => {
    e.preventDefault();
    const id = tasks.length ? Math.max(...tasks.map(t => t.id)) + 1 : 1;
    setTasks([{ id, ...newTask }, ...tasks]);
    setNewTask({ title: "", due: "", status: "Pending" });
    setTaskModal(false);
  };

  return (

   <DashboardLayout>
  <div className="min-h-screen bg-black text-white mt-20 overflow-x-hidden">
    {/* Shell */}
    <div className="grid grid-cols-12">
      
      {/* Main */}
      <main className="col-span-12 w-full">
        {/* Topbar */}
        <header className="bg-black/90 backdrop-blur border-b border-zinc-800">
          <div className="relative grid grid-cols-3 items-center px-4 md:px-8 py-3">
            {/* Brand (left) */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-yellow-400" />
              </div>
              <h1 className="text-lg font-semibold text-yellow-400">CRM Dashboard</h1>
            </div>

            {/* Nav Items (center on desktop) */}
            <nav className="hidden md:flex items-center justify-center gap-6">
              {[
                { icon: LayoutDashboard, label: "Dashboard" },
                { icon: Users, label: "Leads" },
                { icon: Contact2, label: "Contacts" },
                { icon: Handshake, label: "Deals" },
                { icon: ClipboardList, label: "Tasks" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-zinc-900/70 border border-transparent hover:border-zinc-800 text-sm"
                >
                  <item.icon className="w-4 h-4 text-zinc-300" />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Right placeholder to balance grid */}
            <div />
          </div>

          {/* Mobile Nav */}
          <div className="flex md:hidden overflow-x-auto gap-3 px-4 pb-3 border-t border-zinc-800 scrollbar-thin scrollbar-thumb-zinc-800">
            {[
              { icon: LayoutDashboard, label: "CRM" },
              { icon: Users, label: "Leads" },
              { icon: Contact2, label: "Contacts" },
              { icon: Handshake, label: "Deals" },
              { icon: ClipboardList, label: "Tasks" },
              { icon: BarChart3, label: "Analytics" },
              { icon: Settings, label: "Settings" },
            ].map((item) => (
              <button
                key={item.label}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800 text-sm shrink-0"
              >
                <item.icon className="w-4 h-4 text-zinc-300" />
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Content */}
        <div className="p-4 md:p-8 space-y-6">
          {/* Summary */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Leads This Month" value={124} icon={Users} />
            <StatCard label="New Contacts" value={87} icon={Contact2} />
            <StatCard label="Deals Closed" value={34} icon={Handshake} />
            <StatCard label="Open Tasks" value={tasks.length} icon={ClipboardList} />
          </div>

          {/* Sales pipeline + mini chart */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 w-full max-w-9xl mx-auto">
            <div className="lg:col-span-2 min-w-0">
              <Section title="Sales Pipeline Overview" right={<Badge tone="info">This month</Badge>}>
                {pipelinePercents.map((p) => (
                  <ProgressBar key={p.label} percent={p.value} label={p.label} />
                ))}
              </Section>
            </div>

            <div className="lg:col-span-3 min-w-0">
              <Section title="Leads vs Deals (Trend)">
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="month" stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                      <YAxis stroke="#a1a1aa" tickLine={false} axisLine={{ stroke: "#3f3f46" }} />
                      <Tooltip
                        contentStyle={{ background: "#09090b", border: "1px solid #27272a", borderRadius: 12 }}
                        labelStyle={{ color: "#e4e4e7" }}
                      />
                      <Line type="monotone" dataKey="leads" stroke="#f59e0b" strokeWidth={2} dot={false} />
                      <Line type="monotone" dataKey="deals" stroke="#22c55e" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Section>
            </div>
          </div>

          {/* Recent activities & calendar */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Section title="Recent Activities" right={<Badge tone="default">Auto-feed</Badge>}>
              <ul className="space-y-3">
                {seedActivities.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <Clock className="w-4 h-4 mt-0.5 text-zinc-400" />
                    <div>
                      <p className="text-sm">{a.text}</p>
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
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Add Task
                </button>
              }
            >
              <ul className="space-y-3">
                {tasks.map((t) => (
                  <li
                    key={t.id}
                    className="flex items-center justify-between bg-zinc-900/40 border border-zinc-800 rounded-xl px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <CalendarDays className="w-4 h-4 text-zinc-400" />
                      <div>
                        <p className="text-sm">{t.title}</p>
                        <p className="text-xs text-zinc-500">Due: {t.due}</p>
                      </div>
                    </div>
                    <Badge tone={t.status === "Scheduled" ? "info" : t.status === "Completed" ? "success" : "warn"}>
                      {t.status}
                    </Badge>
                  </li>
                ))}
              </ul>
            </Section>
          </div>

          {/* Leads */}
          <Section
            title="Leads"
            right={
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <select className="bg-transparent text-sm outline-none">
                    <option className="bg-zinc-900">Date</option>
                    <option className="bg-zinc-900">Source</option>
                    <option className="bg-zinc-900">Status</option>
                    <option className="bg-zinc-900">Owner</option>
                  </select>
                </div>
                <button
                  onClick={() => setLeadModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add New Lead
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-400 border-b border-zinc-800">
                    <th className="py-2 pr-4">Name</th>
                    <th className="py-2 pr-4">Company</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2 pr-4">Last Contacted</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((l) => (
                    <tr key={l.id} className="border-b border-zinc-900/60">
                      <td className="py-2 pr-4">{l.name}</td>
                      <td className="py-2 pr-4">{l.company}</td>
                      <td className="py-2 pr-4">
                        <Badge tone={l.status === "New" ? "info" : l.status === "Qualified" ? "success" : "default"}>
                          {l.status}
                        </Badge>
                      </td>
                      <td className="py-2 pr-4">{l.last}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* Contact details */}
          <Section title="Contact Details (Example: John Doe)">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="text-yellow-400 font-medium">Basic Info</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <span className="text-zinc-400">Name:</span>
                  <span>John Doe</span>
                  <span className="text-zinc-400">Email:</span>
                  <span>john@acme.com</span>
                  <span className="text-zinc-400">Phone:</span>
                  <span>+1 555-0100</span>
                  <span className="text-zinc-400">Company:</span>
                  <span>Acme Inc.</span>
                  <span className="text-zinc-400">Status:</span>
                  <span>Lead</span>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-yellow-400 font-medium">Activity Timeline</h4>
                <ul className="space-y-2 text-sm">
                  <li>- Aug 18: Email Sent</li>
                  <li>- Aug 17: Call Log</li>
                  <li>- Aug 16: Task added</li>
                </ul>
              </div>
              <div className="space-y-3">
                <h4 className="text-yellow-400 font-medium">Notes</h4>
                <ul className="space-y-2 text-sm">
                  <li>- Met at conference</li>
                  <li>- Interested in enterprise plan</li>
                </ul>
              </div>
            </div>
            <div className="mt-6">
              <div className="flex items-center gap-3 text-sm">
                <Badge tone="info">Tasks</Badge>
                <Badge tone="default">Emails</Badge>
                <Badge tone="default">Attachments</Badge>
              </div>
            </div>
          </Section>

          {/* Tasks & Activities */}
          <Section
            title="Tasks & Activities"
            right={
              <div className="flex items-center gap-2">
                <div className="hidden sm:flex items-center gap-2 bg-zinc-900/60 border border-zinc-800 rounded-xl px-3 py-1.5">
                  <Filter className="w-4 h-4 text-zinc-400" />
                  <select className="bg-transparent text-sm outline-none">
                    <option className="bg-zinc-900">Assigned To</option>
                    <option className="bg-zinc-900">Date</option>
                    <option className="bg-zinc-900">Type</option>
                  </select>
                </div>
                <button
                  onClick={() => setTaskModal(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-sm"
                >
                  <Plus className="w-4 h-4" /> Add New Task
                </button>
              </div>
            }
          >
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-zinc-400 border-b border-zinc-800">
                    <th className="py-2 pr-4">Task</th>
                    <th className="py-2 pr-4">Contact</th>
                    <th className="py-2 pr-4">Due Date</th>
                    <th className="py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { task: "Follow-up", contact: "Jane Smith", due: "Aug 21", status: "Pending" },
                    { task: "Demo Call", contact: "John Doe", due: "Aug 22", status: "Scheduled" },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-zinc-900/60">
                      <td className="py-2 pr-4">{row.task}</td>
                      <td className="py-2 pr-4">{row.contact}</td>
                      <td className="py-2 pr-4">{row.due}</td>
                      <td className="py-2 pr-4">
                        <Badge tone={row.status === "Scheduled" ? "info" : row.status === "Pending" ? "warn" : "success"}>
                          {row.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>
        </div>
      </main>
    </div>

    {/* Lead Modal */}
    <Modal
      open={leadModal}
      onClose={() => setLeadModal(false)}
      title="Add New Lead"
      footer={
        <div className="flex justify-end gap-2">
          <button onClick={() => setLeadModal(false)} className="px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-sm">
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
          <span className="text-zinc-400">Name</span>
          <input
            value={newLead.name}
            onChange={(e) => setNewLead((v) => ({ ...v, name: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 outline-none"
            required
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Company</span>
          <input
            value={newLead.company}
            onChange={(e) => setNewLead((v) => ({ ...v, company: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 outline-none"
            required
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Status</span>
          <select
            value={newLead.status}
            onChange={(e) => setNewLead((v) => ({ ...v, status: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 outline-none"
          >
            <option className="bg-zinc-900">New</option>
            <option className="bg-zinc-900">Contacted</option>
            <option className="bg-zinc-900">Qualified</option>
          </select>
        </label>
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Last Contacted</span>
          <input
            value={newLead.last}
            onChange={(e) => setNewLead((v) => ({ ...v, last: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 outline-none"
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
          <button onClick={() => setTaskModal(false)} className="px-3 py-2 rounded-lg border border-zinc-800 hover:bg-zinc-900 text-sm">
            Cancel
          </button>
          <button onClick={addTask} className="px-3 py-2 rounded-lg bg-yellow-500 text-black font-semibold text-sm">
            Save Task
          </button>
        </div>
      }
    >
      <form onSubmit={addTask} className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Title</span>
          <input
            value={newTask.title}
            onChange={(e) => setNewTask((v) => ({ ...v, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 outline-none"
            required
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Due</span>
          <input
            value={newTask.due}
            onChange={(e) => setNewTask((v) => ({ ...v, due: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 outline-none"
            placeholder="e.g., Aug 23"
          />
        </label>
        <label className="text-sm space-y-1">
          <span className="text-zinc-400">Status</span>
          <select
            value={newTask.status}
            onChange={(e) => setNewTask((v) => ({ ...v, status: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 outline-none"
          >
            <option className="bg-zinc-900">Pending</option>
            <option className="bg-zinc-900">Scheduled</option>
            <option className="bg-zinc-900">Completed</option>
          </select>
        </label>
      </form>
    </Modal>
  </div>
</DashboardLayout>
  );
}


