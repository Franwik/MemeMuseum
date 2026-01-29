import { DataTypes } from "sequelize";

export function createTagModel(database) {
  return database.define('tag', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    nome: {
      type: DataTypes.STRING(30),
      unique: true,
      allowNull: false
    }
  }, {
    tableName: 'tag',
    timestamps: false
  });
}