const express = require("express");
const _ = require("lodash");
const Joi = require("joi");

const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/admin.js");

const { Event, validateEvent, validatePatchEvent } = require("../models/events.js");
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
    description: validatedEvent.value.description,
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
  const data =  _.pick(req.body, ["title", "description", "teamSize", "regEndDate", "regStartDate", "eventDate", "venue", "imageUri"]);
  const {error} = validatePatchEvent(data);
  if (error) return res.status(400).send(error.details[0].message);
  
  let event = await Event.findById(req.body._id);
  if (!event) return res.status(400).send("Event not found.");

  for (let item in data) {
    event[item] = data[item];
  }

  if (data.title) {
    try {
      await Participant.findOneAndUpdate({ eventId: req.body._id }, {eventTitle: data.title});
    } catch (error) {
      console.log("couldn't update the title in the participants doc Id");
      console.log(error);
    }
  }
  
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
  //

  res.json({"success": true});
});

module.exports = router;
