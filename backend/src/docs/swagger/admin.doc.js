/**
 * @swagger
 * tags:
 *   name: Admin
 *   description: Administrative operations (Requires ADMIN role)
 */

/**
 * @swagger
 * /admin/dashboard:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stats retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */

/**
 * @swagger
 * /admin/order-mgmt:
 *   get:
 *     summary: List all orders in the system
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /admin/order-mgmt/{id}/status:
 *   patch:
 *     summary: Update order status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, PREPARING, READY, SERVED, CANCELLED]
 *     responses:
 *       200:
 *         description: Order status updated
 */

/**
 * @swagger
 * /admin/product-mgmt:
 *   post:
 *     summary: Create a new product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, price, category]
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *               category: { type: string }
 *               description: { type: string }
 *               imageUrl: { type: string }
 *     responses:
 *       201:
 *         description: Product created
 */

/**
 * @swagger
 * /admin/product-mgmt/{id}:
 *   put:
 *     summary: Update an existing product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               price: { type: number }
 *     responses:
 *       200:
 *         description: Product updated
 *   delete:
 *     summary: Delete a product
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Product deleted
 */

/**
 * @swagger
 * /admin/category-mgmt:
 *   post:
 *     summary: Create a new category
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string }
 *     responses:
 *       201:
 *         description: Category created
 */

/**
 * @swagger
 * /admin/table-mgmt:
 *   post:
 *     summary: Create a new table
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [tableNumber]
 *             properties:
 *               tableNumber: { type: integer }
 *               capacity: { type: integer }
 *     responses:
 *       201:
 *         description: Table created
 */

/**
 * @swagger
 * /admin/payment-mgmt:
 *   get:
 *     summary: List all transactions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /admin/user-mgmt:
 *   get:
 *     summary: List all registered users
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
