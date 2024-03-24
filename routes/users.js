const express = require("express");
const _ = require("lodash");

const router = express.Router();

const {User, validateUser} = require("../models/users.js");


// Get all users 
router.get("/", async (req, res) => {
  const users = await User.find();
  return res.send(users);
});

// Get a single user using rollno
router.get("/:rollno", async(req, res) => {
  const rollno = req.params.rollno;
  console.log(typeof rollno)
  const user = await User.findOne({rollno: rollno});
  
  if (!user) return res.status(400).send("User not found");
  return res.send(user);

});


// Add a new user 
router.post("/", async (req, res) => {
  const validatedUser = validateUser(req.body );
  if(validateUser.error) return res.send(validatedUser.error.details[0].message);

  let user = await User({
    firstname: validatedUser.value.firstname,
    middlename: validatedUser.value.middlename,
    lastname: validatedUser.value.lastname,
    rollno: validatedUser.value.rollno,
    department: validatedUser.value.department,
    branch: validatedUser.value.branch,
    batch: validatedUser.value.batch,
    currentSem: validatedUser.value.currentSem,
    address: validatedUser.value.address,
    hostel: validatedUser.value.hostel,
    roomno: validatedUser.value.roomno,
    phoneno: validatedUser.value.phoneno,
    degreeLevel: validatedUser.value.degreeLevel,
    personalEmail: validatedUser.value.personalEmail,
    universityEmail: validatedUser.value.universityEmail
  });

  user = await user.save();
  return res.send(user);
});



module.exports = router;
