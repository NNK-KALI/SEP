const mongoose = require("mongoose");
const Joi = require("joi");

const participantSchemaMongoose = new mongoose.Schema({
  userIds: {
    type: [mongoose.ObjectId] 
  },
  eventId: {
    type: mongoose.SchemaTypes.ObjectId,
    required: true,
  },
  eventTitle: {
    type: String
  }
});

const Participant =  mongoose.model( "participant", participantSchemaMongoose);

module.exports.Participant = Participant;

