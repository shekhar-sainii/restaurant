/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment processing with Razorpay
 */

/**
 * @swagger
 * /payments/create-order:
 *   post:
 *     summary: Create a new Razorpay order
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *     responses:
 *       201:
 *         description: Razorpay order created
 */

/**
 * @swagger
 * /payments/verify:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: Payment verified
 */
