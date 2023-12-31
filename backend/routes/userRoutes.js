// routes/userRoutes.js
const express = require("express");
const User = require("../models/User");
const Token = require("../models/token");
const Key = require("../models/Key")
const sendEmail = require("../utils/sendEmail");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
process.env.NODE_ENV = "development";
const axios = require('axios')


// POST /api/signup
const otpMap = new Map();
router.post("/signup", async (req, res) => {
  const { username, email, password, userType } = req.body;

  try {
    // Check if the email already exists in the database
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already exists" });
    }
    // mod
    if (userType === "university") {
      console.log('Executing generate keys get req')
      const res = await axios.get(`http://localhost:${process.env.PORT}/ecdsa/genKeys`)
      console.log(res.data)
      const pvt_key = res.data.privateKey
      const signer_address = res.data.publicKey
      const newKey = new Key({ email, pvt: pvt_key, signer: signer_address })
      const key = await newKey.save()
      console.log(key)
    }
    const newUser = new User({ username, email, password, userType });
    const user = await newUser.save();
    console.log(user);
    const token = await new Token({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex"),
    }).save();
    // mod end
    const url = `${process.env.BASE_URL}users/${user._id}/verify/${token.token}`;
    // await sendEmail(user.email, "Verify Email", url);

    // Generate and send the OTP in the email
    const otp = await sendEmail(
      email,
      "Verify Email",
      "To verify your account please enter the OTP in our site"
    );
    otpMap.set(user._id.toString(), otp);
    //console.log(otp);

    res
      .status(201)
      .json({ message: "An Email sent to your account please verify" });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    
    return res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    }).status(200).json({ message: "Login Success", userId : user._id, userType : user.userType })

    // Return the user ID along with the token in the response
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/logout", (req, res) => {
  try {
      res.cookie("token", "", {
          httpOnly: true,
          expires: new Date(0),
          secure: true,
          sameSite: "none",
      }).send("Logout Successful!")
  } catch (err) {
      res.status(500).send({errorMessage: err})
  }
})


// Add more user-related routes if needed
router.get("/:id/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) return res.status(400).send({ maessage: "Invalid Link" });
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) return res.status(400).send({ message: "invalid link" });
    await User.updateOne({ _id: user._id, verified: true });
    await token.remove();
    res.status(200).send({ message: "Email verified successfully" });
  } catch (err) { }
});
router.post("/otp/validate", async (req, res) => {
  const { email, otp } = req.body;

  try {
    // Check if the user with the provided email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Get OTP from cache using user's ID
    const cachedOTP = otpMap.get(user._id.toString());

    if (!cachedOTP || otp !== cachedOTP) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    // Mark the user as verified (you can add a verified field to your User model)
    user.verified = true;
    await user.save();
    setTimeout(() => {
      otpMap.delete(user._id.toString());
    }, 600000);

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    return res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none"
    }).status(200).send({ message: "OTP validation successful", userId : user._id })
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
