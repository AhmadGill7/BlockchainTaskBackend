const { body, param, query, validationResult } = require("express-validator");

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log("errors", errors.array());
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg || "Validation failed",
      errors: errors.array(),
    });
  }
  next();
};

// Auth validations
const validateSignup = [
  body("fullname")
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage("fullname must be between 3 and 30 characters"),

  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),

  body("walletAddress")
    .optional()
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage("Invalid wallet address format"),

  handleValidationErrors,
];

const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),

  body("password").notEmpty().withMessage("Password is required"),

  handleValidationErrors,
];

// Wallet validations
const validateWalletConnect = [
  body("walletAddress")
    .matches(/^0x[a-fA-F0-9]{40}$/)
    .withMessage("Invalid wallet address format"),

  handleValidationErrors,
];

// Order validations
const validateCreateOrder = [
  body("transactionHash")
    .matches(/^0x[a-fA-F0-9]{64}$/)
    .withMessage("Invalid transaction hash format"),

  body("priceETH")
    .isFloat({ min: 0 })
    .withMessage("Price in ETH must be a positive number"),

  handleValidationErrors,
];

// Admin validations
const validateLuckyDraw = [
  body("participants")
    .optional()
    .isArray({ min: 3 })
    .withMessage("Lucky draw requires at least 3 participants"),

  handleValidationErrors,
];

// MongoDB ObjectId validation
const validateObjectId = [
  param("_id").isMongoId().withMessage("Invalid ID formatssss"),

  handleValidationErrors,
];

// Pagination validation
const validatePagination = [
  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateSignup,
  validateLogin,
  validateWalletConnect,
  validateCreateOrder,
  validateLuckyDraw,
  validateObjectId,
  validatePagination,
};
