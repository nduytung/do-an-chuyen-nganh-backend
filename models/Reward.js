const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RewardSchema = new Schema({
  rewardName: {
    type: String,
    required,
  },
  projectId: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required,
  },
  //so luong khach hang da lay dc item
  backers: {
    type: Number,
  },
  //so luong tong cong item co
  quantity: {
    type: Number,
    required,
  },
});

module.exports = mongoose.Schema("rewards", RewardSchema);
