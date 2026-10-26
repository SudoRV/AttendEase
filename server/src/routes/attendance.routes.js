const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendance.controller");

router.put("/portal/credentials", attendanceController.saveCredentials);

router.get("/", attendanceController.attendance);

module.exports = router;