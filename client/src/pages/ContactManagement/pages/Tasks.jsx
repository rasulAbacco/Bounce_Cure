import React, { useState } from "react";
import { Plus, CheckCircle2, Clock, XCircle } from "lucide-react";

function Tasks() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Follow up with client",
      due: "2025-08-22",
      status: "Pending",
      priority: "High",
    },
    {
      id: 2,
      title: "Prepare proposal for Acme Inc.",
      due: "2025-08-25",
      status: "In Progress",
      priority: "Medium",
    },
    {
      id: 3,
      title: "Send invoice to XYZ Corp",
      due: "2025-08-20",
      status: "Completed",
      priority: "Low",
    },
  ]);

  const [showForm, setShowForm] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    due: "",
    status: "Pending",
    priority: "Medium",
  });

  const badgeStyle = {
    Pending: "bg-yellow-900/40 text-yellow-400 border border-yellow-700",
    "In Progress": "bg-blue-900/40 text-blue-400 border border-blue-700",
    Completed: "bg-green-900/40 text-green-400 border border-green-700",
  };

  // Handle form submit
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title.trim()) return;

    setTasks([
      ...tasks,
      {
        id: tasks.length + 1,
        ...newTask,
      },
    ]);
    setNewTask({ title: "", due: "", status: "Pending", priority: "Medium" });
    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <CheckCircle2 className="w-7 h-7 text-yellow-400" /> Tasks
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-yellow-500 text-black px-4 py-2 rounded-xl font-medium hover:bg-yellow-400"
        >
          <Plus className="w-4 h-4" /> {showForm ? "Close" : "Add Task"}
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <form
          onSubmit={handleAddTask}
          className="bg-zinc-900/60 p-5 rounded-xl border border-zinc-800 space-y-4"
        >
          <div>
            <label className="block text-sm text-zinc-400">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) =>
                setNewTask({ ...newTask, title: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg outline-none text-sm"
              placeholder="Enter task title"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-zinc-400">Due Date</label>
            <input
              type="date"
              value={newTask.due}
              onChange={(e) =>
                setNewTask({ ...newTask, due: e.target.value })
              }
              className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg outline-none text-sm"
              required
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm text-zinc-400">Status</label>
              <select
                value={newTask.status}
                onChange={(e) =>
                  setNewTask({ ...newTask, status: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg outline-none text-sm"
              >
                <option>Pending</option>
                <option>In Progress</option>
                <option>Completed</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm text-zinc-400">Priority</label>
              <select
                value={newTask.priority}
                onChange={(e) =>
                  setNewTask({ ...newTask, priority: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg outline-none text-sm"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-yellow-500 text-black py-2 rounded-lg font-medium hover:bg-yellow-400"
          >
            Save Task
          </button>
        </form>
      )}

      {/* Task List */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="flex items-center justify-between bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-3 hover:bg-zinc-900/80"
          >
            <div className="flex items-center gap-3">
              {task.status === "Completed" ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : task.status === "In Progress" ? (
                <Clock className="w-5 h-5 text-blue-400" />
              ) : (
                <XCircle className="w-5 h-5 text-yellow-400" />
              )}
              <div>
                <p className="font-medium text-zinc-200">{task.title}</p>
                <p className="text-xs text-zinc-400">
                  Due: {task.due || "No date"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${badgeStyle[task.status]}`}
              >
                {task.status}
              </span>
              <span className="text-xs px-2 py-1 rounded-full border border-zinc-700 text-zinc-400">
                {task.priority} Priority
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Tasks;
