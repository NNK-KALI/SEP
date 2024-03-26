const express = require('express');
const _ = require("lodash");
const bcrypt = require("bcrypt");
const Joi = require("joi");


const router = express.Router();

const {Admin, validateAdmin} = require("../models/admin.js");
const auth = require("../middleware/auth.js");
const adminAuth = require("../middleware/admin.js");

// get details of admin
router.get("/me", auth, adminAuth, async (req, res) => {
  const admin = await Admin.findById(req.user._id).select({ password: 0 });
  res.json(admin);
});

// get all the admins
router.get("/", auth, adminAuth, async (req, res) => {
  const admins = await Admin.find().select({ password: 0});
  res.json(admins);
});

// create a new admin
router.post("/", auth, adminAuth, async (req, res) => {
  const validatedAdmin = validateAdmin(req.body);
  if (validatedAdmin.error) return res.status(400).send(validatedAdmin.error.details[0].message);
  
  let admin = await Admin.findOne({ email: req.body.email });
  if(admin) return res.status(400).send("Admin alredy exixts.");
  
  admin = new Admin(_.pick(req.body, ["firstname", "middlename", "lastname", "email", "isAdmin" ]));
  const salt = await bcrypt.genSalt();
  const hash =  await bcrypt.hash( _.pick(req.body, ["password"]).password , salt);
  admin.password = hash;
  admin = await admin.save();
  admin = _.pick(admin, ["firstname", "middlename", "lastname", "email", "isAdmin", "_id"]);
  res.json(admin);
});

// edit a admin
router.put("/", auth, adminAuth, async (req, res) => {
  const schema = Joi.object({
    firstname: Joi.string().min(1).max(255).required(),
    middlename: Joi.string().min(1).max(255),
    lastname: Joi.string().min(1).max(255),
    isAdmin: Joi.boolean().required(),
    _id: Joi.objectId().required()
  });

  const {error} = schema.validate(req.body);
  if(error) return res.status(400).send(error.details[0].message);

  let admin = await Admin.findById(req.body._id);
  if(!admin) return res.status(404).send("User not found.");

  admin.firstname = req.body.firstname;
  admin.middlename = req.body.middlename;
  admin.lastname = req.body.lastname;
  admin.isAdmin = req.body.isAdmin;
  admin = await admin.save();
  admin = _.pick(admin, ["firstname", "middlename", "lastname", "email", "isAdmin"]);
  res.json(admin);
});


// delete an admin
router.delete("/", auth, adminAuth, async (req, res) => {
  const {error} = Joi.object({ _id: Joi.objectId() }).validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  
  const admin = await Admin.findByIdAndDelete(req.body._id);
  if (!admin) return res.status(404).send("Admin not found.");

  res.json({ "success": true});
});

module.exports = router;
