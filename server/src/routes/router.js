const express = require("express");
const {
  User,
  Inventory,
  Shop,
  TypeOfCloth,
  Message,
  User_selected_items,
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
    const userId = req.query.userId;
    const shop = await Shop.findAll({
      attributes: ["id", "name", "price", "path"],
      include: { model: TypeOfCloth, attributes: ["name"] },
    });

    if (userId) {
      const inventory = await Inventory.findAll({
        where: { userId },
        attributes: ["itemId"],
      });
      const purchasedItemIds = inventory.map((item) => item.itemId);

      const filteredShop = shop.filter(
        (product) => !purchasedItemIds.includes(product.id)
      );
      return res.status(200).send(filteredShop);
    }

    res.status(200).send(shop);
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
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "userId is required" });
  }

  try {
    const selectedItems = await User_selected_items.findOne({
      where: { userId },
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
  const { userId, selectedItems } = req.body;

  if (!userId || !selectedItems) {
    return res
      .status(400)
      .json({ message: "userId and selectedItems are required" });
  }

  try {
    const selectedItemsRecord = await User_selected_items.findOne({
      where: { userId },
    });

    if (!selectedItemsRecord) {
      return res.status(404).json({ message: "Selected items not found" });
    }

    console.log("Полученные данные:", { userId, selectedItems });

    await selectedItemsRecord.update({
      hatId: selectedItems.hat,
      bodyId: selectedItems.body,
      coatId: selectedItems.coat,
    });

    console.log("Обновленная запись:", selectedItemsRecord);

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

router.post("/inventory/add", async (req, res) => {
  const { userId, itemId } = req.body;

  if (!userId || !itemId) {
    return res.status(400).json({ error: "userId и itemId обязательны" });
  }
  try {
    const [inventoryEntry, created] = await Inventory.findOrCreate({
      where: { userId, itemId },
      defaults: { userId, itemId },
    });

    if (!created) {
      return res.status(409).json({ message: "Предмет уже в инвентаре" });
    }

    res.json({ message: "Предмет добавлен в инвентарь", inventoryEntry });
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
  const { userId } = req.body;

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  user.coins += 1;
  await user.save();

  res.json({ coins: user.coins });
});

router.post("/coins/set", async (req, res) => {
  const { userId, newCoins } = req.body;

  const user = await User.findByPk(userId);
  if (!user) return res.status(404).json({ message: "Пользователь не найден" });

  user.coins = newCoins;
  await user.save();

  res.json({ coins: user.coins });
});

module.exports = router;
