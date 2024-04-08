const express = require("express");
const _ = require("lodash");
const Joi = require("joi");

const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/admin.js");
const { validateId } = require("../models/validate-utils.js");

const {
  Event,
  validateEvent,
  validatePatchEvent,
} = require("../models/events.js");
const { Participant } = require("../models/participant.js");

const router = express.Router();

// Get all the events list
router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Get an event
router.get("/:id", async (req, res) => {
  const { error } = validateId(req.params.id);
  if (error) return res.status(400).send("Invalid Id");

  const event = await Event.findById(req.params.id);
  return res.json(event);
});

// Create a new event
router.post("/", auth, adminAuth, async (req, res) => {
  const eventData = {
    title: req.body.title,
    description: req.body.description,
    teamSize: req.body.teamSize,
    regStartDate: new Date(req.body.regStartDate).getTime(),
    regEndDate: new Date(req.body.regEndDate).getTime(),
    eventDate: new Date(req.body.eventDate).getTime(),
    venue: req.body.venue,
    imageUri: req.body.imageUri,
  };

  const validatedEvent = validateEvent(eventData);
  if (validatedEvent.error)
    return res.status(400).send(validatedEvent.error.details[0].message);

  let event = new Event(eventData);

  let participantDoc = undefined;
  let participantDocId = undefined;

  try {
    participantDoc = new Participant();
    participantDoc.eventId = event._id;
    participantDoc.eventTitle = event.title;
    participantDoc = await participantDoc.save();
    participantDocId = participantDoc._id;
  } catch (error) {
    console.error(error);
    return res.status(500).send("Internal Server Error.");
  }

  if (!participantDocId) return res.status(500).send("Internal Server Error.");
  event.participantDocId = participantDocId;

  event = await event.save();

  res.json(event);
});

// Edit an Event
router.patch("/", auth, adminAuth, async (req, res) => {
  const data = _.pick(req.body, [
    "title",
    "description",
    "teamSize",
    "regEndDate",
    "regStartDate",
    "eventDate",
    "venue",
    "imageUri",
  ]);
  if (data.regStartDate) data.regStartDate = new Date(data.regStartDate).getTime();
  if (data.regEndDate) data.regEndDate = new Date(data.regEndDate).getTime();
  if (data.eventDate) data.eventDate = new Date(data.eventDate).getTime();

  console.log(data)

  const { error } = validatePatchEvent(data);
  if (error) return res.status(400).send(error.details[0].message);

  let event = await Event.findById(req.body._id);
  if (!event) return res.status(400).send("Event not found.");

  for (let item in data) {
    event[item] = data[item];
  }

  if (data.title) {
    try {
      const response = await Participant.findOneAndUpdate(
        { eventId: req.body._id },
        { eventTitle: data.title },
      );
      if (!response)
        throw new Error("couldn't update the title in the participants doc Id");
    } catch (error) {
      console.log(error);
    }
  }

  event = await event.save();
  res.json(event);
});

// Delete an event
router.delete("/", auth, adminAuth, async (req, res) => {
  const { error } = Joi.object({ _id: Joi.objectId() }).validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const event = await Event.findByIdAndDelete(req.body._id);
  if (!event) return res.status(404).send("Event not found.");

  try {
    const response = await Participant.findOneAndDelete({
      eventId: req.body._id,
    });
    if (!response) throw new Error("participant doc not found for the event.");
  } catch (error) {
    console.error(
      "Failed to delete participant doc id for the corresponding event.",
    );
    console.log(error);
  }
  res.json({ success: true });
});

module.exports = router;
