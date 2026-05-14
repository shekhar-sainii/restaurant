const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    tenantId: { type: String, required: true, index: true },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: String,
    price: {
      type: Number,
      required: true,
    },
    discountedPrice: Number,
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    image: String,
    isVeg: {
      type: Boolean,
      default: true,
    },
    hasVariations: {
      type: Boolean,
      default: false,
    },
    variations: [
      {
        name: { type: String, required: true },
        price: { type: Number, required: true },
        discountedPrice: { type: Number },
      },
    ],
    dayWisePricing: [
      {
        day: { type: Number, required: true, min: 0, max: 6 }, // 0: Sunday, 1: Monday, etc.
        discountPercentage: { type: Number, min: 0, max: 100 },
        specialPrice: { type: Number },
      },
    ],
    isAvailable: {
      type: Boolean,
      default: true,
    },
    tags: [String],
    sortOrder: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

productSchema.index({ tenantId: 1, categoryId: 1, isAvailable: 1 });
productSchema.index({ tenantId: 1, isAvailable: 1, sortOrder: 1 });

module.exports = mongoose.model("Product", productSchema);
