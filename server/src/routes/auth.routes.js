const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller");

// register
router.post("/register", authController.register);

// verify credentials
router.post("/verify", authController.validateCreds);

// login
router.post("/login", authController.login);

// change password
router.patch("/password", authController.changePassword);

// ask otp to reset password
router.post("/password/reset/request-otp", authController.requestOtp);

// verify otp and reset password
router.post("/password/reset/otp-verification", authController.resetPassword);

module.exports = router;