import handleReturn from "../asyncFunctions/handleReturn";

const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const express = require("express");
const router = express.Router();

dotenv.config();

export const userAuthenticate = async (req, res, next) => {
  const authHeader = res.headers["Authorization"];
  const token = authHeader && authHeader.split(" ")[1]; //bearer token

  if (!token) return handleReturn(res, 401, "Access token not found", false);

  try {
    jwt.verify(token, process.env.SECRET_TOKEN, (err, user) => {
      if (err) return handleReturn(res, 403, "Access token invalid", false);
      req.user = user;
      next();
    });
  } catch (err) {
    return handleReturn(res, 500, `Internal server error: ${err}`, false);
  }
};
