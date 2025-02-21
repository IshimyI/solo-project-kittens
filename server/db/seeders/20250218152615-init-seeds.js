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
          price: 5,
          path: "coat3",
          typeId: 3,
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
