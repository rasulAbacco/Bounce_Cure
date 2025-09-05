import React from "react";


const Orders = () => {
  const orders = [
    { id: "ORD-1001", plan: "Pro Plan", amount: "$49", status: "Paid", date: "2025-08-30" },
    { id: "ORD-1002", plan: "Starter Plan", amount: "$19", status: "Pending", date: "2025-09-01" },
    { id: "ORD-1003", plan: "Enterprise Plan", amount: "$199", status: "Paid", date: "2025-09-02" },
  ];



  return (
    <div className="flex min-h-screen bg-black">
      <div className="flex-1 flex flex-col">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Orders</h2>
          <div className="overflow-x-auto bg-black rounded-lg shadow">
            <table className="w-full text-white text-left ">
              <thead className="bg-[#154c7c] text-white">
                <tr>
                  <th className="px-4 py-3">Order ID</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Amount</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b hover:bg-black">
                    <td className="px-4 py-3">{order.id}</td>
                    <td className="px-4 py-3">{order.plan}</td>
                    <td className="px-4 py-3">{order.amount}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${order.status === "Paid"
                          ? "bg-green-100 text-green-600"
                          : "bg-yellow-100 text-yellow-600"
                          }`}
                      >
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{order.date}</td>
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

export default Orders;
