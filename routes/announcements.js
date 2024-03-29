const express = require("express");
const _ = require("lodash");

const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/admin.js");

const {Announcement, validateAnnouncement} = require("../models/announcements.js");
const { validateId } = require("../models/validate-utils.js");

const router = express.Router();

// Get all announcements
router.get("/", async (req, res) => {
  const announcements = await Announcement.find();
  res.json(announcements);
});

// Get a single announcement
router.get("/:id", async (req, res) => {
  const {error} = validateId(req.params.id);
  if (error) return res.status(400).send("Invalid Id");

  const announcement = await Announcement.findById(req.params.id);
  if (!announcement) return res.status(404).send("announcement not found");

  return res.send(announcement);
})

// Create a new announcement
router.post("/", auth, adminAuth, async (req, res) => {
  const validatedAnnouncement = validateAnnouncement(req.body);
  if (validateAnnouncement.error) return res.status(400).send(validatedAnnouncement.error.details[0].message);

  let announcement = new Announcement({
    title: validatedAnnouncement.value.title,
    content: validatedAnnouncement.value.content
  });

  announcement = await announcement.save();
  return res.json(announcement);
});

// Edit an announcement
router.put("/", auth, adminAuth, async (req, res) => {
  const {error} = validateId(_.pick(req.body, ["id"]));
  if (error) return res.status(400).send(error.details[0].message);

  const validatedAnnouncement = validateAnnouncement(_.pick(req.body, ["title", "content"]));
  if (validateAnnouncement.error) return res.status(400).send(validatedAnnouncement.error.details[0].message);

  let announcement = await Announcement.findById(req.body.id);
  if (!announcement) return res.status(404).send("Announcement not found");

  announcement.title = req.body.title;
  announcement.content = req.body.content;
  
  await announcement.save();
  return res.json(announcement);
});


// Delete an announcement
router.delete("/", auth, adminAuth, async (req, res) => {
  const {error} = validateId(req.body.id);
  if (error) return res.status(400).send("Invalid Id");

  const announcement = await Announcement.findByIdAndDelete(req.body.id);
  if (!announcement) return res.status(404).send("announcement not found");

  return res.send({ "success": true });
});

module.exports = router;
