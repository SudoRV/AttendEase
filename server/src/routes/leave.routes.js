const express = require("express");
const router = express.Router();

const leaveController = require("../controllers/leave.controller");

// submit leave
router.put("/students", leaveController.submitStudentLeave);

// verify student leave
router.post("/students/verify", leaveController.verifyStudentLeave);

// fetch students leaves
router.get("/students", leaveController.studentsLeaves);

// submit teacher leaves
router.put("/teachers", leaveController.submitTeacherLeaves);

// fetch teachers leaves
router.get("/teachers", leaveController.teachersLeaves);

module.exports = router;