const kitchenSocket = (io, socket) => {
  socket.on("new_order", (data) => {
    io.emit("kitchen_new_order", data);
  });

  socket.on("order_preparing", (data) => {
    io.emit("order_status_update", { ...data, status: "PREPARING" });
  });
};

module.exports = kitchenSocket;
