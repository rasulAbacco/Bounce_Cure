// orders.jsx
import React, { useState, useMemo, useEffect } from "react";
const API_URL1 = import.meta.env.VITE_VRI_URL;
const API_URL = `${API_URL1}/orders`; // Your Express API

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "descending" });
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentOrder, setCurrentOrder] = useState(null);
  const [viewOrder, setViewOrder] = useState(null);

  const statusOptions = ["Open", "Processed", "Delivered", "Paid", "Pending", "Cancelled"];
  const planOptions = ["Basic Plan", "Starter Plan", "Pro Plan", "Enterprise Plan"];

  const statusColors = {
    paid: "bg-emerald-500",
    pending: "bg-amber-500",
    cancelled: "bg-rose-500",
    delivered: "bg-violet-500",
    processed: "bg-blue-500",
    open: "bg-gray-500",
  };

  // Mock data for fallback
  const mockOrders = [
    { id: "ORD-1001", name: "John Doe", phone: "+1 (555) 123-4567", plan: "Pro Plan", amount: "$49", status: "Paid", date: "2025-08-30" },
    { id: "ORD-1002", name: "Jane Smith", phone: "+1 (555) 987-6543", plan: "Starter Plan", amount: "$19", status: "Pending", date: "2025-09-01" },
    { id: "ORD-1003", name: "Robert Johnson", phone: "+1 (555) 456-7890", plan: "Enterprise Plan", amount: "$199", status: "Paid", date: "2025-09-02" },
  ];

  // Fetch orders from backend on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  async function fetchOrders() {
    try {
      setLoading(true);

      const token = localStorage.getItem("token"); // or sessionStorage if that's what you're using

      const res = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setOrders(data);
    } catch (err) {
      console.error("Failed to fetch orders:", err);  
      // Fallback to mock data for development
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  }


  const calculateRevenue = () => {
    return orders.reduce((sum, order) => {
      // Check if amount exists and is a string
      if (!order.amount || typeof order.amount !== 'string') return sum;

      const numericValue = parseInt(order.amount.replace(/[^0-9]/g, ''));
      return sum + (isNaN(numericValue) ? 0 : numericValue);
    }, 0);
  };

  const getStatusBadgeClass = (status) => {
    const statusLower = status.toLowerCase();
    const colorClass = statusColors[statusLower] || "bg-gray-500";
    return `${colorClass} text-white px-3 py-1 rounded-full text-xs font-medium`;
  };

  const openModal = (mode, order = null) => {
    setModalMode(mode);
    setCurrentOrder(order || {
      name: "",
      phone: "",
      plan: "Starter Plan",
      amount: "$19",
      status: "Open",
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  async function handleSave() {
    const token = localStorage.getItem("token");

    try {
      // Clean and validate amount: remove non-numeric except decimal point
      const cleanAmountStr = currentOrder.amount
        .toString()
        .replace(/[^0-9.]/g, '');

      const amountNum = parseFloat(cleanAmountStr);

      if (isNaN(amountNum) || amountNum <= 0) {
        alert("Amount must be a positive number");
        return; // Stop saving if invalid amount
      }

      // Construct payload with cleaned amount string and date
      const payload = {
        ...currentOrder,
        amount: cleanAmountStr, // always a positive numeric string
        date: currentOrder.date,
      };

      let res;

      if (modalMode === "create") {
        res = await fetch(API_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch(`${API_URL}/${currentOrder.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Server responded with ${res.status}: ${errorText}`);
        throw new Error(errorText);
      }

      const savedOrder = await res.json();

      if (modalMode === "create") {
        setOrders([savedOrder, ...orders]);
      } else {
        setOrders(orders.map(o => (o.id === savedOrder.id ? savedOrder : o)));
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("Failed to save order:", err);
      // Optional: fallback local state update
    }
  }


  // ✅ Updated delete function with token
  const handleDelete = async (order) => {
    const token = localStorage.getItem("token");

    if (window.confirm(`Are you sure you want to delete order ${order.id}?`)) {
      try {
        const res = await fetch(`${API_URL}/${order.id}`, {
          method: "DELETE",
          headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!res.ok) {
          throw new Error(`Server responded with ${res.status}: ${res.statusText}`);
        }

        setOrders(orders.filter(o => o.id !== order.id));
      } catch (err) {
        console.error("Failed to delete order:", err);
        setOrders(orders.filter(o => o.id !== order.id)); // Fallback
      }
    }
  };


  const filteredOrders = useMemo(() => {
    let result = orders;
    if (filter !== "all") {
      result = result.filter(order => order.status.toLowerCase() === filter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(order =>
        order.id.toLowerCase().includes(term) ||
        order.plan.toLowerCase().includes(term) ||
        (order.name && order.name.toLowerCase().includes(term)) ||
        (order.phone && order.phone.toLowerCase().includes(term))
      );
    }
    if (sortConfig.key) {
      result = [...result].sort((a, b) => {
        if (sortConfig.key === "date") {
          const dateA = new Date(a.date);
          const dateB = new Date(b.date);
          return sortConfig.direction === "ascending"
            ? dateA - dateB
            : dateB - dateA;
        }

        if (sortConfig.key === "amount") {
          const amountA = parseFloat(a.amount.replace(/[^0-9.-]+/g, ""));
          const amountB = parseFloat(b.amount.replace(/[^0-9.-]+/g, ""));
          return sortConfig.direction === "ascending"
            ? amountA - amountB
            : amountB - amountA;
        }

        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return result;
  }, [filter, orders, searchTerm, sortConfig]);

  const downloadCSV = () => {
    const headers = ["ID", "Name", "Phone", "Plan", "Amount", "Status", "Date"];
    const csvContent = [
      headers.join(','),
      ...orders.map(order => [
        order.id,
        order.name || "",
        order.phone || "",
        order.plan,
        order.amount,
        order.status,
        order.date
      ].join(','))
    ].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `orders_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openViewModal = (order) => {
    setViewOrder(order);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading orders...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black from-indigo-50 to-white p-4 md:p-8">
      {/* Header with Buttons */}
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Orders Dashboard</h1>
            <p className="text-gray-300">Track, manage, and analyze your orders in one place</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => openModal("create")}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Create Order
            </button>
            <button
              onClick={downloadCSV}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer rounded-lg font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-700">
          <div className="text-gray-100 text-lg font-bold mb-1">Total Orders</div>
          <div className="text-2xl font-bold text-white">{orders.length}</div>
        </div>
        <div className="bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-700">
          <div className="text-gray-300 text-lg font-bold mb-1">Pending</div>
          <div className="text-2xl font-bold text-amber-400">
            {orders.filter((o) => o.status === "Pending").length}
          </div>
        </div>
        <div className="bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-700">
          <div className="text-gray-300 text-lg font-bold mb-1">Completed</div>
          <div className="text-2xl font-bold text-emerald-400">
            {orders.filter((o) => o.status === "Paid" || o.status === "Delivered").length}
          </div>
        </div>
        {/* <div className="bg-gray-900 p-5 rounded-lg shadow-sm border border-gray-700">
          <div className="text-gray-300 text-lg font-bold mb-1">Revenue</div>
          <div className="text-2xl font-bold text-indigo-400">
            ${calculateRevenue()}
          </div>
        </div> */}
      </div>

      {/* Filters and Search */}
      <div className="bg-black p-5 rounded-lg shadow-sm border  mb-8 border-[#c2831f]">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {["all", ...statusOptions.map((s) => s.toLowerCase())].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all border cursor-pointer 
                    ${filter === status
                    ? "bg-[#c2831f] text-white border-[#c2831f]" // Active state
                    : "bg-black text-white border-white hover:bg-gray-800"} // Inactive state`}
              >
                {status === "all" ? "All" : status}
              </button>

            ))}
          </div>
          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search orders..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-900 border border-[#c2831f] text-gray-200 placeholder-gray-400 focus:ring-[#c2831f] focus:ring-[#c2831f] focus:border-[#c2831f]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-black rounded-xl shadow-sm border border-gray-900 overflow-hidden ">
        <table className="w-full">
          <thead className="bg-white">
            <tr>
              {["id", "name", "phone", "plan", "amount", "status", "date"].map((key) => (
                <th
                  key={key}
                  className="px-4 py-3 text-left text-black font-bold  uppercase "
                  onClick={() => setSortConfig({
                    key,
                    direction: sortConfig.key === key && sortConfig.direction === "ascending"
                      ? "descending" : "ascending"
                  })}
                >
                  <div className="flex items-center">
                    {key}
                    {sortConfig.key === key && (
                      <span className="ml-1">
                        {sortConfig.direction === "ascending" ? "↑" : "↓"}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              <th className="px-4 py-3 text-center text-black font-bold uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="">
                <td className="px-4 py-3 font-medium text-gray-100">{order.id}</td>
                <td className="px-4 py-3 text-gray-100">{order.name || "N/A"}</td>
                <td className="px-4 py-3 text-gray-100">{order.phone || "N/A"}</td>
                <td className="px-4 py-3 text-gray-100">{order.plan}</td>
                <td className="px-4 py-3 font-medium text-gray-100">{order.amount}</td>
                <td className="px-4 py-3">
                  <span className={getStatusBadgeClass(order.status)}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500">{order.date}</td>
                <td className="px-4 py-3 text-center">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => openModal("edit", order)}
                      className="text-indigo-600 hover:text-indigo-900 p-1 rounded-full hover:bg-indigo-50 cursor-pointer"
                      title="Edit"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => openViewModal(order)}
                      className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 cursor-pointer"
                      title="View"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(order)}
                      className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 cursor-pointer"
                      title="Delete"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-2">📭</div>
            <p className="text-lg font-medium text-gray-900">No orders found</p>
            <p className="text-gray-500">Try adjusting filters or search terms</p>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && currentOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h3 className="text-black font-bold  mb-4">
                {modalMode === "create" ? "Create Order" : "Edit Order"}
              </h3>
              <div className="space-y-4">
                {modalMode === "edit" && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                    <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">{currentOrder.id}</div>
                  </div>
                )}
                <div>
                  <label className="block text-black font-medium text-gray-700 mb-1">Customer Name</label>
                  <input
                    type="text"
                    value={currentOrder.name || ""}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, name: e.target.value })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter customer name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={currentOrder.phone || ""}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, phone: e.target.value })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Enter phone number"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <select
                    value={currentOrder.plan}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, plan: e.target.value })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {planOptions.map(plan => <option key={plan}>{plan}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <input
                    type="text"
                    value={currentOrder.amount}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, amount: e.target.value })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={currentOrder.status}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, status: e.target.value })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    {statusOptions.map(status => <option key={status}>{status}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={currentOrder.date}
                    onChange={(e) => setCurrentOrder({ ...currentOrder, date: e.target.value })}
                    className="w-full px-3 py-2 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 cursor-pointer"
                >
                  {modalMode === "create" ? "Create" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {isViewModalOpen && viewOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md animate-fade-in">
            <div className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Order Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Order ID</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">{viewOrder.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">{viewOrder.name || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">{viewOrder.phone || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">{viewOrder.plan}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">{viewOrder.amount}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <span className={getStatusBadgeClass(viewOrder.status)}>
                    {viewOrder.status}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-900">{viewOrder.date}</div>
                </div>
              </div>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setIsViewModalOpen(false)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Orders;