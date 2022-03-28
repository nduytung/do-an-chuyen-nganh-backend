var express = require("express");
const { handleReturn } = require("../asyncFunctions/utilFunctions");
const userAuthenticate = require("../middlewares/auth.middleware");
const User = require("../models/User");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/info", async (req, res) => {
  const { userId } = req.body;
  if (!userId) return handleReturn(res, 403, "Missing fields");

  try {
    const userInfo = await User.findOne(
      { _id: userId },
      { username, fullname, email, avt, rewardList }
    );

    if (!userInfo) return handleReturn(res, 404, "User profile not found");

    return handleReturn(res, 200, "Get user info successfully", true, userInfo);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.get("/reported", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleReturn(res, 403, "User id not found");

  try {
    const reportedUserList = await User.find(
      { reported: { status: true } },
      { _id, username, reported: { excuses } }
    );
    if (!reportedUserList)
      return handleReturn(res, 404, "No reported user found");

    return handleReturn(
      res,
      200,
      "Get reported users successfully",
      true,
      reportedUserList
    );
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

module.exports = router;
