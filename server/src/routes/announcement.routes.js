const express = require("express");
const router = express.Router();

const announcementController = require("../controllers/announcement.controller");

// create announcements
router.post("/", announcementController.postAnnouncement);

// fetch announcements
router.get("/", announcementController.announcements);

module.exports = router;