const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");

const adminSchemaMongoose = new mongoose.Schema({
  firstname: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true,
  },
  middlename: {
    type: String,
    maxlength: 255,
    required: false,
  },
  lastname: {
    type: String,
    maxlength: 255,
    required: false,
  },
  email: {
    type: String,
    minlength: 2,
    maxlength: 255,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    minlength: 1,
    maxlength: 1024,
    required: true
  },
  isAdmin: {
    type: Boolean,
    default:  false
  }
});

adminSchemaMongoose.methods.generateAdminAuthToken = function() {
  const token = jwt.sign({
    _id: this._id, 
    name: `${this.firstname} ${this.middlename} ${this.lastname}`, 
    email: this.email,
    isAdmin: this.isAdmin
  }, config.get("jwtPrivateKey"));
  return token;
};

const Admin = mongoose.model("Admin", adminSchemaMongoose);

const adminSchemaJoi = Joi.object({
  firstname: Joi.string().min(1).max(255).alphanum().required(),
  middlename: Joi.string().min(1).max(255).alphanum().allow(""),
  lastname: Joi.string().min(1).max(255).alphanum().allow(""),
  email: Joi.string().min(1).max(255).email().required(),
  password: Joi.string().min(1).max(255).required(),
  isAdmin: Joi.boolean().default(false)
});

function validateAdmin(admin) {
  return adminSchemaJoi.validate(admin);
}

module.exports.Admin = Admin;
module.exports.validateAdmin = validateAdmin;
