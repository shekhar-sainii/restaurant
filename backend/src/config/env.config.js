const Joi = require("joi");
const dotenv = require("dotenv");

dotenv.config();

const envVarsSchema = Joi.object()
  .keys({
    NODE_ENV: Joi.string()
      .valid("development", "production", "test")
      .default("development"),
    PORT: Joi.number().default(5000),
    MONGO_URI: Joi.string().required().description("MongoDB connection URI"),
    JWT_ACCESS_SECRET: Joi.string().required().description("JWT access secret"),
    JWT_REFRESH_SECRET: Joi.string()
      .required()
      .description("JWT refresh secret"),
    JWT_ACCESS_EXPIRES: Joi.string().default("1h"),
    JWT_REFRESH_EXPIRES: Joi.string().default("7d"),
    RAZORPAY_KEY_ID: Joi.string().allow("").description("Razorpay Key ID"),
    RAZORPAY_KEY_SECRET: Joi.string().allow("").description("Razorpay Key Secret"),
    CLOUDINARY_CLOUD_NAME: Joi.string().allow("").description("Cloudinary Cloud Name"),
    CLOUDINARY_API_KEY: Joi.string().allow("").description("Cloudinary API Key"),
    CLOUDINARY_API_SECRET: Joi.string().allow("").description("Cloudinary API Secret"),
    CLIENT_URL: Joi.string().default("http://localhost:3000"),
    GOOGLE_CLIENT_ID: Joi.string().allow("").description("Google OAuth Client ID"),
    MAIL_HOST: Joi.string().default("smtp.gmail.com"),
    MAIL_PORT: Joi.number().default(587),
    MAIL_SECURE: Joi.boolean().default(false),
    MAIL_USER: Joi.string().allow("").description("SMTP email user"),
    MAIL_PASS: Joi.string().allow("").description("SMTP email password"),
    MAIL_FROM_NAME: Joi.string().default("DineSync"),
    MAIL_FROM_ADDRESS: Joi.string().allow("").description("From email address"),
    UPI_ID_PRIMARY: Joi.string().default("shivanshsaini733@oksbi"),
    UPI_ID_SECONDARY: Joi.string().default("9520640928@okbizaxis"),
    UPI_MERCHANT_NAME: Joi.string().default("DineSync"),
  })
  .unknown();

const { value: envVars, error } = envVarsSchema
  .prefs({ errors: { label: "key" } })
  .validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

module.exports = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongoose: {
    url: envVars.MONGO_URI,
    options: {},
  },
  jwt: {
    accessSecret: envVars.JWT_ACCESS_SECRET,
    refreshSecret: envVars.JWT_REFRESH_SECRET,
    accessExpiration: envVars.JWT_ACCESS_EXPIRES,
    refreshExpiration: envVars.JWT_REFRESH_EXPIRES,
  },
  razorpay: {
    keyId: envVars.RAZORPAY_KEY_ID,
    keySecret: envVars.RAZORPAY_KEY_SECRET,
  },
  cloudinary: {
    cloudName: envVars.CLOUDINARY_CLOUD_NAME,
    apiKey: envVars.CLOUDINARY_API_KEY,
    apiSecret: envVars.CLOUDINARY_API_SECRET,
  },
  clientUrl: envVars.CLIENT_URL,
  googleClientId: envVars.GOOGLE_CLIENT_ID,
  mail: {
    host: envVars.MAIL_HOST,
    port: envVars.MAIL_PORT,
    secure: envVars.MAIL_SECURE,
    user: envVars.MAIL_USER,
    pass: envVars.MAIL_PASS,
    fromName: envVars.MAIL_FROM_NAME,
    fromAddress: envVars.MAIL_FROM_ADDRESS || envVars.MAIL_USER,
  },
  upi: {
    primaryId: envVars.UPI_ID_PRIMARY,
    secondaryId: envVars.UPI_ID_SECONDARY,
    merchantName: envVars.UPI_MERCHANT_NAME,
  },
};
