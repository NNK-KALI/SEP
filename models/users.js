const mongoose = require("mongoose");
const Joi = require("joi");


const userSchemaMongoose = new mongoose.Schema({
  firstname: {
    type: String,
    minlength: 1,
    required: true,
  },
  middlename: {
    type: String,
  },
  lastname: {
    type: String,
    minlength: 1,
    required: true,
  },
  rollno: {
    type: String,
    minlength:1,
    required: true,
  },
  department: {
    type: String,
    minlength: 1,
    required: true,
  },
  branch: {
    type: String,
    minlength: 1,
    required: true,
  },
  batch: {
    type: Number,
    required: true,
  },
  currentSem: {
    type: Number,
    default: 1
  },
  address: {
    type: String,
    minlength: 1
  },
  hostel: {
    type: String,
  },
  roomno: {
    type: String,
  },
  phoneno: {
    type: String,
    required: true
  },
  degreeLevel: {
    // UG or PG
    type: String,
    minlength: 1,
    required: true,
  },
  personalEmail: {
    type: String,
    minlength: 3,
    required: true,
  },
  universityEmail: {
    type: String,
    minlength: 3
  }
});


const User = mongoose.model("user", userSchemaMongoose);

const userSchemaJoi = Joi.object({
  firstname: Joi.string().min(1).required(),
  middlename: Joi.string().min(1),
  lastname: Joi.string().min(1).required(),
  rollno: Joi.string().min(1).required(),
  department: Joi.string().min(1).required(),
  branch: Joi.string().min(1).required(),
  batch: Joi.number().positive().min(1000).required(),
  currentSem: Joi.number().positive().min(1).default(1),
  address: Joi.string().min(1),
  hostel: Joi.string().min(1),
  roomno: Joi.string().min(1),
  phoneno: Joi.string().min(1).required(),
  degreeLevel: Joi.string().min(1).required(),
  personalEmail: Joi.string().min(3).email().required(),
  universityEmail: Joi.string().min(3).email()
})
