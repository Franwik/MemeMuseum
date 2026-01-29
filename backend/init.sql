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
    immagine BYTEA NOT NULL, -- Contenuto binario del meme
    formato_file VARCHAR(10), -- Es: 'image/png' o 'image/jpeg'
    data_caricamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    id_caricatore INTEGER REFERENCES utente(id) ON DELETE SET NULL,
    titolo VARCHAR(100) NOT NULL
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