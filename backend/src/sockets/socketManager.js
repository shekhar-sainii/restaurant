let io;

/**
 * Socket Manager to hold the global IO instance
 */
const socketManager = {
  init: (ioInstance) => {
    io = ioInstance;
    console.log("[SocketManager] IO instance initialized");
  },
  
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },

  emit: (event, data) => {
    if (io) {
      io.emit(event, data);
    }
  }
};

module.exports = socketManager;
