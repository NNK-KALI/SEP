const {Admin} = require("../models/admin.js");
const express = require("express");
const bcrypt = require("bcrypt");
const router = express.Router();
const Joi = require("joi");


router.post("/adminLogin", async (req, res) => {
  const validatedAdmin = validateAdmin(req.body);
  if (validatedAdmin.error) return res.status(400).send(validatedAdmin.error.details[0].message);

  let admin = await Admin.findOne({ email: req.body.email });
  if (!admin) return res.status(400).send("Invalid email.");

  const validPassword = await bcrypt.compare(req.body.password, admin.password);
  if(!validPassword) return res.status(400).send("Invalid password.");
  
  const token = admin.generateAdminAuthToken();
  res.send(token);
});

function validateAdmin(admin) {
  const schema = Joi.object({
    email: Joi.string().min(1).max(255).required().email(),
    password: Joi.string().min(1).max(255).required(),
  });

  return schema.validate(admin);
}


// function validateUser(user) {
//   const schema = Joi.object({
//     email: Joi.string().min(5).max(255).required().email(),
//     password: Joi.string().min(5).max(255).required(),
//   })
//
//   return schema.validate(user);
// }

module.exports = router;
