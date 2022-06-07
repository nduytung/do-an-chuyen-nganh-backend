const express = require("express");
const handleReturn = require("../asyncFunctions/utilFunctions");
const userAuthenticate = require("../middlewares/auth.middleware");
const Image = require("../models/Image");
const router = express.Router();

router.post("/create", userAuthenticate, async (req, res) => {
  const { image } = req.body;
  console.log(req.body);
  if (!image) return handleReturn(res, 403, "Bad request: missing image field");
  try {
    const newImage = new Image({ imageUrl: image });
    await newImage.save();
    return handleReturn(res, 200, "Post image success", true, {
      imageId: newImage._id,
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

router.post("/getById", userAuthenticate, async (req, res) => {
  const { imageId } = req.body;
  if (!imageId) return handleReturn(res, 403, "Bad request: missing id field");
  console.log(req.body);
  try {
    const data = await Image.findOne({ _id: imageId });
    if (!data)
      return handleReturn(res, 404, "Error: Image not found, please try again");

    return handleReturn(res, 200, "Find image successfully", true, {
      imageUrl: data.imageUrl,
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`);
  }
});

module.exports = router;
