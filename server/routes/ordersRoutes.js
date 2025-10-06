// server/routes/ordersRoutes.js
import express from "express";
import { prisma } from "../prisma/prismaClient.js";
import { protect } from "../middleware/authMiddleware.js";
import { z } from "zod";

const router = express.Router();

// ✅ All routes require auth
router.use(protect);

// ================== VALIDATION SCHEMA ==================
const orderSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  plan: z.string().min(1, "Plan is required"),
  amount: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    }),
  status: z.string().min(1, "Status is required"),
  date: z.string()
    .refine((val) => /^\d{4}-\d{2}-\d{2}$/.test(val), {
      message: "Date must be in YYYY-MM-DD format",
    }),
});


// ================== ORDER CODE GENERATOR ==================
async function generateOrderCode(userId) {
  const lastOrder = await prisma.order.findFirst({
    where: { userId },
    orderBy: { id: "desc" },
  });

  let lastNumber = 1000;
  if (lastOrder?.orderCode) {
    const match = lastOrder.orderCode.match(/\d+$/);
    if (match) lastNumber = parseInt(match[0]);
  }

  return `ORD-${lastNumber + 1}`;
}

// ================== GET ALL ORDERS (user only) ==================
router.get("/", async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id, deleted: false },
      orderBy: [{ date: "desc" }, { id: "desc" }],
    });

    res.json(
      orders.map((order) => ({
        id: order.orderCode,
        name: order.name || "",
        phone: order.phone || "",
        plan: order.plan,
        amount: order.amount,
        status: order.status,
        date: order.date,
      }))
    );
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// ================== CREATE ORDER (user only) ==================
router.post("/", async (req, res) => {
  try {
    const parsed = orderSchema.safeParse(req.body);

    if (!parsed.success) {
      console.warn("Validation failed:", parsed.error.errors);
      return res.status(400).json({ error: parsed.error.errors });
    }

    const { name, phone, plan, amount, status, date } = parsed.data;

    console.log("Parsed order data:", parsed.data);
    console.log("User ID:", req.user.id);

    let orderCode;
    let newOrder;
    let attempts = 0;

    while (attempts < 5) {
      try {
        orderCode = await generateOrderCode(req.user.id);
        console.log("Generated orderCode:", orderCode);

        newOrder = await prisma.order.create({
          data: {
            orderCode,
            name,
            phone,
            plan,
            amount: String(amount), // ✅ convert amount to string (matches schema)
            status,
            date,
            userId: req.user.id,
          },
        });

        console.log("Order created successfully:", newOrder);
        break;
      } catch (err) {
        console.error("Order creation attempt failed:", err);
        if (err.code === "P2002") {
          attempts++;
        } else {
          throw err;
        }
      }
    }

    if (!newOrder) {
      console.error("All attempts to create order failed");
      return res.status(500).json({ error: "Failed to create order after multiple attempts" });
    }

    return res.status(201).json({
      id: newOrder.orderCode,
      name: newOrder.name || "",
      phone: newOrder.phone || "",
      plan: newOrder.plan,
      amount: newOrder.amount,
      status: newOrder.status,
      date: newOrder.date,
    });

  } catch (error) {
    console.error("Unexpected error creating order:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// ================== UPDATE ORDER (user only) ==================
router.put("/:id", async (req, res) => {
  try {
    const parsed = orderSchema.partial().safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.errors });
    }

    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { orderCode: id, userId: req.user.id, deleted: false },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: parsed.data,
    });

    res.json({
      id: updatedOrder.orderCode,
      name: updatedOrder.name || "",
      phone: updatedOrder.phone || "",
      plan: updatedOrder.plan,
      amount: updatedOrder.amount,
      status: updatedOrder.status,
      date: updatedOrder.date,
    });
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).json({ error: "Failed to update order" });
  }
});

// ================== SOFT DELETE ORDER (user only) ==================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { orderCode: id, userId: req.user.id, deleted: false },
    });

    if (!order) return res.status(404).json({ error: "Order not found" });

    await prisma.order.update({
      where: { id: order.id },
      data: { deleted: true },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// ================== GET DELETED ORDERS (user only) ==================
router.get("/deleted", async (req, res) => {
  try {
    const deletedOrders = await prisma.order.findMany({
      where: { userId: req.user.id, delete: true },
      orderBy: [{ deletedAt: "desc" }],
    });

    res.json(deletedOrders);
  } catch (error) {
    console.error("Error fetching deleted orders:", error);
    res.status(500).json({ error: "Failed to fetch deleted orders" });
  }
});

// ================== RESTORE ORDER (user only) ==================
router.put("/restore/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findFirst({
      where: { orderCode: id, userId: req.user.id, deleted:true },
    });

    if (!order) return res.status(404).json({ error: "Deleted order not found" });

    const restoredOrder = await prisma.order.update({
      where: { id: order.id },
      data: { deleted: false },
    });

    res.json(restoredOrder);
  } catch (error) {
    console.error("Error restoring order:", error);
    res.status(500).json({ error: "Failed to restore order" });
  }
});

export default router;


// //server/routes/ordersRoutes.js
// import express from "express";
// import { PrismaClient } from "@prisma/client";
// const prisma = new PrismaClient();
// const router = express.Router();

// // ✅ Helper function to generate order codes
// async function generateOrderCode() {
//   try {
//     // Get the current maximum order code number
//     const lastOrder = await prisma.order.findFirst({
//       orderBy: { id: "desc" }, // Use id instead of date for more reliable ordering
//     });
    
