const jwt = require("jsonwebtoken");
const config = require("../config/env.config");
const { User, Message } = require("../models");

const STAFF_ROLES = ["ADMIN", "KITCHEN", "DELIVERY"];

const chatSocket = (io, socket) => {
  // Authenticate and join staff room
  socket.on("chat:join", async ({ token }) => {
    try {
      const decoded = jwt.verify(token, config.jwt.accessSecret);
      const user = await User.findById(decoded.sub).select("name role isActive tenantId");

      if (!user || !STAFF_ROLES.includes(user.role) || !user.isActive) {
        socket.emit("chat:error", { message: "Unauthorized" });
        return;
      }

      socket.data.user = { _id: user._id, name: user.name, role: user.role, tenantId: user.tenantId };
      const ROOM = `staff_${user.tenantId || "global"}`;
      socket.join(ROOM);

      // Send last 50 messages for this tenant
      const history = await Message.find({ tenantId: user.tenantId, room: ROOM })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();

      socket.emit("chat:history", history.reverse());

      io.to(ROOM).emit("chat:user_joined", {
        name: user.name,
        role: user.role,
        socketId: socket.id,
      });
    } catch {
      socket.emit("chat:error", { message: "Invalid token" });
    }
  });

  socket.on("chat:message", async ({ text }) => {
    const user = socket.data.user;
    if (!user || !text?.trim()) return;

    const ROOM = `staff_${user.tenantId || "global"}`;

    const msg = await Message.create({
      tenantId: user.tenantId,
      senderId: user._id,
      senderName: user.name,
      senderRole: user.role,
      text: text.trim(),
      room: ROOM,
    });

    io.to(ROOM).emit("chat:message", {
      _id: msg._id,
      senderId: user._id,
      senderName: user.name,
      senderRole: user.role,
      text: msg.text,
      createdAt: msg.createdAt,
    });
  });

  socket.on("chat:typing", ({ isTyping }) => {
    const user = socket.data.user;
    if (!user) return;
    const ROOM = `staff_${user.tenantId || "global"}`;
    socket.to(ROOM).emit("chat:typing", {
      name: user.name,
      role: user.role,
      isTyping,
    });
  });

  socket.on("disconnect", () => {
    const user = socket.data.user;
    if (user) {
      const ROOM = `staff_${user.tenantId || "global"}`;
      io.to(ROOM).emit("chat:user_left", { name: user.name, role: user.role });
    }
  });
};

module.exports = chatSocket;
