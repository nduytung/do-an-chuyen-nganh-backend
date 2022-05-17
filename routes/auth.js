const express = require("express");
const handleReturn = require("../asyncFunctions/utilFunctions");
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
    return handleReturn(res, 200, "Create account successfully", true, token);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error ${err}`, false);
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return handleReturn(res, 401, "Missing fields", false);
  try {
    const existUser = await User.findOne(
      { username },
      { _id: 1, fullname: 1, username: 1, password: 1 }
    );
    if (!existUser)
      return handleReturn(
        res,
        400,
        "Username not found, please try again",
        false
      );

    console.log(existUser.password);
    console.log(password);

    const validPassword = argon2.verify(existUser.password, password);
    if (!validPassword)
      return handleReturn(res, 403, "Wrong password, please try again");

    const accessToken = jwt.sign(
      {
        userId: existUser._id,
      },
      process.env.SECRET_TOKEN
    );

    console.log(accessToken);

    return handleReturn(res, 200, "Login successfully", true, {
      token: accessToken,
      fullname: existUser.fullname,
      username: existUser.username,
    });
  } catch (err) {
    return handleReturn(res, 500, "Internal server error: " + err);
  }
});

router.put("/reset", async (req, res) => {
  const { email } = req.body;
  if (!email)
    return handleReturn(
      res,
      401,
      "Bad request: please provide email to confirm"
    );

  try {
    const user = User.findOne({ email });
    if (!user)
      return handleReturn(res, 404, "User email not found, please try again");

    /* neu da day du tat ca truowng:
    - gui kem theo mot chuoi bam, chuoi bam nay se duoc bam tu 
    */
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});
module.exports = router;
