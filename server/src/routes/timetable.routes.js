const express = require("express");
const router = express.Router();

const timetableController = require("../controllers/timetable.controller");

// student timetable 
router.get("/student", timetableController.studentTimetable);

// teacher timetable 
router.get("/teacher", timetableController.teacherTimetable);

// set substitution teacher 
router.put("/class/substitution", timetableController.setSubstitution)

// add class to timetable
router.put("/class", timetableController.addClass);

// update class
router.patch("/class", timetableController.updateClass);

// delete class
router.delete("/class", timetableController.deleteClass);

module.exports = router;