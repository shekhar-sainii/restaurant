const mongoose = require("mongoose");

const BUSINESS_TYPES = ["RESTAURANT"];
const DB_MODES       = ["DEDICATED", "SHARED"]; // DEDICATED is first/default
const PLANS          = ["FREE", "STARTER", "PRO", "ENTERPRISE"];

const tenantSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // e.g. "restaurant_001", "pizzakings"
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      // URL slug: /pizzakings
    },
    businessName: { type: String, required: true, trim: true },
    businessType: { type: String, enum: BUSINESS_TYPES, default: "RESTAURANT" },

    // Branding
    logo:        { type: String, default: null },
    favicon:     { type: String, default: null },
    banner:      { type: String, default: null },
    theme: {
      primaryColor:    { type: String, default: "#c9a227" },
      secondaryColor:  { type: String, default: "#ffffff" },
      backgroundColor: { type: String, default: "#000000" },
      surfaceColor:    { type: String, default: "#111111" },
      textColor:       { type: String, default: "#ffffff" },
      fontFamily:      { type: String, default: "Inter, sans-serif" },
      borderRadius:    { type: String, default: "1rem" },
      mode:            { type: String, default: "dark" },
    },

    // Owner / admin
    ownerAdminId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

    // Status
    status: { type: String, enum: ["ACTIVE", "INACTIVE", "SUSPENDED"], default: "ACTIVE" },

    // Database mode
    dbMode: { type: String, enum: DB_MODES, default: "DEDICATED" },
    dbUri:  { type: String, default: null }, // for future DEDICATED mode

    // Payment settings per tenant
    paymentSettings: {
      cashEnabled:     { type: Boolean, default: true },
      upiEnabled:      { type: Boolean, default: true },
      upiIdPrimary:    { type: String, default: null },
      upiIdSecondary:  { type: String, default: null },
      upiMerchantName: { type: String, default: null },
      razorpayEnabled: { type: Boolean, default: false },
      razorpayKeyId:   { type: String, default: null },
    },

    // Feature toggles — controls what modules are visible
    enabledModules: {
      dineIn:         { type: Boolean, default: true },
      delivery:       { type: Boolean, default: true },
      tableOrdering:  { type: Boolean, default: true },
      qrOrdering:     { type: Boolean, default: true },
      combos:         { type: Boolean, default: false },
      weightPricing:  { type: Boolean, default: false },
      chat:           { type: Boolean, default: true },
      staffMgmt:      { type: Boolean, default: true },
      guestOrdering:  { type: Boolean, default: true },  // false = login required
    },

    // Subscription
    subscriptionPlan:    { type: String, enum: PLANS, default: "FREE" },
    subscriptionExpiry:  { type: Date, default: null },

    // Contact
    contactEmail:  { type: String, default: null },
    contactPhone:  { type: String, default: null },
    address:       { type: String, default: null },
    location: {
      lat: { type: Number, default: 28.6139 }, // Default to Delhi for demo
      lng: { type: Number, default: 77.2090 },
    },
  },
  { timestamps: true }
);

tenantSchema.index({ slug: 1 });
tenantSchema.index({ tenantId: 1 });

module.exports = mongoose.model("Tenant", tenantSchema);
