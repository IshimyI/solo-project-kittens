const express = require("express");
const {
  sequelize,
  User,
  Inventory,
  Shop,
  TypeOfCloth,
  Message,
  User_selected_items,
} = require("../../db/models");
const router = express.Router();

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

    const inventory = await Inventory.findAll({
      where: { userId: req.userId },
      attributes: ["itemId"],
    });
    const purchasedItemIds = inventory.map((item) => item.itemId);

    const filteredShop = shop.filter(
      (product) => !purchasedItemIds.includes(product.id)
    );
    res.status(200).send(filteredShop);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get("/shopbypk", async (req, res) => {
  const id = req.query.id;
  try {
    const shop = await Shop.findByPk(id);
    res.status(200).json(shop);
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get("/inventory", async (req, res) => {
  try {
    res.status(200).send(
      await Inventory.findAll({
        where: { userId: req.userId },
        attributes: [],
        include: [
          { model: User },
          { model: Shop, include: [{ model: TypeOfCloth }] },
        ],
      })
    );
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.get("/user-selected-items", async (req, res) => {
  try {
    const selectedItems = await User_selected_items.findOne({
      where: { userId: req.userId },
    });

    if (!selectedItems) {
      return res.status(404).json({ message: "Selected items not found" });
    }

    res.json({
      hat: selectedItems.hatId,
      body: selectedItems.bodyId,
      coat: selectedItems.coatId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.put("/user-selected-items", async (req, res) => {
  const { selectedItems } = req.body;

  if (!selectedItems) {
    return res.status(400).json({ message: "selectedItems is required" });
  }

  try {
    const selectedItemsRecord = await User_selected_items.findOne({
      where: { userId: req.userId },
    });

    if (!selectedItemsRecord) {
      return res.status(404).json({ message: "Selected items not found" });
    }

    await selectedItemsRecord.update({
      hatId: selectedItems.hat,
      bodyId: selectedItems.body,
      coatId: selectedItems.coat,
    });

    res.json({
      hat: selectedItemsRecord.hatId,
      body: selectedItemsRecord.bodyId,
      coat: selectedItemsRecord.coatId,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

// Atomic purchase: validates the price server-side (never trusts the
// client), and deducts coins + grants the item in one transaction so a
// crash or race between two purchases can't leave coins deducted with no
// item granted, or an item granted for free.
router.post("/shop/buy", async (req, res) => {
  const { itemId } = req.body;
  if (!itemId) {
    return res.status(400).json({ message: "itemId is required" });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const user = await User.findByPk(req.userId, {
        transaction: t,
        lock: t.LOCK.UPDATE,
      });
      if (!user) {
        const err = new Error("User not found");
        err.status = 404;
        throw err;
      }

      const item = await Shop.findByPk(itemId, { transaction: t });
      if (!item) {
        const err = new Error("Item not found");
        err.status = 404;
        throw err;
      }

      const existing = await Inventory.findOne({
        where: { userId: user.id, itemId: item.id },
        transaction: t,
      });
      if (existing) {
        const err = new Error("Item already owned");
        err.status = 409;
        throw err;
      }

      if (user.coins < item.price) {
        const err = new Error("Недостаточно монет!");
        err.status = 402;
        throw err;
      }

      user.coins -= item.price;
      await user.save({ transaction: t });
      await Inventory.create(
        { userId: user.id, itemId: item.id },
        { transaction: t }
      );

      return { coins: user.coins };
    });

    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(error.status || 500).json({ message: error.message });
  }
});

router.get("/message", async (req, res) => {
  try {
    const messages = await Message.findAll({
      attributes: ["name"],
      order: [["createdAt", "DESC"]],
      limit: 50,
    });
    res.status(200).send(messages.reverse());
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

router.post("/message", async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === "") {
    return res.status(400).send({ error: "Сообщение не может быть пустым" });
  }
  try {
    await Message.create({ name });
    res.status(200).send({ message: "Сообщение добавлено" });
  } catch (error) {
    console.error("Ошибка при добавлении сообщения:", error);
    res.status(500).send(error.message);
  }
});

router.post("/coins/increase", async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user)
      return res.status(404).json({ message: "Пользователь не найден" });

    user.coins += 1;
    await user.save();

    res.json({ coins: user.coins });
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
});

module.exports = router;
