/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order placement and management
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Place a new order
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - orderType
 *               - items
 *             properties:
 *               orderType:
 *                 type: string
 *                 enum: [DINING, DELIVERY]
 *               tableNumber:
 *                 type: integer
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     productId:
 *                       type: string
 *                     qty:
 *                       type: integer
 *     responses:
 *       201:
 *         description: Order created
 */

/**
 * @swagger
 * /orders/{id}:
 *   get:
 *     summary: Get order details by ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
