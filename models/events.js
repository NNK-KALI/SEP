const mongoose = require("mongoose");
const Joi = require("joi");
const joiObjectid = require("joi-objectid");

const eventSchemaMongoose = new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    required: true
  },
  description: {
    type: String,
  },
  teamSize: {
    type: Number,
    required: true,
  },
  regStartDate: {
    type: Date,
    required: true,
  },
  regEndDate: {
    type: Date,
    required: true,
  },
  eventDate: {
    type: Date,
    required: true,
  },
  venue: {
    type: String,
    minlength: 1,
    required: true
  },
  imageUri: {
    type: String,
    minlength: 1,
    required: true
  },
  participantDocId: {
    type: mongoose.Types.ObjectId,
  }
});

const Event =  mongoose.model( "event", eventSchemaMongoose);

const eventSchemaJoi = Joi.object({
  title: Joi.string().min(1).required(),
  description: Joi.string(),
  teamSize: Joi.number().positive().required(),
  regStartDate: Joi.date().greater('now').timestamp().required(),
  regEndDate: Joi.date().greater(Joi.ref('regStartDate')).timestamp().required(),
  eventDate: Joi.date().greater(Joi.ref('regEndDate')).timestamp().required(),
  venue: Joi.string().min(1).required(),
  imageUri: Joi.string().uri({allowRelative: true}).required()
});

const patchEventSchemaJoi = Joi.object({
  title: Joi.string().min(1),
  description: Joi.string(),
  teamSize: Joi.number().positive(),
  regStartDate: Joi.date().greater('now').timestamp(),
  regEndDate: Joi.date().greater(Joi.ref('regStartDate')).timestamp(),
  eventDate: Joi.date().greater(Joi.ref('regEndDate')).timestamp(),
  venue: Joi.string().min(1),
  imageUri: Joi.string().uri({allowRelative: true})
});

function validateEvent(event) {
  return eventSchemaJoi.validate(event);
}

function validatePatchEvent(event) {
  return patchEventSchemaJoi.validate(event);
}

module.exports.Event = Event;
module.exports.validateEvent = validateEvent;
module.exports.validatePatchEvent = validatePatchEvent;
module.exports.eventSchemaMongoose = eventSchemaMongoose;


