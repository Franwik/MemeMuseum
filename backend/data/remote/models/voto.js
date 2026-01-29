import { DataTypes } from "sequelize";

export function createVotoModel(database) {
  return database.define('voto', {
    id_utente: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'utente', key: 'id' }
    },
    id_meme: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'meme', key: 'id' }
    },
    tipo_voto: {
      type: DataTypes.SMALLINT,
      allowNull: false,
      validate: { isIn: [[1, -1]] } // 1 Up, -1 Down
    }
  }, {
    tableName: 'voto',
    timestamps: false
  });
}