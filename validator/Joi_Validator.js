const Joi = require('joi');

const validator = (schema) => (payload) => schema.validate(payload, {abortEarly: false});

const signUpSchema = Joi.object({
    firstname: Joi.string().required(),
    lastname: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    gender: Joi.string().required(),
    hobbies: Joi.array().items(Joi.string()).required(),
    user_role: Joi.string().required()
});

exports.validUserDetails = validator(signUpSchema); 