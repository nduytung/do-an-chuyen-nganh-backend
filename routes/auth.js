const express = require("express");
const { verifyFields } = require("../asyncFunctions/utilFunctions");
const router = express.Router();

router.post("/login", async (req, res) => {
  if (verifyFields(req, res, { username, password })) {
  } else return;
});

module.exports = router;
