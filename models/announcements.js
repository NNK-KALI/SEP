const mongoose = require("mongoose");
const Joi = require("joi");


// add last edited on varaible
const announcementSchemaMongoose =  new mongoose.Schema({
  title:  {
    type: String,
    minlength: 1,
    required: true
  },
  publishedAt: { 
    type: Date,
    default: Date.now   
  },
  content: {
    type: String,
  }
});

const Announcement =  mongoose.model("Announcement", announcementSchemaMongoose);

const announcementSchemaJoi = Joi.object({
  title: Joi.string().min(1).required(),
  content: Joi.string()
});

function validateAnnouncement(announcement) {
  return announcementSchemaJoi.validate(announcement);
}

module.exports.Announcement = Announcement;
module.exports.validateAnnouncement = validateAnnouncement;
