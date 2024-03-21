const mongoose = require("mongoose");
const Joi = require("joi");

const eventSchemaMongoose = new mongoose.Schema({
  title: {
    type: String,
    minlength: 1,
    required: true
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
  }
});

const Event =  mongoose.model( "event", eventSchemaMongoose);

const eventSchemaJoi = Joi.object({
  title: Joi.string().min(1).required(),
  teamSize: Joi.number().positive().required(),
  regStartDate: Joi.date().greater('now').iso().required() ,
  regEndDate: Joi.date().greater(Joi.ref('regStartDate')).iso().required(),
  eventDate: Joi.date().greater(Joi.ref('regEndDate')).iso().required(),
  venue: Joi.string().min(1).required(),
  imageUri: Joi.string().uri({allowRelative: true}).required()
});


function validateEvent(event) {
  return eventSchemaJoi.validate(event);
}


module.exports.Event = Event;
module.exports.validateEvent = validateEvent;
module.exports.eventSchemaMongoose = eventSchemaMongoose;


