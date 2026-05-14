const { Tenant } = require("../models");
const ApiError = require("../utils/ApiError");
const httpStatus = require("../utils/httpStatus");
const asyncHandler = require("../utils/asyncHandler");
const { getTenantConnection, getMasterConnection } = require("../config/tenantDb.config");

/**
 * Resolves tenant and injects dedicated DB connection.
 *
 * Sets on req:
 *   req.tenantId  — tenant identifier string
 *   req.tenant    — full Tenant document
 *   req.db        — mongoose.Connection for this tenant's database
 */
const resolveTenant = asyncHandler(async (req, res, next) => {
  const slug =
    req.headers["x-tenant-slug"] ||
    req.query.tenant ||
    req.user?.tenantId;

  // If Super Admin accesses a global view without a specific tenant header, use master connection
  if (req.user?.role === "SUPER_ADMIN" && !slug) {
    req.tenantId = null;
    req.tenant   = null;
    req.db       = getMasterConnection();
    return next();
  }

  const slug =
    req.headers["x-tenant-slug"] ||
    req.query.tenant ||
    req.user?.tenantId;

  if (!slug) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Tenant not identified. Provide X-Tenant-Slug header.");
  }

  const tenant = await Tenant.findOne({ $or: [{ slug }, { tenantId: slug }] });

  if (!tenant) {
    throw new ApiError(httpStatus.NOT_FOUND, `Tenant '${slug}' not found.`);
  }

  if (tenant.status !== "ACTIVE") {
    throw new ApiError(httpStatus.FORBIDDEN, "This tenant account is inactive or suspended.");
  }

  req.tenantId = tenant.tenantId;
  req.tenant   = tenant;

  // Inject tenant-specific DB connection
  if (tenant.dbMode === "DEDICATED" && tenant.dbUri) {
    req.db = await getTenantConnection(tenant.tenantId, tenant.dbUri);
  } else {
    // SHARED mode — use master connection (queries still filter by tenantId)
    req.db = getMasterConnection();
  }

  next();
});

/**
 * Soft tenant resolver — does NOT throw if tenant not found.
 * Used for public routes where tenant is optional.
 */
const resolveTenantSoft = asyncHandler(async (req, res, next) => {
  const slug =
    req.headers["x-tenant-slug"] ||
    req.query.tenant ||
    req.user?.tenantId;

  if (slug) {
    try {
      const tenant = await Tenant.findOne({ $or: [{ slug }, { tenantId: slug }] });
      if (tenant && tenant.status === "ACTIVE") {
        req.tenantId = tenant.tenantId;
        req.tenant   = tenant;

        if (tenant.dbMode === "DEDICATED" && tenant.dbUri) {
          req.db = await getTenantConnection(tenant.tenantId, tenant.dbUri);
        } else {
          req.db = getMasterConnection();
        }
      }
    } catch (err) {
      // Soft resolver — never throw, just log
      console.warn("[resolveTenantSoft] Failed to resolve tenant:", err.message);
    }
  }

  // Always ensure req.db is set
  if (!req.db) req.db = getMasterConnection();
  next();
});

module.exports = { resolveTenant, resolveTenantSoft };
