// routes/user.js
const express = require("express");
const User = require("../models/User");
const asyncHandler = require("../middleware/asyncHandler");
const router = express.Router();

// @route   GET /api/users/profile
// @desc    Get current user profile
// @access  Private
router.get(
  "/profile",
  asyncHandler(async (req, res) => {
    try {
      const userProfile = req.user.getPublicProfile
        ? req.user.getPublicProfile()
        : {
            _id: req.user._id,
            fullname: req.user.fullname,
            email: req.user.email,
            walletAddress: req.user.walletAddress,
            totalPurchaseAmount: req.user.totalPurchaseAmount || 0,
            totalReferralCommissions: req.user.totalReferralCommissions || 0,
            membershipTier: req.user.membershipTier || "Bronze",
            createdAt: req.user.createdAt,
            updatedAt: req.user.updatedAt,
          };

      res.json({
        success: true,
        data: userProfile,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching user profile",
        error: error.message,
      });
    }
  })
);

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  asyncHandler(async (req, res) => {
    const { username } = req.body;

    // Check if username is already taken by another user
    if (username && username !== req.user.username) {
      const existingUser = await User.findOne({
        username,
        _id: { $ne: req.user._id },
      });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Username already taken",
        });
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        username: username || req.user.username,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json({
      success: true,
      message: "Profile updated successfully",
      data: {
        user: updatedUser.getPublicProfile(),
      },
    });
  })
);



module.exports = router;
