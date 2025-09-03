const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    walletAddress: {
      type: String,
      sparse: true,
      unique: true,
      lowercase: true,
    },

    totalReferralCommissions: {
      type: Number,
      default: 0,
    },
    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    referralCode: {
      type: String,
      unique: true,
    },
    luckyDrawWinnings: [
      {
        drawId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "LuckyDraw",
        },
        prize: Number,
        position: Number,
        wonAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Generate referral code before saving
userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = this.walletAddress.toString();
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Get public profile
userSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    fullname: this.fullname,
    email: this.email,
    walletAddress: this.walletAddress,
    totalReferralCommissions: this.totalReferralCommissions,
    luckyDrawWinnings: this.luckyDrawWinnings,
    referralCode: this.referralCode,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model("User", userSchema);
