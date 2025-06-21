"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("FormateurTimetables", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      formateurId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "formateurs",
          key: "id",
        },
      },
      timeshot: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      day: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      year: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });

    await queryInterface.addIndex('FormateurTimetables',["formateurId", "day", "year"] ,  {
      unique: true,
      // fields: ["formateurId", "day", "year"],
      name: "unique_formateurId_and_day_and_year",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("FormateurTimetables");
  },
};
