const mongoose = require("mongoose");
const TABLE_STATUS = require("../common/constants/table.constant");

const tableSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    tableNumber: {
      type: Number,
      required: true,
    },
    capacity: {
      type: Number,
      default: 4,
    },
    qrCode: String,
    qrUrl: String,
    status: {
      type: String,
      enum: Object.values(TABLE_STATUS),
      default: TABLE_STATUS.AVAILABLE,
    },
    activeOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },
  },
  { timestamps: true }
);


tableSchema.index({ tenantId: 1, status: 1 });
tableSchema.index({ tenantId: 1, tableNumber: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);
