const express = require("express");
const { User, Inventory, User_selected_items, sequelize } = require("../../db/models");
const bcrypt = require("bcrypt");
const cookieConfig = require("../configs/cookieConfig");
const jwt = require("jsonwebtoken");
const generateTokens = require("../utils/generateTokens");

const authRouter = express.Router();

authRouter.post("/signup", async (req, res) => {
  try {
    const { email, name, password } = req.body;
    if (!email || !name || !password) return res.sendStatus(401);

    const hashpass = await bcrypt.hash(password, 10);

    const user = await sequelize.transaction(async (t) => {
      const [newUser, created] = await User.findOrCreate({
        where: { email },
        defaults: {
          name,
          password: hashpass,
          coins: 0,
        },
        transaction: t,
      });

      if (!created) {
        const err = new Error("user_exists");
        err.status = 402;
        throw err;
      }

      const plainUser = newUser.get();
      delete plainUser.password;

      await Inventory.bulkCreate(
        [
          { userId: plainUser.id, itemId: 1 },
          { userId: plainUser.id, itemId: 5 },
          { userId: plainUser.id, itemId: 9 },
        ],
        { transaction: t }
      );

      await User_selected_items.create(
        {
          userId: plainUser.id,
          hatId: 1,
          bodyId: 5,
          coatId: 9,
        },
        { transaction: t }
      );

      return plainUser;
    });

    const { accessToken, refreshToken } = generateTokens({ user });
    res
      .cookie("refreshToken", refreshToken, cookieConfig)
      .json({ accessToken, user });
  } catch (error) {
    if (error.status === 402) return res.sendStatus(402);
    console.error(error);
    res.sendStatus(500);
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.sendStatus(400);
    const foundUser = await User.findOne({ where: { email } });
    if (!foundUser) return res.sendStatus(400);

    const isValid = await bcrypt.compare(password, foundUser.password);
    if (!isValid) return res.sendStatus(400);

    const user = foundUser.get();
    delete user.password;
    const { accessToken, refreshToken } = generateTokens({ user });

    res
      .status(200)
      .cookie("refreshToken", refreshToken, cookieConfig)
      .json({ accessToken, user });
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

authRouter.post("/logout", async (req, res) => {
  try {
    res.clearCookie("refreshToken").sendStatus(200);
  } catch (error) {
    console.error(error);
    res.sendStatus(500);
  }
});

module.exports = authRouter;
