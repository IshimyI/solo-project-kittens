const express = require("express");
const {
  User,
  Inventory,
  Shop,
  TypeOfCloth,
  Message,
} = require("../../db/models");
const router = express.Router();

router.get("/users", async (req, res) => {
  try {
    res.status(200).send(
      await User.findAll({
        attributes: ["id", "name", "email", "password", "coins"],
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get("/typeofcloth", async (req, res) => {
  try {
    res
      .status(200)
      .send(await TypeOfCloth.findAll({ attributes: ["id", "name"] }));
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get("/shop", async (req, res) => {
  try {
    const shop = await Shop.findAll({
      attributes: ["id", "name", "price", "path"],
      include: { model: TypeOfCloth, attributes: ["name"] },
    });
    res.status(200).send(shop);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get("/inventory", async (req, res) => {
  try {
    res.status(200).send(
      await Inventory.findAll({
        attributes: [],
        include: [
          { model: User, attributes: ["name"] },
          { model: Shop, attributes: ["name", "path"] },
        ],
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get("/message", async (req, res) => {
  try {
    res.status(200).send(await Message.findAll({ attributes: ["name"] }));
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
