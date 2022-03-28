const express = require("express");
const router = express.Router();
const { handleRes } = require("../asyncFunctions/utilFunctions");
const { userAuthenticate } = require("../middlewares/auth.middleware");
const Project = require("../models/Project");
const Reward = require("../models/Reward");
const User = require("../models/User");
const User = require("../models/User");

//CRUD
router.get("/all", async (req, res) => {
  try {
    const projects = await Project.find(
      {},
      {
        projectName,
        userId,
        daysLeft,
        image,
        category,
      }
    );
    if (!projects) return handleRes(res, 404, "No project found", false);

    return handleRes(res, 200, "Get all project successfully", true, projects);
  } catch (err) {
    return handleRes(res, 500, "Internal server error: " + err, false);
  }
});

router.post("/create", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleRes(res, 400, "Forbidden: please login", false);

  const data = ({
    projectName,
    type,
    goal,
    raised,
    daysLeft,
    shortStory,
    authorId,
    fullStory,
    image,
    category,
    date,
  } = req.body);

  if (!{ ...data })
    return handleRes(res, 401, "Bad request: missing fields", false);

  try {
    //tim xem co bi trung ten khong
    const projectExists = await Project.findOne({ projectName });
    if (projectExists)
      return handleRes(
        res,
        403,
        "Project name already exists, please try another name"
      );

    //neu khong trung ten thi cho tao va luu lai
    const newProject = await new Project({
      ...data,
      userId,
    });

    await newProject.save();
  } catch (err) {
    return handleRes(res, 500, `Internal server error : ${err}`, false);
  }
});

router.put("/update", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleRes(res, 400, "Forbidden: access token not found");

  const { projectId } = req.body;
  try {
    const checkExists = await Project.findOneAndUpdate(
      { projectId },
      {
        ...req.body,
      },
      { returnNewDocument: true }
    );
    if (!checkExists)
      return handleRes(res, 403, "Bad request: project not found");
    return handleRes(res, 200, "Update project successfully", true);
  } catch (err) {
    return handleRes(res, 500, `Internal server error: ${err}`);
  }
});

router.delete("/delete", userAuthenticate, async (req, res) => {
  const { userId } = req;
  const { projectId } = req.body;
  if (!userId || !projectId)
    return handleRes(res, 400, "Forbidden: please login");
  try {
    const deleteProject = await Project.findOneAndDelete({ projectId });
    if (!deleteProject)
      return handleRes(res, 404, "Project not found to be deleted!");
    return handleRes(res, 200, "Delete project successfully", true);
  } catch (err) {
    return handleRes(res, 500, `Internal server error: ${err}`);
  }
});

//get project by id
router.get(`/${id}`, async (req, res) => {
  const { id } = req.body;
  if (!id) return handleRes(res, 400, "Bad request: please provide project id");

  try {
    const checkExists = await Project.findOne({ _id: id });
    if (!checkExists) return handleRes(res, 404, "Project ID not found");

    //neu tim thay
    return handleRes(
      res,
      200,
      "Get project detail successfully",
      true,
      checkExists
    );
  } catch (err) {
    return handleRes(res, 500, `Internal server error: ${err}`);
  }
});

