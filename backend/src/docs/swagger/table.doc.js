/**
 * @swagger
 * tags:
 *   name: Tables
 *   description: Table management and status
 */

/**
 * @swagger
 * /tables:
 *   get:
 *     summary: List all tables
 *     tags: [Tables]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /tables/{tableNumber}:
 *   get:
 *     summary: Get table details by number
 *     tags: [Tables]
 *     parameters:
 *       - in: path
 *         name: tableNumber
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Success
 */
