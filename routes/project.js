const express = require("express");
const router = express.Router();
const handleReturn = require("../asyncFunctions/utilFunctions");
const userAuthenticate = require("../middlewares/auth.middleware");
const Image = require("../models/Image");
const Project = require("../models/Project");
const Reward = require("../models/Reward");
const User = require("../models/User");
const { Momo } = require("./momo");

/**
 * @swagger
 * paths:
 *  /all:
 *   get:
 *      description: Use to request all customers
 *      responses:
 *        "200":
 *         description: A successful response
 */
//CRUD
router.get("/all", async (req, res) => {
  try {
    const projects = await Project.find(
      {},
      {
        _id: 1,
        projectName: 1,
        date: 1,
        image: 1,
        category: 1,
        type: 1,
        goal: 1,
        raised: 1,
      }
    );
    if (!projects) return handleReturn(res, 404, "No project found", false);

    return handleReturn(
      res,
      200,
      "Get all project successfully",
      true,
      projects
    );
  } catch (err) {
    return handleReturn(res, 500, "Internal server error: " + err, false);
  }
});

router.post("/create", userAuthenticate, async (req, res) => {
  const { userId } = req;
  console.log(req.body);
  const { projectName, type, fullStory, shortStory, category, image } =
    req.body;
  if (!projectName || !type || !fullStory || !shortStory || !category || !image)
    return handleReturn(res, 403, "Bad request: Missing fields");

  try {
    //tim xem co bi trung ten khong
    const projectExists = await Project.findOne({ projectName });
    if (projectExists)
      return handleReturn(
        res,
        401,
        "Project name already exists, please try another name"
      );

    //gui anh len server
    try {
      const postImage = new Image({ imageUrl: image });
      await postImage.save();
      console.log(postImage);
    } catch (err) {
      return handleReturn(
        res,
        500,
        "Internal server error: Unable to send image to server, please try again later"
      );
    }

    if (type === "donate") {
      const { goal } = req.body;
      if (!goal)
        return handleReturn(
          res,
          403,
          "Bad request: Donate projects must include target money amount"
        );
    } else if (type === "research") {
      const { researchDetail } = req.body;
      if (!researchDetail)
        return handleReturn(
          res,
          403,
          "Bad request: Research projects must include research target"
        );
    }

    //neu khong trung ten thi cho tao va luu lai
    const newProject = await new Project({
      ...req.body,
      authorId: userId,
    });

    await newProject.save();
    return handleReturn(res, 200, "Create new project successfully", true);
  } catch (err) {
    console.log("Err : " + err);
    return handleReturn(res, 500, `Internal server error : ${err}`, false);
  }
});

