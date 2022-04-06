const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RewardSchema = new Schema({
  rewardName: {
    type: String,
    required: true,
  },
  projectId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  //gia toi thieu de lay dc item nay
  minimumPrice: {
    type: String,
    required: true,
  },
  //so luong khach hang da lay dc item
  backers: {
    type: Number,
    default: 0,
  },
  //so luong tong cong item co
  quantity: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("rewards", RewardSchema);
