const config = require("./env.config");

const allowedOrigins = [
  config.clientUrl,
  "http://localhost:3000",
  "https://localhost:3000",
  "http://127.0.0.1:3000",
  "http://192.168.18.191:3000",
  "http://january-unredeeming-margarete.ngrok-free.dev",
  "https://january-unredeeming-margarete.ngrok-free.dev"
];

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.indexOf(origin) !== -1 || 
      allowedOrigins.includes("*") ||
      origin.endsWith(".vercel.app") ||
      origin.endsWith(".onrender.com")
    ) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
};

module.exports = corsOptions;
