const mongoose = require("mongoose");

/**
 * Platform-level settings — controlled by Super Admin.
 * Singleton document (only one record, key = "main").
 */
const platformSchema = new mongoose.Schema({
  key: { type: String, default: "main", unique: true },

  // Main home page content
  home: {
    tag:         { type: String, default: "The Pinnacle of Gastronomy" },
    headline:    { type: String, default: "Savor the Art of Fine Dining" },
    subheadline: { type: String, default: "From vintage harvests to artisan gourmets, experience a culinary journey crafted with professional passion and premium seasonal ingredients." },
    ctaPrimary:  { type: String, default: "Explore Menu" },
    ctaSecondary:{ type: String, default: "Secure a Table" },
    bgImage:     { type: String, default: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&q=80" },
  },

  // Platform branding
  branding: {
    platformName: { type: String, default: "Pizza Kings" },
    tagline:      { type: String, default: "Culinary Excellence Redefined" },
    primaryColor: { type: String, default: "#c9a227" },
    logo:         { type: String, default: null },
    favicon:      { type: String, default: null },
  },

  // Footer
  footer: {
    text: { type: String, default: "© 2026 Pizza Kings. Culinary Excellence Redefined." },
  },
}, { timestamps: true });

module.exports = mongoose.model("Platform", platformSchema);
