"use strict";
const bcrypt = require("bcrypt");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert(
      "TypeOfCloths",
      [
        {
          name: "hat",
        },
        {
          name: "body",
        },
        {
          name: "coat",
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Shops",
      [
        {
          name: "Пусто",
          price: 0,
          path: "hat1",
          typeId: 1,
        },
        {
          name: "Смешная шапка вертолет",
          price: 1,
          path: "hat2",
          typeId: 1,
        },
        {
          name: "Цветочный венок",
          price: 3,
          path: "hat3",
          typeId: 1,
        },
        {
          name: "Деловой цилиндр",
          price: 5,
          path: "hat4",
          typeId: 1,
        },

        {
          name: "Голый котик?",
          price: 0,
          path: "body1",
          typeId: 2,
        },
        {
          name: "Неко Мерч",
          price: 1,
          path: "body2",
          typeId: 2,
        },
        {
          name: "Новомодная шубка",
          price: 3,
          path: "body3",
          typeId: 2,
        },
        {
          name: "Деловой смокинг",
          price: 5,
          path: "body4",
          typeId: 2,
        },
        {
          name: "Белая шерстка",
          price: 0,
          path: "coat1",
          typeId: 3,
        },
        {
          name: "Рыжая шерстка",
          price: 3,
          path: "coat2",
          typeId: 3,
        },
        {
          name: "Черная шерстка",
          price: 3,
          path: "coat3",
          typeId: 3,
        },
        {
          name: "Серая шерстка",
          price: 3,
          path: "coat4",
          typeId: 3,
        },
        {
          name: "Пятнистая шерстка",
          price: 7,
          path: "coat5",
          typeId: 3,
        },
        {
          name: "Демоническая шерстка",
          price: 10,
          path: "coat6",
          typeId: 3,
        },
        {
          name: "Рыцарский шлем",
          price: 5,
          path: "hat5",
          typeId: 1,
        },
        {
          name: "Рыцарские доспехи",
          price: 5,
          path: "body5",
          typeId: 2,
        },
        {
          name: "Золотая корона",
          price: 15,
          path: "hat6",
          typeId: 1,
        },
        {
          name: "Королевская мантия",
          price: 15,
          path: "body6",
          typeId: 2,
        },
        {
          name: "Демонические рожки",
          price: 7,
          path: "hat7",
          typeId: 1,
        },
        {
          name: "Демонические крылышки",
          price: 7,
          path: "body7",
          typeId: 2,
        },
        {
          name: "Ангельский нимб",
          price: 7,
          path: "hat8",
          typeId: 1,
        },
        {
          name: "Ангельские крылышки",
          price: 7,
          path: "body8",
          typeId: 2,
        },
        {
          name: "Курточка косплей",
          price: 10,
          path: "body9",
          typeId: 2,
        },
        {
          name: "Шапка косплей",
          price: 10,
          path: "hat9",
          typeId: 1,
        },
        {
          name: "Кигуруми низ",
          price: 10,
          path: "body10",
          typeId: 2,
        },
        {
          name: "Кигуруми верх",
          price: 10,
          path: "hat10",
          typeId: 1,
        },
        {
          name: "Вязаный свитер",
          price: 5,
          path: "body11",
          typeId: 2,
        },
        {
          name: "Вязаная шапка",
          price: 5,
          path: "hat11",
          typeId: 1,
        },
        {
          name: "Вязаный шарфик",
          price: 5,
          path: "body12",
          typeId: 2,
        },
        {
          name: "Крутые черные очки",
          price: 11,
          path: "hat12",
          typeId: 1,
        },
        {
          name: "Деловой монокль",
          price: 5,
          path: "hat13",
          typeId: 1,
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Users",
      [
        {
          name: "Админ",
          email: "1@1",
          password: await bcrypt.hash("1", 10),
          coins: 9999,
        },
        {
          name: "Про",
          email: "2@2",
          password: await bcrypt.hash("2", 10),
          coins: 100,
        },
        {
          name: "Нубик",
          email: "3@3",
          password: await bcrypt.hash("3", 10),
          coins: 0,
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "Inventories",
      [
        {
          userId: 1,
          itemId: 1,
        },
        {
          userId: 1,
          itemId: 5,
        },
        {
          userId: 1,
          itemId: 9,
        },
        {
          userId: 2,
          itemId: 1,
        },
        {
          userId: 2,
          itemId: 5,
        },
        {
          userId: 2,
          itemId: 9,
        },
        {
          userId: 3,
          itemId: 1,
        },
        {
          userId: 3,
          itemId: 5,
        },
        {
          userId: 3,
          itemId: 9,
        },
      ],
      {}
    );

    await queryInterface.bulkInsert(
      "User_selected_items",
      [
        {
          userId: 1,
          hatId: 1,
          bodyId: 5,
          coatId: 9,
        },
        {
          userId: 2,
          hatId: 1,
          bodyId: 5,
          coatId: 9,
        },
        {
          userId: 3,
          hatId: 1,
          bodyId: 5,
          coatId: 9,
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  },
};
