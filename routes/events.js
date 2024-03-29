const express = require("express");
const _ = require("lodash");
const Joi = require("joi");

const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/admin.js");

const { Event, validateEvent } = require("../models/events.js");
const { Participant } = require("../models/participant.js");


const router = express.Router();

// Get all the events list
router.get("/", async (req, res) => {
  const events = await Event.find();
  res.json(events);
});

// Create a new event
router.post("/", auth, adminAuth, async (req, res) => {
  const validatedEvent = validateEvent(req.body);
  if (validatedEvent.error) return res.status(400).send(validatedEvent.error.details[0].message);

  let event = new Event({
    title: validatedEvent.value.title,
    teamSize: validatedEvent.value.teamSize,
    regStartDate: validatedEvent.value.regStartDate,
    regEndDate:  validatedEvent.value.regEndDate,
    eventDate: validatedEvent.value.eventDate,
    venue: validatedEvent.value.venue,
    imageUri: validatedEvent.value.imageUri
  });

    
  let participantDoc = undefined;
  let participantDocId = undefined; 
  
  try {
    participantDoc = new Participant();
    participantDoc.eventId = event._id;
    participantDoc.eventTitle = event.title;
    participantDoc = await participantDoc.save();
    participantDocId = participantDoc._id;
  } catch(error) {
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
  const {error} = validateEvent(_.pick(req.body, ["title", "teamSize", "regEndDate", "regStartDate"]));
  if (error) return res.status(400).send(error.details[0].message);
  
  let event = await Event.findById(req.body._id);
  if (!event) return res.status(400).send("Event not found.");

  event.title = req.body.title;
  event.teamSize = req.body.teamSize;
  event.regStartDate = req.body.regStartDate;
  event.regEndDate = req.body.regEndDate;

  // [implementation] Also change the title of the participants document.
  
  event = await event.save();
  res.json(event);
});

// Delete an event
router.delete("/", auth, adminAuth, async (req, res) => {
  const {error} = Joi.object({ _id: Joi.objectId() }).validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  const event = await Event.findByIdAndDelete(req.body._id);
  if(!event) return res.status(404).send("Event not found.");

  // [implementation] Also delete participantDoc for this event.

  res.json({"success": true});
});

module.exports = router;
