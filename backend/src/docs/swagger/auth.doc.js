/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and Authorization
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in with email/mobile and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *               - password
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Email or Mobile number
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Success'
 *       401:
 *         description: Invalid credentials
 */

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Log out current user
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout successful
 */
