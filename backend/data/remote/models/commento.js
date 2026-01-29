import { DataTypes } from "sequelize";

export function createCommentoModel(database) {
  return database.define('commento', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    testo: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    data_creazione: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    id_utente: {
      type: DataTypes.INTEGER,
      references: { model: 'utente', key: 'id' }
    },
    id_meme: {
      type: DataTypes.INTEGER,
      references: { model: 'meme', key: 'id' }
    }
  }, {
    tableName: 'commento',
    timestamps: false
  });
}