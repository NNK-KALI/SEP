const mongoose = require("mongoose");
const Joi = require("joi");
const config = require("config");
const jwt = require("jsonwebtoken");

const adminSchemaMongoose = new mongoose.Schema({
  name: {
    type: String,
    minlength: 1,
    maxlength: 255,
    required: true,
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
    default: true
  }
});

adminSchemaMongoose.methods.generateAdminAuthToken = function() {
  const token = jwt.sign({
    _id: this._id, 
    name: this.name, 
    email: this.email,
    isAdmin: this.isAdmin
  }, config.get("jwtPrivateKey"));
  return token;
};

const Admin = mongoose.model("Admin", adminSchemaMongoose);

const adminSchemaJoi = Joi.object({
  name: Joi.string().min(1).max(255).alphanum().required(),
  email: Joi.string().min(1).max(255).email().required(),
  password: Joi.string().min(1).max(255).required()
});

function validateAdmin(admin) {
  return adminSchemaJoi.validate(admin);
}

module.exports.Admin = Admin;
module.exports.validateAdmin = validateAdmin;
