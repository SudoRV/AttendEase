const express = require("express");
const router = express.Router();
const verifySessionToken = require("../middlewares/auth.middleware");

const authController = require("../controllers/auth.controller");

// register
router.post("/register", authController.register);

// verify credentials
router.post("/verify", authController.validateCreds);

// login
router.post("/login", authController.login);

// change password
router.patch("/password", verifySessionToken, authController.changePassword);

// ask otp to reset password
router.post("/password/reset/request-otp", verifySessionToken, authController.requestOtp);

// verify otp and reset password
router.post("/password/reset/otp-verification", verifySessionToken, authController.resetPassword);

module.exports = router;