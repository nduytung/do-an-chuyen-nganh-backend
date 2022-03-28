const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  projectName: {
    type: String,
    required: true,
    unique: true,
  },
  //type: keu goi von hay la dong gop y kien
  type: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  //tong so tien keu goi
  goal: {
    type: Number,
    required: true,
  },
  //so tien da keu goi dc
  raised: {
    type: Number,
    required: true,
  },
  //so nguoi quyen gop, so tien quyen gop
  backer: [
    {
      name: {
        type: String,
        required: true,
      },
      amount: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        required: true,
      },
    },
  ],
  daysLeft: {
    type: Date,
    required: true,
  },
  shortStory: {
    type: String,
    required: true,
  },
  authorId: {
    type: String,
    required: true,
  },
  fullStory: {
    type: String,
    required: true,
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
      required: true,
    },
  ],
  category: {
    type: String,
    required: true,
  },
  date: {
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
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
        required: true,
      },
      commentDetail: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  ],

  //cap nhat tien do
  updatePath: [
    {
      title: {
        type: String,
        required: true,
      },
      content: {
        type: String,
        required: true,
      },
      time: {
        type: String,
        required: true,
      },
    },
  ],

  reported: {
    status: {
      type: Boolean,
      default: true,
    },
    excuses: [
      {
        userId: {
          type: String,
        },
        detail: {
          type: String,
        },
      },
    ],
  },
});

module.exports = mongoose.model("projects", ProjectSchema);
