const express = require("express");
const verifyRefreshToken = require("../middlewares/verifyRefreshToken");
const generateTokens = require("../utils/generateTokens");
const cookieConfig = require("../configs/cookieConfig");
const { User } = require("../../db/models");

const tokensRouter = express.Router();

tokensRouter.get("/refresh", verifyRefreshToken, async (req, res) => {
  try {
    // res.locals.user — это данные из самого JWT (снимок на момент выдачи
    // токена), монеты там могут быть устаревшими. Перечитываем актуального
    // пользователя из БД, чтобы после перезагрузки страницы не откатывались
    // монеты до значения на момент логина.
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
