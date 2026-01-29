import { Sequelize } from "sequelize";
import { createCommentoModel } from  "./models/commento.js"
import { createMemeTagsModel } from  "./models/meme_tags.js"
import { createMemeModel } from  "./models/meme.js"
import { createTagModel } from  "./models/tag.js"
import { createUtenteModel } from  "./models/utente.js"
import { createVotoModel } from  "./models/voto.js"

// Carica la stringa di connessione dall'ambiente (Docker)
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://user:password@database:5432/mememuseum";

const sequelize = new Sequelize(DATABASE_URL, {
  dialect: "postgres",
  logging: false, // Disattiva i log SQL in console per pulizia
});

// 1. Inizializzazione Modelli
const Utente = createUtenteModel(sequelize);
const Meme = createMemeModel(sequelize);
const Tag = createTagModel(sequelize);
const MemeTags = createMemeTagsModel(sequelize);
const Voto = createVotoModel(sequelize);
const Commento = createCommentoModel(sequelize);

// 2. Definizione Associazioni (JOIN)

// Relazione Molti-a-Molti: Meme <-> Tag
Meme.belongsToMany(Tag, { through: MemeTags, foreignKey: "id_meme", otherKey: "id_tag" });
Tag.belongsToMany(Meme, { through: MemeTags, foreignKey: "id_tag", otherKey: "id_meme" });

// Relazione Utente -> Meme (Chi ha caricato cosa)
Utente.hasMany(Meme, { foreignKey: "id_caricatore" });
Meme.belongsTo(Utente, { foreignKey: "id_caricatore", as: "autore" });

// Relazione Meme -> Commenti
Meme.hasMany(Commento, { foreignKey: "id_meme", onDelete: "CASCADE" });
Commento.belongsTo(Meme, { foreignKey: "id_meme" });

// Relazione Utente -> Commenti
Utente.hasMany(Commento, { foreignKey: "id_utente" });
Commento.belongsTo(Utente, { foreignKey: "id_utente", as: "autore_commento" });

// Relazione Voti (Molti-a-Molti "mascherata" o Uno-a-Molti verso Voto)
Meme.hasMany(Voto, { foreignKey: "id_meme", onDelete: "CASCADE" });
Voto.belongsTo(Meme, { foreignKey: "id_meme" });
Utente.hasMany(Voto, { foreignKey: "id_utente" });
Voto.belongsTo(Utente, { foreignKey: "id_utente" });

// Funzione per sincronizzare e testare la connessione
export const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Connessione al database stabilita con successo.");
    
    // NOTA: In produzione non usare { alter: true } o { force: true }
    // Qui sincronizza i modelli con le tabelle esistenti
    await sequelize.sync({ alter: false }); 
    console.log("✅ Modelli Sequelize sincronizzati.");
  } catch (error) {
    console.error("❌ Impossibile connettersi al database:", error);
    process.exit(1);
  }
};

export { sequelize, Utente, Meme, Tag, MemeTags, Voto, Commento };