const express = require("express");
const {
  verifyFields,
  handleReturn,
} = require("../asyncFunctions/utilFunctions");
const router = express.Router();
const argon2 = require("argon2");
const User = require("../models/User");
const jwt = require("jsonwebtoken");

router.post("/register", async (req, res) => {
  const { username, password, email, fullname } = req.body;
  if (!username || !password || !email || !fullname)
    return handleReturn(res, 401, "Missing fields", false);

  try {
    //kiem tra ton tai
    const checkExist = await User.findOne({ $or: [{ username }, { email }] });
    if (checkExist)
      return handleReturn(res, 400, `Username or email already exists`, false);

    //tao tai khoan moi
    const hashedPassword = await argon2.hash(password);
    const newUser = await new User({
      username,
      password: hashedPassword,
      fullname,
      email,
    });
    await newUser.save();

    //tra ve token
    const token = jwt.sign(
      {
        userId: newUser._id,
      },
      process.env.SECRET_TOKEN
    );
    return handleReturn(res, 403, "Create account successfully", true, token);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error ${err}`, false);
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return handleReturn(res, 401, "Missing fields", false);
  try {
    const existUser = await User.findOne({ username });
    if (!existUser)
      return handleReturn(
        res,
        400,
        "Username not found, please try again",
        false
      );

    const validPassword = argon2.verify(existUser.password, password);
    if (!validPassword)
      return handleReturn(res, 403, "Wrong password, please try again");

    const accessToken = jwt.sign(
      {
        userId: username._id,
      },
      process.env.SECRET_TOKEN
    );

    return handleReturn(res, 200, "Login successfully", true, accessToken);
  } catch (err) {
    return handleReturn(res, 500, "Internal server error: " + err);
  }
});

module.exports = router;
