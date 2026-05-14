const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    tenantId:   { type: String, required: true, index: true },
    senderId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    senderName: { type: String, required: true },
    senderRole: { type: String, required: true },
    text:       { type: String, required: true, trim: true, maxlength: 1000 },
    room:       { type: String, default: "staff" },
  },
  { timestamps: true }
);

messageSchema.index({ tenantId: 1, room: 1, createdAt: -1 });

module.exports = mongoose.model("Message", messageSchema);
