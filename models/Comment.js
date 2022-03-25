const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  projectId: {
    type: String,
    required,
  },
  title: {
    type: String,
    required,
  },
  starRate: {
    type: Number,
    required,
  },
  content: {
    type: String,
    required,
  },
  image: {
    type: String,
  },
  userId: {
    type: String,
    required,
  },
});

module.exports = mongoose.Schema("comments", CommentSchema);