//donate project
router.post(`${id}/donate`, userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleRes(res, 403, "Forbidden: please login");

  const { donateAmount, projectId } = req.body;
  if (!donateAmount || !projectId)
    return handleRes(res, 401, "Bad request: missing fields");

  try {
    const checkExists = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        $inc: {
          raised: parseInt(donateAmount),
        },
      }
    );
    if (!checkExists) return handleRes(res, 404, "Project not found");

    await checkExists.save();

    //neu DA UPDATE THANH CONG:
    /*
    - check xem co du tien de nhan item nao chua 
    - check xem item do con quantity khong 
    - them item do vao trong tui do cua user (rewardList)
    - xoa bot mot quantity 
    - tang so nguoi duoc nhan item do len trong Reward 
    - giam so tien con lai cua nguoi nay di 
    */

    //kiem item xem cai nao thoa dieu kien, va lieu con hang khong
    const findReceivedItem = await Reward.find({
      $and: [
        ({
          minimumPrice: { $lt: donateAmount },
        },
        {
          quantity: { $gt: 0 },
        }),
      ],
    })
      .sort({ minimumPrice: -1 })
      .limit(1);

    //neu nhu du tien de nhan item va item do con hang
    if (findReceivedItem) {
      try {
        //them vao items list va tru di tien trong tai khoan
        const updateUserItems = await User.findOneAndUpdate(
          { _id: userId },
          {
            $push: {
              rewardList: {
                rewardId: findReceivedItem._id,
              },
            },
            $inc: {
              accountBalance: -donateAmount,
            },
          }
        );
        await updateUserItems.save();

        //tru di so luong va tang them so nguoi da nhan duoc items
        if (updateUserItems) {
          const updateRewardAtt = await Reward.findOneAndUpdate(
            { _id: findReceivedItem._id },
            {
              $inc: {
                quantity: -1,
                backers: 1,
              },
            }
          );
          await updateRewardAtt.save();
        }

        //tra ve ket qua neu co items de tang
        return handleRes(res, 200, "Donate successfully with item", true);
      } catch (err) {
        return handleRes(res, 403, `Something happened: ${err}`);
      }

      //neu nhu khong con item de tang
    }
    return handleRes(res, 200, "Donate successfully, but no items left", true);
  } catch (err) {
    return handleRes(res, 500, `Internal server error: ${err}`);
  }
});

//react project
router.post("/react", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleRes(res, 403, "Unauthorized");

  const { type, projectId } = req.body; //type la enum, la upvote hoac downvote
  if (!type || !projectId)
    return handleRes(res, 401, "Please provide react type");

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
                  upvote: {
                    projectId,
                  },
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
                  downvote: {
                    projectId,
                  },
                },
              },
            }
          );

    await userReact.save();

    const projectReact =
      type === "upvote"
        ? await Project.findOneAndUpdate(
            {
              _id: projectId,
            },
            {
              $inc: {
                upvote: 1,
              },
            }
          )
        : await Project.findOneAndUpdate(
            {
              _id: projectId,
            },
            {
              $inc: {
                upvote: -1,
              },
            }
          );

    await projectReact.save();
  } catch (err) {
    return handleRes(res, 500, `Internal server error: ${err}`);
  }
});

//comment project
router.post("/comment", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleRes(res, 403, "User id not found");

  const { comment, projectId } = req.body;
  if (!comment || !projectId) return handleRes(res, 403, "Missing fields");

  try {
    //tim thong tin ve user comment
    const checkUserExists = await User.findOne(
      { _id: userId },
      {
        username,
        avt,
      }
    );
    if (!checkUserExists)
      return handleRes(res, 404, "User not found, please try again");

    //neu tim dc  user
    const updateProject = await Project.findOneAndUpdate(
      { _id: projectId },
      {
        $push: {
          comment: {
            userId,
            commentDetail: comment,
            time: new Date("<YYYY-mm-dd>"),
          },
        },
      }
    );

    if (!updateProject)
      return handleRes(res, 404, "Project not found, please try again");

    await updateProject.save();

    //neu update thanh cong
    return handleRes(res, 200, "Update comment successfully", true);
  } catch (err) {
    return handleRes(res, 500, `Internal server error: ${err}`);
  }
});

//update tien do project
router.post("/update/progress", userAuthenticate, async (req, res) => {
  const { userId } = req;
  if (!userId) return handleRes(res, 403, "User id not found");

  const { title, content, projectId } = req.body;
  if (!title || !content || !projectId)
    return handleRes(res, 401, "Missing fields");

  try {
    //kiem tra xem nguoi dung nay co pahi chu project khong
    //kiem tra xem project nay co ton tai khong
    const updateProject = await Project.findOneAndUpdate(
      {
        userId,
        projectId,
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

    if (!updateProject) return handleRes(res, 404, "Project not found");

    return handleRes(res, 200, "Update project progress successfully", true);
  } catch (err) {
    return handleRes(res, 500`Internal server error: ${err}`);
  }
});
