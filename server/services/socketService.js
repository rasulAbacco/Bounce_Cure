import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const viewers = {}; // conversationId => { socketId: {userId, userName} }

export function initSocket(io) {
    io.on("connection", (socket) => {
        const { userId, userName } = socket.handshake.query || {};

        // join conversation
        socket.on("join_conversation", ({ conversationId }) => {
            socket.join(`conv:${conversationId}`);
            viewers[conversationId] = viewers[conversationId] || {};
            viewers[conversationId][socket.id] = { userId, userName };
            io.to(`conv:${conversationId}`).emit("viewers", Object.values(viewers[conversationId]));
        });

        // leave conversation
        socket.on("leave_conversation", ({ conversationId }) => {
            socket.leave(`conv:${conversationId}`);
            if (viewers[conversationId]) {
                delete viewers[conversationId][socket.id];
                io.to(`conv:${conversationId}`).emit("viewers", Object.values(viewers[conversationId]));
            }
        });

        // typing indicator
        socket.on("typing", ({ conversationId, typing }) => {
            socket.to(`conv:${conversationId}`).emit("typing", { userId, userName, typing });
        });

        // send message
        socket.on(
            "send_message",
            async ({ conversationId, body, fromName, fromEmail, direction = "inbound" }) => {
                try {
                    let conversation = await prisma.conversation.findUnique({
                        where: { id: Number(conversationId) },
                    });

                    // If no conversation exists, create one
                    if (!conversation) {
                        conversation = await prisma.conversation.create({
                            data: {
                                subject: body.slice(0, 50) || "New Conversation",
                                // ✅ Removed snippet (not in schema unless you add it)
                            },
                        });
                    }

                    // Create message
                    const msg = await prisma.message.create({
                        data: {
                            conversationId: conversation.id,
                            body,
                            from: fromEmail || fromName || "unknown", // required in your schema
                            to: "support@yourcrm.com",
                            fromName,
                            fromEmail,
                            direction,
                            sentAt: new Date(),
                        },
                    });

                    // Update conversation subject (optional)
                    await prisma.conversation.update({
                        where: { id: conversation.id },
                        data: { subject: conversation.subject || body.slice(0, 50) },
                    });

                    io.to(`conv:${conversation.id}`).emit("message", msg);
                    io.emit("conversation_updated", { conversationId: conversation.id });
                } catch (err) {
                    console.error("send_message error", err);
                }
            }
        );

        // add note (internal)
        socket.on("add_note", async ({ conversationId, body }) => {
            try {
                const note = await prisma.note.create({
                    data: { conversationId: Number(conversationId), body, authorId: Number(userId) },
                });
                io.to(`conv:${conversationId}`).emit("note", note);
            } catch (err) {
                console.error("add_note error", err);
            }
        });

        // assignment
        socket.on("assign", async ({ conversationId, assigneeId }) => {
            try {
                const conv = await prisma.conversation.update({
                    where: { id: Number(conversationId) },
                    data: { assignee: assigneeId },
                });
                io.emit("conversation_assigned", conv);
            } catch (err) {
                console.error("assign error", err);
            }
        });

        // cleanup on disconnect
        socket.on("disconnecting", () => {
            for (const room of socket.rooms) {
                if (room.startsWith("conv:")) {
                    const conversationId = room.replace("conv:", "");
                    if (viewers[conversationId]) {
                        delete viewers[conversationId][socket.id];
                        io.to(room).emit("viewers", Object.values(viewers[conversationId] || {}));
                    }
                }
            }
        });
    });
}
