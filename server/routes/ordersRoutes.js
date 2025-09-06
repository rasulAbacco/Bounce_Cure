import express from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = express.Router();

// ✅ Helper function to generate order codes
async function generateOrderCode() {
  const lastOrder = await prisma.order.findFirst({
    orderBy: { timestamp: "desc" },
  });
  let lastNumber = 1000; // Starting point
  if (lastOrder?.orderCode) {
    const match = lastOrder.orderCode.match(/\d+$/);
    if (match) lastNumber = parseInt(match[0]);
  }
  return `ORD-${lastNumber + 1}`;
}

// ✅ Get all orders
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { timestamp: "desc" },
    });
    // Convert BigInt to number for frontend safety
    const safeOrders = orders.map((order) => ({
      id: order.orderCode, // Use orderCode as id for frontend
      name: order.name || "",
      phone: order.phone || "",
      plan: order.plan,
      amount: order.amount,
      status: order.status,
      date: order.date,
      timestamp: Number(order.timestamp),
    }));
    res.json(safeOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ✅ Create a new order
router.post("/", async (req, res) => {
  try {
    const { name, phone, plan, amount, status, date } = req.body;
    if (!plan || !amount || !status || !date) {
      return res.status(400).json({ error: "Plan, amount, status, and date are required" });
    }
    const orderCode = await generateOrderCode();
    const newOrder = await prisma.order.create({
      data: {
        orderCode,
        name: name || null,
        phone: phone || null,
        plan,
        amount,
        status,
        date,
        timestamp: BigInt(Date.now()),
      },
    });
    res.status(201).json({
      id: newOrder.orderCode, // Use orderCode as id for frontend
      name: newOrder.name || "",
      phone: newOrder.phone || "",
      plan: newOrder.plan,
      amount: newOrder.amount,
      status: newOrder.status,
      date: newOrder.date,
      timestamp: Number(newOrder.timestamp),
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// ✅ Update order
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, plan, amount, status, date } = req.body;
    
    // First find the order by orderCode
    const order = await prisma.order.findFirst({
      where: { orderCode: id }
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: { 
        name: name || null,
        phone: phone || null,
        plan, 
        amount, 
        status, 
        date 
      },
    });
    
    res.json({
      id: updatedOrder.orderCode,
      name: updatedOrder.name || "",
      phone: updatedOrder.phone || "",
      plan: updatedOrder.plan,
      amount: updatedOrder.amount,
      status: updatedOrder.status,
      date: updatedOrder.date,
      timestamp: Number(updatedOrder.timestamp),
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ✅ Delete order
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    // First find the order by orderCode
    const order = await prisma.order.findFirst({
      where: { orderCode: id }
    });
    
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    await prisma.order.delete({ where: { id: order.id } });
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ✅ Get deleted orders (if you have a soft delete mechanism)
router.get("/deleted", async (req, res) => {
  try {
    // If you implement soft delete, fetch deleted orders here
    // For now, return empty array
    res.json([]);
  } catch (error) {
    console.error("Error fetching deleted orders:", error);
    res.status(500).json({ error: "Failed to fetch deleted orders" });
  }
});

// ✅ Restore deleted order (if you have a soft delete mechanism)
router.put("/restore/:id", async (req, res) => {
  try {
    // If you implement soft delete, restore logic here
    res.status(404).json({ error: "Not implemented" });
  } catch (error) {
    console.error("Error restoring order:", error);
    res.status(500).json({ error: "Failed to restore order" });
  }
});

// ✅ Permanent delete order (if you have a soft delete mechanism)
router.delete("/permanent/:id", async (req, res) => {
  try {
    // If you implement soft delete, permanent delete logic here
    res.status(404).json({ error: "Not implemented" });
  } catch (error) {
    console.error("Error permanently deleting order:", error);
    res.status(500).json({ error: "Failed to permanently delete order" });
  }
});

export default router;