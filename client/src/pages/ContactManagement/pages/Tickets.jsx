
import React from "react";

const Tickets = () => {
  const tickets = [
    { id: "TCK-001", subject: "Login issue", status: "Open", priority: "High", date: "2025-09-01" },
    { id: "TCK-002", subject: "Billing not updated", status: "Pending", priority: "Medium", date: "2025-09-02" },
    { id: "TCK-003", subject: "Feature request", status: "Closed", priority: "Low", date: "2025-08-29" },
  ];

  return (
    <div className="flex min-h-screen bg-black">
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-white mb-4">All Tickets</h2>
          <div className="overflow-x-auto bg-black rounded-lg shadow">
            <table className="w-full text-sm text-left text-white">
              <thead className="bg-[#154c7c] text-white">
                <tr>
                  <th className="px-4 py-3">Ticket ID</th>
                  <th className="px-4 py-3">Subject</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr key={ticket.id} className="border-b hover:bg-black">
                    <td className="px-4 py-3">{ticket.id}</td>
                    <td className="px-4 py-3">{ticket.subject}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          ticket.status === "Open"
                            ? "bg-green-100 text-green-600"
                            : ticket.status === "Pending"
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{ticket.priority}</td>
                    <td className="px-4 py-3">{ticket.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;
