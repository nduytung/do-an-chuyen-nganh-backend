const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  projectName: {
    type: String,
    required,
    unique,
  },
  //type: keu goi von hay la dong gop y kien
  type: {
    type: Enumerator,
    required,
  },
  userId: {
    type: string,
    required,
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
  //so nguoi quyen gop, so tien quyen gop
  backer: [
    {
      name: {
        type: String,
        required,
      },
      amount: {
        type: String,
        required,
      },
      date: {
        type: Date,
        required,
      },
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

  //star rate se duoc tinh trung binh boi comment

  update: [
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
  category: {
    type: Enumerator,
    required,
  },
  date: {
    startTime: {
      type: string,
      required,
    },
    endTime: {
      type: string,
    },
  },

  //react se chi co 1 kieu duy nhat la upvote
  upvote: {
    type: Number,
    default: 0,
  },
  comment: [
    {
      userId: {
        type: String,
        required,
      },
      commentDetail: {
        type: String,
        required,
      },
      time: {
        type: String,
        required,
      },
    },
  ],

  //cap nhat tien do
  updatePath: [
    {
      title: {
        type: String,
        required,
      },
      content: {
        type: String,
        required,
      },
      time: {
        type: String,
        required,
      },
    },
  ],
});

module.exports = mongoose.Schema("projects", ProjectSchema);
