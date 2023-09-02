const express = require("express");
const { loginUser, registerUser } = require("../controllers/authControllers");
const Joi = require("joi");
const router = express.Router();
const validator = require("express-joi-validation").createValidator({});
const auth = require("../middlewares/auth");

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(32).required("Username is required"),
  password: Joi.string().min(6).max(32).required(),
  email: Joi.string().email().required()
});

const loginSchema = Joi.object({
  password: Joi.string().min(6).max(12).required(),
  email: Joi.string().email().required()
})

router.post("/register", validator.body(registerSchema) , registerUser);

router.post("/login", validator.body(loginSchema), loginUser);

//test route for auth

router.get("/test", auth, (req,res) => {
  res.send("Auth working");
})

module.exports = router;