const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  projectName: {
    type: String,
    required,
    unique,
  },
  //tong so tien keu goi
  goal: {
    type: Number,
    required,
  },
  //so tien da keu goi dc
  raised: {
    type: Number,
    required,
  },
  //so nguoi quyen gop
  backer: [
    {
      type: Number,
    },
  ],
  daysLeft: {
    type: Date,
    required,
  },
  shortStory: {
    type: String,
    required,
  },
  authorId: {
    type: String,
    required,
  },
  fullStory: {
    type: String,
    required,
  },
  comments: [
    {
      type: String,
    },
  ],
  starRate: {
    type: Number,
  },
  rewardIds: [
    {
      type: String,
    },
  ],

  image: [
    {
      type: String,
      required,
    },
  ],
});

module.exports = mongoose.Schema("projects", ProjectSchema);
