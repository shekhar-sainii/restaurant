const express = require("express");
const asyncHandler = require("../../../utils/asyncHandler");
const ApiResponse = require("../../../utils/ApiResponse");
const httpStatus = require("../../../utils/httpStatus");

const router = express.Router();

class DashboardController {
  getStats = asyncHandler(async (req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Use tenant-specific DB connection
    const db = req.db;
    const Order   = db.model("Order");
    const User    = db.model("User");
    const Product = db.model("Product");
    const Table   = db.model("Table");

    // Tenant filter — super admin (tenantId=null) gets global stats
    const tf = req.tenantId ? { tenantId: req.tenantId } : {};

    const [
      totalOrders, activeOrders, totalUsers, totalProducts,
      totalTables, occupiedTables, revenueData, todayRevenueData,
      todayOrders, trendingProducts, recentActivity,
    ] = await Promise.all([
      Order.countDocuments(tf),
      Order.countDocuments({ ...tf, orderStatus: { $nin: ["DELIVERED", "CANCELLED"] } }),
      User.countDocuments({ ...tf, role: "USER" }),
      Product.countDocuments(tf),
      Table.countDocuments(tf),
      Table.countDocuments({ ...tf, status: "OCCUPIED" }),
      Order.aggregate([{ $match: { ...tf, orderStatus: "DELIVERED" } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.aggregate([{ $match: { ...tf, orderStatus: "DELIVERED", createdAt: { $gte: today } } }, { $group: { _id: null, total: { $sum: "$totalAmount" } } }]),
      Order.countDocuments({ ...tf, createdAt: { $gte: today } }),
      Order.aggregate([
        { $match: tf }, { $unwind: "$items" },
        { $group: { _id: "$items.name", count: { $sum: "$items.qty" }, image: { $first: "$items.image" } } },
        { $sort: { count: -1 } }, { $limit: 3 },
      ]),
      Order.find(tf).sort({ createdAt: -1 }).limit(5).populate("userId", "name image"),
    ]);

    return res.status(httpStatus.OK).json(new ApiResponse(httpStatus.OK, {
      totalRevenue: revenueData[0]?.total || 0,
      todayRevenue: todayRevenueData[0]?.total || 0,
      totalOrders, todayOrders, activeOrders, totalUsers,
      totalProducts, totalTables, occupiedTables,
      trendingProducts, recentActivity,
    }));
  });
}

const controller = new DashboardController();
router.get("/", controller.getStats);
module.exports = { controller, router };
