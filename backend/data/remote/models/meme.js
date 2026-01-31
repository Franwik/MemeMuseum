import { DataTypes } from "sequelize";

export function createMemeModel(database) {
  return database.define('meme', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    pathRelativo: {
      type: DataTypes.STRING,
      allowNull: false
    },
    formato_file: {
      type: DataTypes.STRING(10),
      allowNull: true // Es: 'image/png'
    },
    data_caricamento: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    id_caricatore: {
      type: DataTypes.INTEGER,
      references: { model: 'utente', key: 'id' }
    },
    titolo: {
      type: DataTypes.STRING(100),
      allowNull: false
    }
  }, {
    tableName: 'meme',
    timestamps: false
  });
}