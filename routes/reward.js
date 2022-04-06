const express = require("express");
const handleReturn = require("../asyncFunctions/utilFunctions");
const userAuthenticate = require("../middlewares/auth.middleware");
const Project = require("../models/Project");
const Reward = require("../models/Reward");
const User = require("../models/User");
const router = express.Router();

router.post("/create", userAuthenticate, async (req, res) => {
  const { userId } = req;

  const { rewardName, projectId, image, minimumPrice, quantity } = req.body;
  if (!rewardName || !projectId || !image || !minimumPrice || !quantity)
    return handleReturn(res, 401, "Missing fields");

  //check user exists
  const findUser = await User.findOne({ _id: userId });
  if (!findUser) return handleReturn(res, 403, "Unauthorized: user not found");

  //check user is project owner
  const projectOwner = await Project.findOne({
    $and: [{ _id: projectId }, { userId }],
  });
  if (!projectOwner)
    return handleReturn(
      res,
      404,
      "Project not found, or you dont have role to modify project"
    );

  try {
    const newReward = new Reward({
      rewardName,
      projectId,
      image,
      minimumPrice,
      quantity,
    });

    await newReward.save();
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.delete("/delete", userAuthenticate, async (req, res) => {
  const { userId } = req;

  const { rewardId, projectId } = req.body;
  if (!rewardId || !projectId)
    return handleReturn(res, 403, "Bad request: project id not provided");

  try {
    const deleteReward = await Reward.findOneAndDelete({ rewardId, projectId });
    if (!deleteReward)
      return handleReturn(res, 404, "Reward id not found, please try again");

    return handleReturn(res, 200, "Delete reward successfully");
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.put("/update", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleReturn(res, 401, "Bad request: user id not found");
  const { rewardId, projectId } = req.body;
  if (!rewardId || !projectId)
    return handleReturn(
      res,
      403,
      "Bad request: reward id & project id not found"
    );

  try {
    const editReward = await Reward.findOneAndUpdate(
      { rewardId, projectId },
      { ...req.body }
    );
    if (!editReward)
      return handleReturn(
        res,
        401,
        "Reward id not found, or your fields are not suitable"
      );

    return handleReturn(res, 200, "Edit reward successfully");
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});
