const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const ROLES = require("../common/constants/roles.constant");

const addressSchema = new mongoose.Schema({
  label: String,
  line1: String,
  city: String,
  pincode: String,
  lat: Number,
  lng: Number,
});

const userSchema = new mongoose.Schema(
  {
    tenantId: {
      type: String,
      default: null, // null for SUPER_ADMIN, set for all tenant users
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
    },
    mobile: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    password: {
      type: String,
      select: false,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.USER,
    },
    addresses: [addressSchema],
    refreshToken: {
      type: String,
      select: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    image: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);
