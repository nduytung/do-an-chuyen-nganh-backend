const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  imageUrl: {
    type: String,
    required: true,
  },
});

module.exports = new mongoose.model("image", ImageSchema);
