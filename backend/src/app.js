const express = require("express");
const path = require("path");
const helmet = require("helmet");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { corsOptions } = require("./config");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger.config");
const { requestLogger, sanitize, requestId, notFound, errorHandler } = require("./middlewares");
const routes = require("./routes");

const app = express();

// Set security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Enable CORS
app.use(cors(corsOptions));

// Assign Request ID
app.use(requestId);

// Request Logging
app.use(requestLogger);

// Parse JSON request body
app.use(express.json());

// Parse URL encoded request body
app.use(express.urlencoded({ extended: true }));

// Cookie Parser
app.use(cookieParser());

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Swagger API Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Sanitize request data
app.use(...sanitize);

// API Routes
app.use("/api", routes);

// 404 handler
app.use(notFound);

// Global Error Handler
app.use(errorHandler);

module.exports = app;
