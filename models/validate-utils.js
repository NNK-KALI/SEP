const Joi = require("joi");

function validateId(id) {
  const schema = Joi.object({
    id: Joi.objectId()
  });

  return schema.validate({id: id});
}

module.exports = validateId;
