const express = require("express");
const _ = require("lodash");
const Joi = require("joi");

const router = express.Router(); 

const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/admin.js");

const { Event } = require("../models/events.js"); 
const { Participant } = require("../models/participant.js");
const { User } = require("../models/users.js");
const { validateId } = require("../models/validate-utils.js");
const sendEmail = require("../helper/mailer.js");

// Get participants 
router.get("/", async (req, res) => {
  const participantsColl = await Participant.find();
  res.json(participantsColl);
});


router.get("/:participantDocId", async (req, res) => {
  const {error} = validateId(req.params.participantDocId);
  if (error) return res.status(400).send("Invalid Id");

  const participantDoc = await Participant.findById(req.params.participantDocId);
  const regUsersDocId = participantDoc.userIds;

  const regUsers = [];
  for (let userDocId of regUsersDocId) {
    const user = await User.findById(userDocId);
    regUsers.push({
      id: user._id,
      rollno: user.rollno,
      firstname: user.firstname,
      middlename: user.middlename,
      lastname: user.lastname,
      branch: user.branch,
      hostel: user.hostel
    });
  }

  res.json(regUsers);

});

// create a new participant document
// Depreacted.
router.post("/", auth, adminAuth, async (req, res) => {
  const {error} = Joi.object({ eventId: Joi.objectId() }).validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const event = await Event.findById(req.body.eventId);
  if (!event) return res.status(404).send("No event found with that ID.");
  
  let participantDoc = await Participant.findOne({eventId: req.body.eventId});
  if (participantDoc) return res.status(400).send("participant document alredy exists with the same event.");

  participantDoc = null;
  participantDoc = new Participant();
  participantDoc.eventId = req.body.eventId;
  participantDoc.eventTitle = event.title;
  participantDoc = await participantDoc.save()
  res.json(participantDoc);
});


// add a new participant 
router.patch("/adduser", auth, async (req, res) => {
  // check if the document id is in mongodb id format or not
  const validatedDocId = Joi.object({ participantDocId: Joi.objectId() }).validate(_.pick(req.body, "participantDocId"));
  if (validatedDocId.error) return res.status(400).send(validatedDocId.error.details[0].message);

  // ceheck if the document is present in the collection or not.
  let participantDoc = await Participant.findById(req.body.participantDocId);
  if (!participantDoc) return res.status(404).send("No participant document found with that ID."); 

  const event = await Event.findOne({participantDocId: req.body.participantDocId});
  if (!event) return res.status(404).send("Event not found");

  const currentDate  = new Date().toISOString();
  console.log(`curent date: ${currentDate}; event reg date: ${new Date(event.regStartDate).toISOString()}`);

  if (currentDate < new Date(event.regStartDate).toISOString()) return res.status(400).send("Registrations didn't start yet.");
  if (currentDate > new Date(event.regEndDate).toISOString()) return res.status(400).send("registrations closed.");

  // Fetch the user id from the rollno
  const user = await User.findOne({rollno: req.body.rollno});
  if (!user) return res.status(400).send("User not found.");
  const userDocId = user._id;

  // check if user is alredy registered for the event
  const isUserRegistered = participantDoc.userIds.includes(userDocId);
  if (isUserRegistered) return res.status(400).send("user alredy registered for the event.")
  
  // Append userDocId to the userIds array (add an user to an event)
  participantDoc.userIds.push(userDocId);
  participantDoc = await participantDoc.save();

  // send email 
  try {
    const toEmail = user.universityEmail;
    const subject = "Acknowledgment for Athletic event Registration";
    // const message = `Hello, ${user.firstname} ${user.middlename} ${user.lastname}\n\n\nThank you for participating in ${event.title} on ${event.eventDate}.\n\n\n\nBest wishes,\nAthletic Meet Team`;
    const html = `<p>Hello, <span id="firstname">${user.firstname}</span> <span id="middlename">${user.middlename}</span> <span id="lastname">${user.lastname}</span></p>
    <p>Thank you for participating in <span id="eventTitle">${event.title}</span> on <span id="eventDate">${event.eventDate}</span>.</p>
    <p>Best wishes,<br>Athletic Meet Team</p>`
      
    sendEmail(toEmail, subject, html);
  } catch (error) {
    console.error(error);
  }
  res.json(participantDoc);
});


// remove a participant from an participant document
router.delete("/removeuser", async (req, res) => {
  const validatedDocId = Joi.object({ participantDocId: Joi.objectId() }).validate(_.pick(req.body, "participantDocId"));
  if (validatedDocId.error) return res.status(400).send(validatedDocId.error.details[0].message);

  let participantDoc = await Participant.findById(req.body.participantDocId);
  if (!participantDoc) return res.status(404).send("No participant document found with that ID."); 

  const validatedUserDocId = Joi.object({ userDocId: Joi.objectId() }).validate(_.pick(req.body, "userDocId"));
  if (validatedUserDocId.error) return res.status(400).send(validatedUserDocId.error.details[0].message);
  
  // implement user id verification from User collection

  // check if user is alredy registered for the event
  const isUserRegistered = participantDoc.userIds.includes(req.body.userDocId);
  if (!isUserRegistered) return res.status(404).send("user not registered for the event.");
  
  participantDoc.userIds.pull(req.body.userDocId);
  participantDoc = await participantDoc.save();

  try {
    const user = await User.findById(req.body.userDocId);
    const event = await Event.findById(participantDoc.eventId);
    if (user) {
      const toEmail = user.universityEmail;
      const subject = "Removed from Athletic event";
      const html = `<p>Hello, <span id="firstname">${user.firstname}</span> <span id="middlename">${user.middlename}</span> <span id="lastname">${user.lastname}</span></p>
      <p>You are removed from the event <span id="eventTitle">${event.title}</span> on <span id="eventDate">${event.eventDate}</span>.</p>
      <p>From, Athletic Meet Team</p>`
        
      sendEmail(toEmail, subject, html);
    }
  } catch (error) {
    console.error(error);
  }
  res.json(participantDoc);

});

// remove all the participants from the event
router.delete("/removeAllUsers", async (req, res) => {
  const validatedDocId = Joi.object({ participantDocId: Joi.objectId() }).validate(_.pick(req.body, "participantDocId"));
  if (validatedDocId.error) return res.status(400).send(validatedDocId.error.details[0].message);

  let participantDoc = await Participant.findById(req.body.participantDocId);
  if (!participantDoc) return res.status(404).send("No participant document found with that ID.");

  participantDoc.userIds = [];
  participantDoc = await participantDoc.save();
  res.json(participantDoc);
});

// Delete a participant Document
router.delete("/", async (req, res) => {
  const validatedDocId = Joi.object({ participantDocId: Joi.objectId() }).validate(_.pick(req.body, "participantDocId"));
  if (validatedDocId.error) return res.status(400).send(validatedDocId.error.details[0].message);

  let participantDoc = await Participant.findByIdAndDelete(req.body.participantDocId);
  if (!participantDoc) return res.status(404).send("No participant document found with that ID."); 

  res.json({ success: true });

});


module.exports = router;
