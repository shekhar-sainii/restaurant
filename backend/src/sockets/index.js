const kitchenSocket = require("./kitchen.socket");
const deliverySocket = require("./delivery.socket");
const chatSocket = require("./chat.socket");

const initSocket = (io) => {
  io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    kitchenSocket(io, socket);
    deliverySocket(io, socket);
    chatSocket(io, socket);

    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
};

module.exports = initSocket;
