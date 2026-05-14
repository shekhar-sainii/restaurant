const orderRepository = require("./order.repository");
const ApiError = require("../../utils/ApiError");
const httpStatus = require("../../utils/httpStatus");

class OrderService {
  /**
   * Create a new order with auto-generated order number and total calculation
   */
  async createOrder(db, orderData) {
    const { items, tableNumber, guestName, guestMobile, orderType, userId, paymentMethod, tenantId } = orderData;

    if (!items || items.length === 0) {
      throw new ApiError(httpStatus.BAD_REQUEST, "Order must have at least one item");
    }
    if (!tenantId) {
      throw new ApiError(httpStatus.BAD_REQUEST, "tenantId is required");
    }

    // 1. Generate Order Number: ORD-YYYYMMDD-RAND
    const timestamp = new Date().toISOString().replace(/[-:T.Z]/g, "").slice(0, 12);
    const random = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `ORD-${timestamp}-${random}`;

    // 2. Calculate Totals
    let subtotal = 0;
    const processedItems = items.map(item => {
      const quantity = item.quantity || item.qty || 0;

      // Variation price takes priority (frontend cart stores price inside variation)
      const effectiveDiscountedPrice = item.variation?.discountedPrice ?? item.discountedPrice;
      const effectivePrice           = item.variation?.price          ?? item.price ?? 0;
      const billingPrice = effectiveDiscountedPrice ?? effectivePrice;

      subtotal += billingPrice * quantity;

      return {
        productId: item.productId || item._id,
        name: item.variation ? `${item.name} (${item.variation.name})` : item.name,
        price: effectivePrice,
        discountedPrice: effectiveDiscountedPrice,
        qty: quantity,
        image: item.image,
        isVeg: item.isVeg
      };
    });

    const tax = 0; 
    const totalAmount = subtotal + tax;

    // 3. Normalize Order Type (DINE_IN -> DINING)
    let finalOrderType = orderType;
    if (orderType === "DINE_IN") finalOrderType = "DINING";

    // 3. Prepare Final Order Object
    const finalOrder = {
      tenantId,
      orderNumber,
      items: processedItems,
      subtotal,
      totalAmount,
      orderType: finalOrderType || "DINING",
      tableNumber,
      guestName,
      guestMobile,
      orderStatus: paymentMethod === "UPI" ? "AWAITING_PAYMENT" : "RECEIVED",
      userId
    };

    const order = await orderRepository.create(db, finalOrder);
    // Notify all connected clients about the new order
    const socketManager = require("../../sockets/socketManager");
    socketManager.emit("order:new", order);
    // 4. Update Table Status if Dining
    if (finalOrderType === "DINING" && tableNumber) {
      const tableRepository = require("../table/table.repository");
      const targetTable = Number(tableNumber);
      
      console.log(`[OrderService] Attempting to book table: ${targetTable}`);
      
      const updatedTable = await tableRepository.update(
        db,
        { tableNumber: targetTable, tenantId }, 
        { 
          status: "OCCUPIED",
          activeOrderId: order._id 
        }
      );

      if (updatedTable) {
        console.log(`[OrderService] Table ${targetTable} successfully marked as OCCUPIED`);
        socketManager.emit("table:updated", updatedTable);
      }
    }

    return order;
  }

  async getUserOrders(db, userId, tenantId) {
    if (!userId) return [];
    return await orderRepository.find(db, { userId, tenantId }, { sort: { createdAt: -1 } });
  }

  async getOrdersByIds(db, orderIds, tenantId) {
    const query = { _id: { $in: orderIds } };
    if (tenantId) query.tenantId = tenantId;
    return await orderRepository.find(db, query, { sort: { createdAt: -1 } });
  }

  async getOrderById(db, id) {
    return await orderRepository.findById(db, id);
  }
}

module.exports = new OrderService();
