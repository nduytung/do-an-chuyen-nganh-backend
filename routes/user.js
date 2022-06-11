var express = require("express");
const router = express.Router();
const handleReturn = require("../asyncFunctions/utilFunctions");
const userAuthenticate = require("../middlewares/auth.middleware");
const Project = require("../models/Project");
const User = require("../models/User");

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

router.get("/info/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const userInfo = await User.findOne(
      { _id: id },
      {
        _id: 1,
        username: 1,
        fullname: 1,
        email: 1,
        avt: 1,
        rewardList: 1,
        accountBalance: 1,
        spent: 1,
      }
    );

    const userProject = await Project.find(
      { authorId: id },
      { projectName: 1, raised: 1, goal: 1, date: 1, category: 1, image: 1 }
    );
    if (!userInfo) return handleReturn(res, 404, "User profile not found");

    return handleReturn(res, 200, "Get user info successfully", true, {
      info: userInfo,
      projectList: userProject,
    });
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
        rewardList: 1,
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
        remindList: 1,
      }
    );
    if (!remindList) return handleReturn(res, 404, "Remind list not found");
    const remindListDetail = await Promise.all(
      remindList.remindList.map(async (item) => {
        return await Project.findOne(
          { _id: item.projectId },
          { projectName: 1, category: 1, raised: 1, goal: 1, daysLeft: 1 }
        );
      })
    );

    if (!remindListDetail)
      return handleReturn(res, 404, "Remind item not found");

    return handleReturn(res, 200, "Get user remind list successfully", true, {
      remindListDetail,
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.post("/notify", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { projectName, moneyAmount, ownerId } = req.body;
  console.log("money: " + moneyAmount);
  if (!projectName || !moneyAmount || !ownerId)
    return handleReturn(
      res,
      403,
      "Bad request: missing field - cannot notify right now"
    );

  try {
    const backerInfo = await User.findOneAndUpdate(
      { _id: userId },
      { $inc: { balance: -moneyAmount } }
    );

    const profileUser = await User.findOneAndUpdate(
      { _id: ownerId },
      {
        $push: {
          noti: {
            backerName: backerInfo.fullname,
            moneyAmount: moneyAmount,
            projectName: projectName,
          },
        },
      }
    );
    console.log(profileUser);
    if (!profileUser)
      return handleReturn(res, 404, "User profile not found, please try again");

    return handleReturn(res, 200, "Push notification successfully", true, {
      profileUser,
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.get("/noti-list", userAuthenticate, async (req, res) => {
  const { userId } = req;
  try {
    const userNotiList = await User.findOne({ _id: userId }, { noti: 1 });

    if (!userNotiList)
      return handleReturn(
        res,
        404,
        "User noti list not found or user doesnt have any noti yet"
      );

    return handleReturn(res, 200, "Get user noti list successfully", true, {
      notiList: userNotiList.noti,
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

module.exports = router;
