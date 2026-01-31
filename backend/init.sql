-- Estensione opzionale per gestire meglio i timestamp
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

---
-- TABELLA UTENTE
---
CREATE TABLE utente (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    data_registrazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

---
-- TABELLA MEME
---
CREATE TABLE meme (
    id SERIAL PRIMARY KEY,
    pathRelativo VARCHAR(255) NOT NULL,
    formato_file VARCHAR(10), -- Es: 'image/png' o 'image/jpeg'
    data_caricamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_caricatore INTEGER REFERENCES utente(id) ON DELETE SET NULL,
    titolo VARCHAR(100) NOT NULL,
    count_upvotes INTEGER DEFAULT 0,
    count_downvotes INTEGER DEFAULT 0
);

---
-- TABELLA TAG
---
CREATE TABLE tag (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(30) UNIQUE NOT NULL
);

-- Tabella di join tra Meme e Tag (Relazione Molti-a-Molti)
CREATE TABLE meme_tags (
    id_meme INTEGER REFERENCES meme(id) ON DELETE CASCADE,
    id_tag INTEGER REFERENCES tag(id) ON DELETE CASCADE,
    PRIMARY KEY (id_meme, id_tag)
);

---
-- TABELLA VOTO
---
CREATE TABLE voto (
    id_utente INTEGER REFERENCES utente(id) ON DELETE CASCADE,
    id_meme INTEGER REFERENCES meme(id) ON DELETE CASCADE,
    tipo_voto SMALLINT CHECK (tipo_voto IN (1, -1)), -- 1 per Upvote, -1 per Downvote
    PRIMARY KEY (id_utente, id_meme)
);

---
-- TABELLA COMMENTO
---
CREATE TABLE commento (
    id SERIAL PRIMARY KEY,
    testo TEXT NOT NULL,
    data_creazione TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_utente INTEGER REFERENCES utente(id) ON DELETE CASCADE,
    id_meme INTEGER REFERENCES meme(id) ON DELETE CASCADE
);

---
-- INDICI PER OTTIMIZZARE LE RICERCHE (Paginazione e Filtri)
---
CREATE INDEX idx_meme_data ON meme(data_caricamento DESC);
CREATE INDEX idx_tag_nome ON tag(nome);


-- Funzione che aggiorna i contatori nel meme quando cambia la tabella voto
CREATE OR REPLACE FUNCTION update_meme_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        IF (NEW.tipo_voto = 1) THEN
            UPDATE meme SET count_upvotes = count_upvotes + 1 WHERE id = NEW.id_meme;
        ELSE
            UPDATE meme SET count_downvotes = count_downvotes + 1 WHERE id = NEW.id_meme;
        END IF;
    ELSIF (TG_OP = 'DELETE') THEN
        IF (OLD.tipo_voto = 1) THEN
            UPDATE meme SET count_upvotes = count_upvotes - 1 WHERE id = OLD.id_meme;
        ELSE
            UPDATE meme SET count_downvotes = count_downvotes - 1 WHERE id = OLD.id_meme;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Applica il trigger alla tabella voto
CREATE TRIGGER trg_update_meme_votes
AFTER INSERT OR DELETE ON voto
FOR EACH ROW EXECUTE FUNCTION update_meme_vote_counts();