router.put("/update", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId)
    return handleReturn(res, 400, "Forbidden: access token not found");

  const { projectId } = req.body;

  //check project owner
  const projectOwner = await Project.findOne({
    $and: [{ _id: projectId }, { userId }],
  });
  if (!projectOwner)
    return handleReturn(
      res,
      403,
      "Forbidden: You are not allow to modify project"
    );

  try {
    const updatedProject = await Project.findOneAndUpdate(
      { projectId },
      {
        ...req.body,
      },
      { returnNewDocument: true }
    );
    if (!updatedProject)
      return handleReturn(res, 403, "Bad request: project not found");
    return handleReturn(res, 200, "Update project successfully", true, {
      updatedProject,
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.delete("/delete/:id", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { id } = req.params;
  if (!userId || !id) return handleReturn(res, 400, "Forbidden: please login");

  //check project owner
  const projectOwner = await Project.findOne({
    $and: [{ _id: id }, { userId }],
  });
  if (!projectOwner)
    return handleReturn(
      res,
      403,
      "Forbidden: You are not allow to modify project"
    );

  try {
    const deleteProject = await Project.findOneAndDelete({ _id: id });
    if (!deleteProject)
      return handleReturn(res, 404, "Project not found to be deleted!");
    return handleReturn(res, 200, "Delete project successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

//get project by id
router.get(`/detail/:id`, async (req, res) => {
  const { id } = req.params;
  if (!id)
    return handleReturn(res, 400, "Bad request: please provide project id");

  try {
    const checkExists = await Project.findOne(
      { _id: id },
      {
        projectName: 1,
        type: 1,
        authorId: 1,
        goal: 1,
        raised: 1,
        daysLeft: 1,
        shortStory: 1,
        fullStory: 1,
        category: 1,
        date: 1,
        upvote: 1,
        backer: 1,
        image: 1,
        researchDetail: 1,
      }
    );
    if (!checkExists) return handleReturn(res, 404, "Project ID not found");

    //neu tim thay
    return handleReturn(
      res,
      200,
      "Get project detail successfully",
      true,
      checkExists
    );
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

//donate project
router.put(`/donate`, userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { projectId, raisedAmount } = req.body;

  if (!userId || !projectId)
    return handleReturn(res, 403, "Forbidden: please login");

  const { donateAmount } = req.body;
  if (!donateAmount)
    return handleReturn(res, 401, "Bad request: missing fields");

  try {
    const checkExists = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        raised: parseInt(raisedAmount) + parseInt(donateAmount),
      }
    );
    if (!checkExists) return handleReturn(res, 404, "Project not found");

    // //neu DA UPDATE THANH CONG:
    // /*
    // - check xem co du tien de nhan item nao chua
    // - check xem item do con quantity khong
    // - them item do vao trong tui do cua user (rewardList)
    // - xoa bot mot quantity
    // - tang so nguoi duoc nhan item do len trong Reward
    // - giam so tien con lai cua nguoi nay di
    // */

    // //kiem item xem cai nao thoa dieu kien, va lieu con hang khong
    // const findReceivedItem = await Reward.find({
    //   $and: [
    //     {
    //       projectId: projectId,
    //     },
    //     {
    //       minimumPrice: { $lt: donateAmount },
    //     },
    //     {
    //       quantity: { $gt: 0 },
    //     },
    //   ],
    // })
    //   .sort({ minimumPrice: -1 })
    //   .limit(1);

    // //neu nhu du tien de nhan item va item do con hang
    // if (findReceivedItem === true) {
    //   try {
    //     //them vao items list va tru di tien trong tai khoan
    //     const updateUserItems = await User.findOneAndUpdate(
    //       { _id: userId },
    //       {
    //         $push: {
    //           rewardList: {
    //             rewardId: findReceivedItem._id,
    //           },
    //         },
    //         $inc: {
    //           accountBalance: -donateAmount,
    //         },
    //       }
    //     );
    //     await updateUserItems.save();

    //     //tru di so luong va tang them so nguoi da nhan duoc items
    //     if (updateUserItems) {
    //       const updateRewardAtt = await Reward.findOneAndUpdate(
    //         { _id: findReceivedItem._id },
    //         {
    //           $inc: {
    //             quantity: -1,
    //             backers: 1,
    //           },
    //         }
    //       );
    //       await updateRewardAtt.save();
    //     }

    //     //tra ve ket qua neu co items de tang
    //     return handleReturn(res, 200, "Donate successfully with item", true);
    //   } catch (err) {
    //     return handleReturn(res, 403, `Something happened: ${err}`);
    //   }

    //   //neu nhu khong con item de tang
    // }
    return handleReturn(
      res,
      200,
      "Donate successfully, but no items left",
      true,
      checkExists
    );
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

//react project
router.post("/react", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { type, id } = req.body; //type la enum, la upvote hoac downvote

  if (!id) return handleReturn(res, 401, "Missing project id");
  if (!userId) return handleReturn(res, 403, "Unauthorized");
  if (!type || (type !== "upvote" && type !== "downvote"))
    return handleReturn(res, 401, "Please provide exact react type");

  //neu da du tat ca cac truong
  try {
    const userReact =
      type === "upvote"
        ? await User.findOneAndUpdate(
            {
              _id: userId,
            },
            {
              react: {
                $push: {
                  upvote: id,
                },
              },
            }
          )
        : await User.findOneAndUpdate(
            {
              _id: userId,
            },
            {
              react: {
                $push: {
                  downvote: id,
                },
              },
            }
          );

    if (!userReact)
      return handleReturn(res, 404, "User id not found, please try again");
    await userReact.save();

    const projectReact =
      type === "upvote"
        ? await Project.findOneAndUpdate(
            {
              _id: id,
            },
            {
              $inc: {
                upvote: 1,
              },
            }
          )
        : await Project.findOneAndUpdate(
            {
              _id: id,
            },
            {
              $inc: {
                upvote: -1,
              },
            }
          );

    if (!projectReact)
      return handleReturn(res, 404, "Project id not found, please try again");
    await projectReact.save();

    return handleReturn(res, 200, "Update vote successfully on both", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

//comment project
router.put("/comment", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { comment, id } = req.body;

  if (!userId) return handleReturn(res, 403, "User id not found");
  if (!comment || !id) return handleReturn(res, 403, "Missing fields");

  try {
    //tim thong tin ve user comment
    const checkUserExists = await User.findOne(
      { _id: userId },
      { username: 1 }
    );
    if (!checkUserExists)
      return handleReturn(res, 404, "User not found, please try again");

    //neu tim dc  user
    const updateProject = await Project.findOneAndUpdate(
      { _id: id },
      {
        $push: {
          comment: {
            username: checkUserExists.username,
            commentDetail: comment,
            time: new Date().toISOString().split("T")[0],
          },
        },
      }
    );

    console.log(updateProject);

    if (!updateProject)
      return handleReturn(res, 404, "Project not found, please try again");

    console.log("came here");

    //neu update thanh cong
    return handleReturn(res, 200, "Update comment successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.get("/comment/all/:projectId", async (req, res) => {
  const { projectId } = req.params;
  if (!projectId)
    return handleReturn(res, 400, "Bad request: missing project ID");

  try {
    const commentList = await Project.findOne(
      { _id: projectId },
      { comment: 1 }
    );
    if (!commentList)
      return handleReturn(res, 404, "Project comment not found");

    return handleReturn(res, 200, "Get comment list successfully", true, {
      commentList,
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

//update tien do project
router.post("/update/progress", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleReturn(res, 403, "User id not found");

  const { title, content, projectId } = req.body;
  if (!title || !content || !projectId)
    return handleReturn(res, 401, "Missing fields");

  try {
    //kiem tra xem nguoi dung nay co pahi chu project khong
    //kiem tra xem project nay co ton tai khong
    const updateProject = await Project.findOneAndUpdate(
      {
        $and: [
          {
            userId,
          },
          {
            _id: projectId,
          },
        ],
      },
      {
        $push: {
          updatePath: {
            title,
            content,
            time: new Date("<YYYY-mm-dd>"),
          },
        },
      }
    );

    await updateProject.save();

    if (!updateProject)
      return handleReturn(
        res,
        404,
        "Project not found, or you are not allow to modify project"
      );

    return handleReturn(res, 200, "Update project progress successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.get("/admin/reported", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleReturn(res, 403, "User id not found");

  try {
    const reportedProjects = await Project.find(
      { reported: { status: true } },
      {
        _id,
        projectName,
        userId,
        reported: { excuses },
      }
    );

    if (!reportedProjects)
      return handleReturn(res, 404, "No reported project found");

    return reportedProjects;
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.post(`/:id/report`, userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleReturn(res, 403, "Unauthorized: user id not found");

  const { id } = req.params;
  const { detail } = req.body;
  if (!detail)
    return handleReturn(res, 401, "Missing field: missing detail field");

  try {
    const reportProject = await Project.findOneAndUpdate(
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
    if (!reportProject) return handleReturn(res, 404, "Project not found");

    return handleReturn(res, 200, "Report project successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.post("/add/remind-list", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { id } = req.body;
  if (!userId) return handleReturn(res, 403, "Unauthorized: user id not found");
  if (!id)
    return handleReturn(res, 401, "Project id not provided, please try again");

  try {
    //tim xem co ton tai chua

    const addRemindList = await User.findOneAndUpdate(
      { _id: userId },
      {
        $push: {
          remindList: {
            projectId: id,
          },
        },
      }
    );
    if (!addRemindList)
      return handleReturn(res, 404, "User not found, please try again");

    return handleReturn(res, 200, "Add to remind list successfully", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.post("/momo-trigger", async (req, res) => {
  const { orderInfo, amount } = req.body;
  if (!orderInfo || !amount)
    return handleReturn(
      res,
      403,
      "Bad request: missing either order info or payment amount"
    );
  const data = await Momo(orderInfo, amount * 1000);
  console.log(data);
  if (data.payUrl)
    return handleReturn(res, 200, "Trigger momo API successfully", true, {
      payUrl: data.payUrl,
    });
  else {
    console.log(data);
    return handleReturn(
      res,
      500,
      `Internal server error: Cannot start momo API`
    );
  }
});

router.post("/momo-payment", async (req, res) => {
  console.log("momo triggered !");
  console.log(req.body);
});

router.put("/update-backer", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { name, amount, date, projectId } = req.body;
  if (!name || !amount || !date || !projectId)
    return handleReturn(res, 403, "Bad request: missing fields");

  try {
    const updateBackerList = await Project.findOneAndUpdate(
      {
        _id: projectId,
      },
      {
        $push: {
          backer: {
            name: name,
            amount: amount,
            date: date,
          },
        },
      }
    );

    if (!updateBackerList)
      return handleReturn(res, 404, "Project ID not found, please try again");

    return handleReturn(res, 200, "Update backer list successfully!", true);
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

module.exports = router;
