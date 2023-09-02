const User = require("../models/User");
const bcrypt = require("bcryptjs");
var jwt = require('jsonwebtoken');

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).send("Invalid Credentials: Try again.");
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(400).send("Invalid Credentials: Try again.");
    }

    const token = jwt.sign({
      userId: user._id,
      email
    },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    return res.status(200).json({
      userDetails: {
        email: user.email,
        token: token,
        username: user.username
      }
    })

  } catch (error) {
    return res.status(500).send("Error occured: Please try again.");
  }
}

exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;


    //Check if user exists
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(409).send("Email already in use");
    }

    //encrypt password
    const encryptedPassword = await bcrypt.hash(password, 10);

    //save user
    const user = await User.create({
      username,
      email: email.toLowerCase().trim(),
      password: encryptedPassword
    })

    await user.save();

    // Create JWT Token

    const token = jwt.sign({
      userId: user._id,
      email
    },
      process.env.JWT_SECRET,
      {
        expiresIn: "7d"
      }
    );

    res.status(201).json({
      userDetails: {
        email: user.email,
        username: user.username,
        token: token
      }
      
    })

  } catch (error) {
    return res.status(500).send("Error occured: Please try again.");
  }
}