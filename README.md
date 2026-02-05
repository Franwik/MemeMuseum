
# Museo dei Meme

Un'applicazione web per condividere ed esplorare meme con backend Express e frontend Angular.

## Prerequisiti

- Node.js e npm
- Docker e Docker Compose

## Istruzioni di Configurazione

### 1. Installare le Dipendenze

Navigare nella cartella backend e installare le dipendenze:
```bash
cd backend
npm install
```

Fare lo stesso per il frontend:
```bash
cd ../frontend
npm install
```

### 2. Configurare le Variabili di Ambiente


Rinominare il file `.env.example` in `.env` nella directory backend:
```bash
cd backend
mv .env.example .env
```

Modificare il file `.env` e aggiungere un JWT secret generato casualmente:
```
JWT_SECRET=YOUR_JWT_SECRET
```

Per generare una chiave sicura, eseguire in Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copiare l'output e inserirlo come valore di `JWT_SECRET` nel file `.env`.


### 3. Eseguire l'Applicazione

Dalla root del progetto, avviare l'applicazione usando Docker Compose:
```bash
docker compose up --build
```

### 4. Accedere all'Applicazione

Aprire il browser e navigare a:
```
http://localhost:4200
```

## Architettura

- **Backend**: API REST Express.js
- **Frontend**: Applicazione single-page Angular
- **Containerizzazione**: Docker Compose per l'orchestrazione

