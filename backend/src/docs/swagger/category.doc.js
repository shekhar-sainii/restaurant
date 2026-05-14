/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category information and listing
 */

/**
 * @swagger
 * /categories:
 *   get:
 *     summary: List all categories
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: Success
 */

/**
 * @swagger
 * /categories/{slug}:
 *   get:
 *     summary: Get category by slug
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 *       404:
 *         description: Category not found
 */
