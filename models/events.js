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
  }
});

const Event =  mongoose.model( "event", eventSchemaMongoose);

const eventSchemaJoi = Joi.object({
  title: Joi.string().min(1).required(),
  teamSize: Joi.number().positive().required(),
  regStartDate: Joi.date().greater('now').iso().required() ,
  regEndDate: Joi.date().greater(Joi.ref('regStartDate')).iso().required()
});


function validateEvent(event) {
  return eventSchemaJoi.validate(event);
}


module.exports.Event = Event;
module.exports.validateEvent = validateEvent;
module.exports.eventSchemaMongoose = eventSchemaMongoose;


