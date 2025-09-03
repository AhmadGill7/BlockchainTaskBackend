// routes/auth.js
const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const { validateSignup, validateLogin } = require("../middleware/validation");
const web3Helper = require("../utils/web3Helper");

const router = express.Router();

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "your-secret-key", {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post(
  "/signup",
  validateSignup,
  asyncHandler(async (req, res) => {
    const { email, fullname, password, walletAddress, referralCode } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Validate wallet address if provided
    if (walletAddress && !web3Helper.isValidAddress(walletAddress)) {
      return res.status(400).json({
        success: false,
        message: "Invalid wallet address",
      });
    }

    // Check for referral
    let referredBy = null;
    if (referralCode) {
      const referrer = await User.findOne({
        $or: [
          { referralCode },
          { walletAddress: referralCode.toLowerCase() },
        ],
      });

      if (referrer) {
        referredBy = referrer._id;
      }
    }
    // Create new user
    const user = new User({
      fullname,
      email,
      password,
      walletAddress: walletAddress?.toLowerCase(),
      referredBy,
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        token,
        user: user.getPublicProfile(),
      },
    });
  })
);

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post(
  "/login",
  validateLogin,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: "Account is deactivated",
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      data: {
        token,
        user: user.getPublicProfile(),
      },
    });
  })
);

// @route   POST /api/auth/verify-token
// @desc    Verify JWT token
// @access  Private
router.post(
  "/verify-token",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key"
      );
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "Invalid token or user not found",
        });
      }

      res.json({
        success: true,
        message: "Token is valid",
        data: {
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  })
);

// @route   POST /api/auth/refresh-token
// @desc    Refresh JWT token
// @access  Private
router.post(
  "/refresh-token",
  asyncHandler(async (req, res) => {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || "your-secret-key",
        { ignoreExpiration: true }
      );
      const user = await User.findById(decoded.id);

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: "User not found or inactive",
        });
      }

      // Generate new token
      const newToken = generateToken(user._id);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
          user: user.getPublicProfile(),
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }
  })
);



module.exports = router;
