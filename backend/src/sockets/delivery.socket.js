const deliverySocket = (io, socket) => {
  socket.on("driver_location", (data) => {
    io.emit("delivery_location_update", data);
  });
};

module.exports = deliverySocket;
