/**
 * TenantConnectionManager
 * Manages per-tenant MongoDB connections.
 * Each tenant gets its own dedicated database connection.
 */

const mongoose = require("mongoose");
const logger   = require("../utils/logger");

// Connection cache: tenantId → mongoose.Connection
const connectionCache = new Map();

// Master connection (for super-admin and platform-level data)
let masterConnection = null;

/**
 * Get or create a connection for a specific tenant.
 * @param {string} tenantId
 * @param {string} dbUri  - e.g. mongodb://localhost:27017/tenant_pizzakings
 * @returns {mongoose.Connection}
 */
async function getTenantConnection(tenantId, dbUri) {
  if (!dbUri) {
    throw new Error(`No dbUri configured for tenant: ${tenantId}`);
  }

  // Return cached connection if healthy
  if (connectionCache.has(tenantId)) {
    const conn = connectionCache.get(tenantId);
    if (conn.readyState === 1) return conn; // 1 = connected
    // Remove stale connection
    connectionCache.delete(tenantId);
  }

  logger.info(`[TenantDB] Creating connection for tenant: ${tenantId}`);

  const conn = await mongoose.createConnection(dbUri, {
    maxPoolSize: 5,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 30000,
  }).asPromise();

  // Register all models on this connection
  registerModels(conn);

  connectionCache.set(tenantId, conn);
  logger.info(`[TenantDB] Connected: ${tenantId} → ${dbUri}`);

  return conn;
}

/**
 * Get master connection (used by super-admin for platform data).
 */
function getMasterConnection() {
  return masterConnection || mongoose.connection;
}

/**
 * Set master connection reference.
 */
function setMasterConnection(conn) {
  masterConnection = conn;
}

/**
 * Register all Mongoose models on a given connection.
 * This is required because models are connection-specific.
 */
function registerModels(conn) {
  // Import schemas (not models — schemas are reusable)
  const schemas = require("../models/schemas");

  for (const [name, schema] of Object.entries(schemas)) {
    if (!conn.models[name]) {
      conn.model(name, schema);
    }
  }
}

/**
 * Get a model from a specific connection.
 * @param {mongoose.Connection} conn
 * @param {string} modelName
 */
function getModel(conn, modelName) {
  if (!conn) {
    // Fallback to default connection (for super-admin or shared mode)
    return mongoose.model(modelName);
  }
  return conn.model(modelName);
}

/**
 * Close all tenant connections (for graceful shutdown).
 */
async function closeAllConnections() {
  const promises = [];
  for (const [tenantId, conn] of connectionCache.entries()) {
    logger.info(`[TenantDB] Closing connection: ${tenantId}`);
    promises.push(conn.close());
  }
  await Promise.all(promises);
  connectionCache.clear();
}

/**
 * Get connection stats (for super-admin monitoring).
 */
function getConnectionStats() {
  const stats = [];
  for (const [tenantId, conn] of connectionCache.entries()) {
    stats.push({
      tenantId,
      readyState: conn.readyState,
      status: ["disconnected", "connected", "connecting", "disconnecting"][conn.readyState] || "unknown",
      host: conn.host,
      name: conn.name,
    });
  }
  return stats;
}

module.exports = {
  getTenantConnection,
  getMasterConnection,
  setMasterConnection,
  getModel,
  closeAllConnections,
  getConnectionStats,
};
