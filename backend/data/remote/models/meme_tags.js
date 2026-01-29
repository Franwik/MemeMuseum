import { DataTypes } from "sequelize";

export function createMemeTagsModel(database) {
  return database.define('meme_tags', {
    id_meme: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'meme', key: 'id' }
    },
    id_tag: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: { model: 'tag', key: 'id' }
    }
  }, {
    tableName: 'meme_tags',
    timestamps: false
  });
}