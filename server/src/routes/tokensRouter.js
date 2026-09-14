const express = require("express");
const verifyRefreshToken = require("../middlewares/verifyRefreshToken");
const generateTokens = require("../utils/generateTokens");
const cookieConfig = require("../configs/cookieConfig");
const { User } = require("../../db/models");

const tokensRouter = express.Router();

tokensRouter.get("/refresh", verifyRefreshToken, async (req, res) => {
  try {

    const freshUser = await User.findByPk(res.locals.user.id, {
      attributes: ["id", "name", "email", "coins"],
    });

    if (!freshUser) {
      return res.clearCookie("refreshToken").sendStatus(401);
    }

    const user = freshUser.get();
    const { accessToken, refreshToken } = generateTokens({ user });

    res
      .cookie("refreshToken", refreshToken, cookieConfig)
      .json({ accessToken, user });
  } catch (error) {
    console.error(error.message);
    res.sendStatus(500);
  }
});

module.exports = tokensRouter;
