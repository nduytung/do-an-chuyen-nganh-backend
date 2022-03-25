const express = require("express");
const router = express.Router();
const { handleRes } = require("../asyncFunctions/utilFunctions");
const { userAuthenticate } = require("../middlewares/auth.middleware");
const Project = require("../models/Project");

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
