const swaggerJsdoc = require("swagger-jsdoc");
const { port } = require("./env.config");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pizza Kings API",
      version: "1.0.0",
      description: "Advanced API documentation for Pizza Kings Restaurant Management System",
      contact: {
        name: "API Support",
        email: "support@restaurant.com",
      },
    },
    servers: [
      {
        url: `http://localhost:${port}/api/v1`,
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", default: false },
            message: { type: "string" },
            code: { type: "integer" },
            errors: { type: "array", items: { type: "object" } },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", default: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
  },
  apis: ["./src/docs/swagger/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
