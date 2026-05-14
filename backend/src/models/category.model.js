const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    image: String,
    sortOrder: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);


// Remove unique constraint on slug — slug is unique per tenant, not globally
categorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });
categorySchema.index({ tenantId: 1, isActive: 1, sortOrder: 1 });

module.exports = mongoose.model("Category", categorySchema);
