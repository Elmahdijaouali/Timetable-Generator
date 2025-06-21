"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Classroom extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Classroom.init(
    {
      label: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Classroom",
      tableName: "classrooms",
    }
  );

  Classroom.associate = (models) => {
    Classroom.hasMany(models.Formateur, {
      foreignKey: "classroomId",
      as: "formateurs",
    });

    Classroom.hasMany(models.Session);
  };

  return Classroom;
};
