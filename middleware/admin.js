const {Admin} = require("../models/admin.js");

module.exports = async function (req, res, next) {
  if (!req.user.isAdmin) return res.status(403).send("Forbidden.");

  const admin = await Admin.findById(req.user._id);
  if(!admin) return res.status(401).send("Unauthorized.");
  next();
};
