"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("User_selected_items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Users",
          key: "id",
        },
      },
      hatId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Shops",
          key: "id",
        },
      },
      bodyId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Shops",
          key: "id",
        },
      },
      coatId: {
        type: Sequelize.INTEGER,
        references: {
          model: "Shops",
          key: "id",
        },
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("User_selected_items");
  },
};
