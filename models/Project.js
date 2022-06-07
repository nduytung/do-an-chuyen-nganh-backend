const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const ProjectSchema = new Schema({
  projectName: {
    type: String,
    required: true,
    unique: true,
  },
  //type: keu goi von hay la dong gop y kien: vote, raise
  type: {
    type: String,
    required: true,
  },

  //nhung noi dung ma nguoi tao project muon nguoi khac comment
  researchDetail: {
    type: String,
    default: "",
  },

  //tong so tien keu goi
  goal: {
    type: Number || String,
    default: 0,
  },
  //so tien da keu goi dc
  raised: {
    type: Number,
    default: 0,
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

  image: {
    type: String,
    required: true,
  },

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
      username: {
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
        unique: true,
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

ProjectSchema.plugin(uniqueValidator);

module.exports = mongoose.model("projects", ProjectSchema);
