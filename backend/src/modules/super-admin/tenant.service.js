const { Tenant, User } = require("../../models");
const bcrypt = require("bcryptjs");
const config = require("../../config/env.config");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("../../utils/httpStatus");

class TenantService {
  /**
   * Create a new restaurant tenant and its admin user.
   */
  async createTenant(data) {
    const {
      tenantId, slug, businessName,
      adminName, adminEmail, adminPassword, adminMobile,
    } = data;

    // 1. Check uniqueness
    const existing = await Tenant.findOne({ $or: [{ tenantId }, { slug }] });
    if (existing) {
      throw new ApiError(httpStatus.CONFLICT, "Tenant ID or Slug already exists");
    }

    // 2. Generate Dedicated DB URI
    // e.g. mongodb://localhost:27017/restaurant_001
    // We take the base URI and replace the DB name, or just append it if it's a connection string without DB
    const baseUri = config.mongoose.url.split('?')[0];
    const lastSlash = baseUri.lastIndexOf('/');
    const cleanBase = baseUri.substring(0, lastSlash + 1);
    const dbUri = `${cleanBase}tenant_${tenantId}`;

    // 3. Create Tenant Admin (on Master DB)
    const hashedPwd = await bcrypt.hash(adminPassword, 10);
    const adminUser = await User.create({
      tenantId,
      name: adminName,
      email: adminEmail,
      mobile: adminMobile,
      password: hashedPwd,
      role: "ADMIN",
    });

    // 4. Create Tenant Document (on Master DB)
    const tenant = await Tenant.create({
      tenantId,
      slug,
      businessName,
      businessType: "RESTAURANT",
      ownerAdminId: adminUser._id,
      dbMode: "DEDICATED",
      dbUri,
      status: data.immediateActive ? "ACTIVE" : "INACTIVE", // For self-registration, default to INACTIVE
      paymentSettings: data.paymentSettings || {},
      enabledModules: data.enabledModules || {
        dineIn: true, delivery: true, tableOrdering: true, qrOrdering: true,
      },
      theme: data.theme || {},
      contactEmail: data.contactEmail || adminEmail,
      contactPhone: data.contactPhone || adminMobile,
    });

    return { tenant, adminUser };
  }

  async getTenant(tenantId) {
    return await Tenant.findOne({ tenantId }).populate("ownerAdminId", "name email");
  }

  async updateTenant(tenantId, updateData) {
    return await Tenant.findOneAndUpdate({ tenantId }, { $set: updateData }, { new: true });
  }
}

module.exports = new TenantService();
