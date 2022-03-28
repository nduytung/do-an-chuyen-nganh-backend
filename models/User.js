const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
  resetPassword: {
    data: String, //khong phai type
    default: "",
  },
  rewardList: [
    {
      rewardId: String,
    },
  ],
  accountBalance: {
    type: Number,
    default: 3000,
  },
});

module.exports = mongoose.model("users", UserSchema);
