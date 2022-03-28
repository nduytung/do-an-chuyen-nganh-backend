var express = require("express");
const { handleReturn } = require("../asyncFunctions/utilFunctions");
const userAuthenticate = require("../middlewares/auth.middleware");
const Project = require("../models/Project");
const User = require("../models/User");
var router = express.Router();

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/info/:id", async (req, res) => {
  const { userId } = req.body;
  const { id } = req.params.id;

  if (!userId) return handleReturn(res, 403, "Missing fields");

  try {
    const userInfo = await User.findOne(
      { _id: id },
      { username, fullname, email, avt, rewardList }
    );

    if (!userInfo) return handleReturn(res, 404, "User profile not found");

    return handleReturn(res, 200, "Get user info successfully", true, userInfo);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.get("/admin/reported", userAuthenticate, async (req, res) => {
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

router.post("/report/:id", userAuthenticate, async (req, res) => {
  const { id } = req.params.id; //userid bi report

  const { userId } = req; //userid cua nguoi di report

  const { detail } = req.body;
  if (!userId || !detail)
    return handleReturn(res, 403, "Unauthorized: user id not found");

  try {
    const reportUser = await User.findOneAndUpdate(
      { _id: id },
      {
        reported: {
          status: true,
          $push: {
            excuses: {
              userId,
              detail,
            },
          },
        },
      }
    );

    if (!reportUser)
      return handleReturn(res, 404, "User report not found, please try again");

    return handleReturn(res, 200, "Report user successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.get("/rewards/:id", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { id } = req.params.id;
  if (!userId) return handleReturn(res, 403, "Unauthorized: user id not found");

  try {
    const userReward = await User.findOne(
      { _id: id },
      {
        rewardList,
      }
    );

    if (!userReward)
      return handleReturn(res, 404, "No reward found for this user");

    return handleReturn(res, 200, "Get user reward successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.get("/remind-list", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleReturn(res, 403, "Unauthorized: user id not found");

  try {
    const remindList = await User.findOne(
      { _id: userId },
      {
        remindList,
      }
    );
    if (!remindList) return handleReturn(res, 404, "Remind list not found");

    const remindListDetail = remindList.map(async (item) => {
      return await Project.findOne(
        { _id: item.projectId },
        { projectName, category, raised, goal, daysLeft }
      );
    });

    if (!remindListDetail)
      return handleReturn(res, 404, "Remind item not found");

    return handleReturn(res, 200, "Get user remind list successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

module.exports = router;
