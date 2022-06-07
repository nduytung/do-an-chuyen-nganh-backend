const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const uniqueValidator = require("mongoose-unique-validator");

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    unique: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  avt: {
    type: String,
  },
  resetPassword: {
    data: String, //khong phai type
    default: "",
  },
  rewardList: [
    {
      rewardId: {
        type: String,
      },
    },
  ],
  accountBalance: {
    type: Number,
    default: 3000,
  },

  spent: {
    type: Number,
    default: 0,
  },

  //react cua user doi voi tung post
  react: {
    upvote: [
      {
        projectId: {
          type: String,
        },
      },
    ],
    downvote: [
      {
        projectId: {
          type: String,
        },
      },
    ],
  },
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
  remindList: [
    {
      projectId: {
        type: String,
        unique: true,
      },
    },
  ],
});

UserSchema.plugin(uniqueValidator);
module.exports = mongoose.model("users", UserSchema);