//     let lastNumber = 1000; // Starting point
//     if (lastOrder?.orderCode) {
//       const match = lastOrder.orderCode.match(/\d+$/);
//       if (match) {
//         lastNumber = parseInt(match[0]);
//       }
//     }
    
//     // Ensure we always get a new number
//     const newNumber = lastNumber + 1;
//     return `ORD-${newNumber}`;
//   } catch (error) {
//     console.error("Error generating order code:", error);
//     // Fallback to timestamp-based code if there's an error
//     return `ORD-${Date.now()}`;
//   }
// }

// // ✅ Get all orders
// router.get("/", async (req, res) => {
//   try {
//     const orders = await prisma.order.findMany({
//       orderBy: { date: "desc" },
//     });
//     // Convert BigInt to number for frontend safety
//     const safeOrders = orders.map((order) => ({
//       id: order.orderCode, // Use orderCode as id for frontend
//       name: order.name || "",
//       phone: order.phone || "",
//       plan: order.plan,
//       amount: order.amount,
//       status: order.status,
//       date: order.date,
//     }));
//     res.json(safeOrders);
//   } catch (error) {
//     console.error("Error fetching orders:", error);
//     res.status(500).json({ error: "Failed to fetch orders" });
//   }
// });

// // ✅ Create a new order
// router.post("/", async (req, res) => {
//   try {
//     const { name, phone, plan, amount, status, date } = req.body;
//     if (!plan || !amount || !status || !date) {
//       return res.status(400).json({ error: "Plan, amount, status, and date are required" });
//     }
    
//     // Generate a unique order code
//     let orderCode;
//     let attempts = 0;
//     const maxAttempts = 10;
    
//     while (attempts < maxAttempts) {
//       try {
//         orderCode = await generateOrderCode();
        
//         // Check if the generated order code already exists
//         const existingOrder = await prisma.order.findUnique({
//           where: { orderCode }
//         });
        
//         if (!existingOrder) {
//           break; // Found a unique order code
//         }
        
//         attempts++;
//       } catch (error) {
//         console.error("Error checking order code uniqueness:", error);
//         attempts++;
//       }
//     }
    
//     if (attempts >= maxAttempts) {
//       return res.status(500).json({ error: "Failed to generate unique order code" });
//     }
    
//     const newOrder = await prisma.order.create({
//       data: {
//         orderCode,
//         name: name || null,
//         phone: phone || null,
//         plan,
//         amount,
//         status,
//         date,
//       },
//     });
    
//     res.status(201).json({
//       id: newOrder.orderCode,
//       name: newOrder.name || "",
//       phone: newOrder.phone || "",
//       plan: newOrder.plan,
//       amount: newOrder.amount,
//       status: newOrder.status,
//       date: newOrder.date,
//     });
//   } catch (error) {
//     console.error("Error creating order:", error);
//     res.status(500).json({ error: "Failed to create order" });
//   }
// });

// // ✅ Update order
// router.put("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { name, phone, plan, amount, status, date } = req.body;
    
//     // First find the order by orderCode
//     const order = await prisma.order.findFirst({
//       where: { orderCode: id }
//     });
    
//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }
    
//     const updatedOrder = await prisma.order.update({
//       where: { id: order.id },
//       data: { 
//         name: name || null,
//         phone: phone || null,
//         plan, 
//         amount, 
//         status, 
//         date 
//       },
//     });
    
//     res.json({
//       id: updatedOrder.orderCode,
//       name: updatedOrder.name || "",
//       phone: updatedOrder.phone || "",
//       plan: updatedOrder.plan,
//       amount: updatedOrder.amount,
//       status: updatedOrder.status,
//       date: updatedOrder.date,
//     });
//   } catch (error) {
//     console.error("Error updating order:", error);
//     res.status(500).json({ error: "Failed to update order" });
//   }
// });

// // ✅ Delete order
// router.delete("/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
    
//     // First find the order by orderCode
//     const order = await prisma.order.findFirst({
//       where: { orderCode: id }
//     });
    
//     if (!order) {
//       return res.status(404).json({ error: "Order not found" });
//     }
    
//     await prisma.order.delete({ where: { id: order.id } });
//     res.json({ success: true });
//   } catch (error) {
//     console.error("Error deleting order:", error);
//     res.status(500).json({ error: "Failed to delete order" });
//   }
// });

// // ✅ Get deleted orders (if you have a soft delete mechanism)
// router.get("/deleted", async (req, res) => {
//   try {
//     // If you implement soft delete, fetch deleted orders here
//     // For now, return empty array
//     res.json([]);
//   } catch (error) {
//     console.error("Error fetching deleted orders:", error);
//     res.status(500).json({ error: "Failed to fetch deleted orders" });
//   }
// });

// // ✅ Restore deleted order (if you have a soft delete mechanism)
// router.put("/restore/:id", async (req, res) => {
//   try {
//     // If you implement soft delete, restore logic here
//     res.status(404).json({ error: "Not implemented" });
//   } catch (error) {
//     console.error("Error restoring order:", error);
//     res.status(500).json({ error: "Failed to restore order" });
//   }
// });

// // ✅ Permanent delete order (if you have a soft delete mechanism)
// router.delete("/permanent/:id", async (req, res) => {
//   try {
//     // If you implement soft delete, permanent delete logic here
//     res.status(404).json({ error: "Not implemented" });
//   } catch (error) {
//     console.error("Error permanently deleting order:", error);
//     res.status(500).json({ error: "Failed to permanently delete order" });
//   }
// });

// export default router;
