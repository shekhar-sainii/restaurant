const config = require("./env.config");

const socketConfig = {
  cors: {
    origin: (origin, callback) => {
      // Allow all origins in development, restrict in production
      if (config.env === 'production') {
        const allowed = [config.clientUrl];
        if (!origin || allowed.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(null, true); // Allow all in dev
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  },
};

module.exports = socketConfig;
