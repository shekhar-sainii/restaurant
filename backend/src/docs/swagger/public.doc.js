/**
 * @swagger
 * tags:
 *   name: Public
 *   description: Publicly accessible endpoints for consumers
 */

/**
 * @swagger
 * /public/categories:
 *   get:
 *     summary: List all active categories
 *     tags: [Public]
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */

/**
 * @swagger
 * /public/products:
 *   get:
 *     summary: List all available products
 *     tags: [Public]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category slug
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 */

/**
 * @swagger
 * /public/tables/{tableNumber}:
 *   get:
 *     summary: Get table status by number
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         schema:
 *           type: integer
 *         description: The table number
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Table not found
 */
