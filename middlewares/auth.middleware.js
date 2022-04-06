const handleReturn = require("../asyncFunctions/utilFunctions");

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const userAuthenticate = (req, res, next) => {
  const authHeader = req?.header("Authorization");
  const token = authHeader && authHeader.split(" ")[1]; //bearer token

  if (!token) return handleReturn(res, 401, "Access token not found", false);
  console.log(token);
  try {
    jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
      if (err) return handleReturn(res, 403, "Access token invalid", false);
      console.log("Decoded token successfully");
      console.log(user);
      req.userId = user.userId;
      next();
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`, false);
  }
};

module.exports = userAuthenticate;
