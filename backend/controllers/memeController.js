import { Meme, Tag, Utente, Voto, Commento } from '../data/remote/Database.js';
import { sequelize } from '../data/remote/Database.js';
import { Op, where } from "sequelize";

export const uploadMeme = async (req, res) => {
  try {

    const { tags, titolo, id_autore } = req.body;

    // Validazioni base
    if (!req.file) {
      return res.status(400).json({ error: 'Nessun file caricato' });
    }

    if (!id_autore) {
      return res.status(400).json({ error: 'Campo "id_autore" mancante' });
    }

    if (!titolo) {
      return res.status(400).json({ error: 'Campo "titolo" mancante' });
    }

    // Crea il meme con il path del file caricato
    const nuovoMeme = await Meme.create({
      pathRelativo: req.file.path,
      formato_file: req.file.mimetype,
      titolo: titolo,
      id_caricatore: id_autore
    });

    // Gestione tags: con form-data i campi arrivano sempre come stringa,
    // quindi se tags è una stringa JSON va parsata prima di iterare.
    let parsedTags = tags;
    if (typeof tags === 'string') {
      try {
        parsedTags = JSON.parse(tags);
      } catch {
        parsedTags = [];
      }
    }

    if (Array.isArray(parsedTags)) {
      for (const nomeTag of parsedTags) {
        const [tagInstance] = await Tag.findOrCreate({
          where: { nome: nomeTag }
        });
        await nuovoMeme.addTag(tagInstance);
      }
    }

    return res.status(201).json({
      message: 'Meme caricato con successo!',
      id: nuovoMeme.id,
      path: nuovoMeme.pathRelativo
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore nel caricamento del meme' });
  }
};

export const getDailyMeme = async (req, res) => {
  try {
    const meme = await Meme.findOne({
      include: [
        {
          model: Utente,
          as: 'autore',
          attributes: ['id', 'username']
        }
      ],
      where: sequelize.where(
        sequelize.fn('DATE', sequelize.col('data_caricamento')),
        Op.eq,
        sequelize.literal('CURRENT_DATE')
      ),
      // Ordina per score (upvotes - downvotes) usando le colonne precomputate dal trigger
      order: [[sequelize.literal('count_upvotes - count_downvotes'), 'DESC']],
    });

    if (!meme) {
      return res.status(404).json({ error: 'Nessun meme trovato' });
    }

    return res.status(200).json({
      id: meme.id,
      titolo: meme.titolo,
      formato_file: meme.formato_file,
      pathRelativo: meme.pathRelativo,
      autore: {
        id: meme.autore.id,
        username: meme.autore.username
      },
      upvotes: meme.count_upvotes,
      downvotes: meme.count_downvotes
    });

  } catch (error) {
    console.error('Errore getDailyMeme:', error);
    return res.status(500).json({ error: 'Errore nel recupero del meme del giorno' });
  }
};

export const getAllMemes = async (req, res) => {
  try {
    const memes = await Meme.findAll({ 
      include: [
        {
          model: Utente,
          as: 'autore',
          attributes: ['id', 'username']
        },
        { 
          model: Tag,
          as: 'tags',
          attributes: ['nome'],
          through: { attributes: [] }
        }
      ],
      order: [['data_caricamento', 'DESC']]
    });

    // Mappatura per uniformare la risposta a quella di searchMemes
    const formattedMemes = memes.map(meme => ({
      id: meme.id,
      titolo: meme.titolo,
      pathRelativo: meme.pathRelativo,
      formato_file: meme.formato_file,
      data_caricamento: meme.data_caricamento,
      autore: meme.autore ? {
        id: meme.autore.id,
        username: meme.autore.username
      } : { id: null, username: 'Anonimo' },
      upvotes: meme.count_upvotes || 0,
      downvotes: meme.count_downvotes || 0,
      tags: meme.tags ? meme.tags.map(t => t.nome) : []
    }));

    return res.status(200).json(formattedMemes);
  } catch (error) {
    console.error('Errore getAllMemes:', error);
    return res.status(500).json({ error: 'Errore nel recupero dei meme' });
  }
};

export const searchMemes = async (req, res) => {
  try {
    const { q } = req.query; // Rimosse page e size
    
    if (!q) {
      return res.status(400).json({ error: 'Stringa di ricerca mancante' });
    }

    // Usiamo findAll invece di findAndCountAll
    const rows = await Meme.findAll({
      where: {
        [Op.or]: [
          { titolo: { [Op.iLike]: `%${q}%` } },
          { '$autore.username$': { [Op.iLike]: `%${q}%` } },
          { '$tags.nome$': { [Op.iLike]: `%${q}%` } }
        ]
      },
      include: [
        {
          model: Utente,
          as: 'autore',
          attributes: ['id', 'username']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['nome'],
          through: { attributes: [] }
        }
      ],
      order: [['data_caricamento', 'DESC']] // Default decrescente
    });

    const formattedMemes = rows.map(meme => ({
      id: meme.id,
      titolo: meme.titolo,
      pathRelativo: meme.pathRelativo,
      formato_file: meme.formato_file,
      data_caricamento: meme.data_caricamento, // Necessario per il sort frontend
      autore: meme.autore ? {
        id: meme.autore.id,
        username: meme.autore.username
      } : { id: null, username: 'Anonimo' },
      upvotes: meme.count_upvotes,
      downvotes: meme.count_downvotes,
      tags: meme.tags ? meme.tags.map(t => t.nome) : []
    }));

    // Restituiamo direttamente l'array
    return res.status(200).json(formattedMemes);

  } catch (error) {
    console.error('--- ERRORE RICERCA ---', error);
    return res.status(500).json({ error: 'Errore durante la ricerca' });
  }
};

export const voteMeme = async (req, res) => {
  try {
    const { id_utente, id_meme, tipo_voto } = req.body;

    // Validazioni
    if (!id_utente || !id_meme || tipo_voto === undefined) {
      return res.status(400).json({ error: 'Campi "id_utente", "id_meme" e "tipo_voto" obbligatori' });
    }

    if (tipo_voto !== 1 && tipo_voto !== -1) {
      return res.status(400).json({ error: 'Il "tipo_voto" deve essere 1 (upvote) o -1 (downvote)' });
    }

    const meme = await Meme.findByPk(id_meme);
    if (!meme) {
      return res.status(404).json({ error: 'Meme non trovato' });
    }

    const votoEsistente = await Voto.findOne({
      where: { id_utente, id_meme }
    });

    if (votoEsistente) {
      // Voto già presente dello stesso tipo: niente da fare
      if (votoEsistente.tipo_voto === tipo_voto) {
        return res.status(200).json({
          message: 'Voto già presente, nessuna modifica',
          tipo_voto: votoEsistente.tipo_voto
        });
      }

      // Tipo diverso: aggiorna il voto esistente
      await votoEsistente.update({ tipo_voto });

      return res.status(200).json({
        message: 'Voto aggiornato',
        tipo_voto: votoEsistente.tipo_voto
      });
    }

    // Voto non esiste: crealo
    await Voto.create({ id_utente, id_meme, tipo_voto });

    return res.status(201).json({
      message: 'Voto registrato',
      tipo_voto
    });

  } catch (error) {
    console.error('Errore voteMeme:', error);
    return res.status(500).json({ error: 'Errore durante il voto' });
  }
};

export const getMemeById = async (req, res) => {
  try {
    const { id } = req.params;

    const meme = await Meme.findByPk(id, {
      include: [
        {
          model: Utente,
          as: 'autore',
          attributes: ['id', 'username']
        },
        {
          model: Tag,
          as: 'tags',
          attributes: ['nome'],
          through: { attributes: [] }
        }
      ]
    });

    if (!meme) {
      return res.status(404).json({ error: 'Meme non trovato' });
    }

    // Formattazione coerente con getDailyMeme e searchMemes
    return res.status(200).json({
      id: meme.id,
      titolo: meme.titolo,
      pathRelativo: meme.pathRelativo,
      formato_file: meme.formato_file,
      data_caricamento: meme.data_caricamento,
      autore: meme.autore ? {
        id: meme.autore.id,
        username: meme.autore.username
      } : { id: null, username: 'Anonimo' },
      upvotes: meme.count_upvotes,
      downvotes: meme.count_downvotes,
      tags: meme.tags ? meme.tags.map(t => t.nome) : []
    });

  } catch (error) {
    console.error('Errore getMemeById:', error);
    return res.status(500).json({ error: 'Errore nel recupero del meme' });
  }
};

export const commentMeme = async (req, res) => {
  try {
    const { id_utente, id_meme, testo } = req.body;

    // Validazioni
    if (!id_utente || !id_meme || !testo) {
      return res.status(400).json({ error: 'Campi "id_utente", "id_meme" e "testo" obbligatori' });
    }

    // Verifica che il testo non sia vuoto dopo il trim
    if (!testo.trim()) {
      return res.status(400).json({ error: 'Il commento non può essere vuoto' });
    }

    const meme = await Meme.findByPk(id_meme);

    if (!meme) {
      return res.status(404).json({ error: 'Meme non trovato' });
    }

    // Creazione del commento
    const commento = await Commento.create({
      id_utente,
      id_meme,
      testo: testo.trim(),
      data_creazione: new Date()
    });

    // Recupera il commento con i dati dell'utente
    const commentoCompleto = await Commento.findByPk(commento.id, {
      include: [
        {
          model: Utente,
          as: 'autore_commento',
          attributes: ['id', 'username']
        }
      ]
    });

    return res.status(201).json({
      message: 'Commento aggiunto con successo',
      commento: commentoCompleto
    });

  } catch (error) {
    console.error('Errore commentMeme:', error);
    return res.status(500).json({ error: 'Errore durante l\'aggiunta del commento' });
  }
};

export const getMemeComments = async (req, res) => {
  try {
    const { id_meme } = req.params;

    if (!id_meme) {
      return res.status(400).json({ error: 'Parametro "id_meme" obbligatorio' });
    }

    const commenti = await Commento.findAll({
      where: { id_meme },
      include: [
        {
          model: Utente,
          as: 'autore_commento',
          attributes: ['id', 'username']
        }
      ],
      order: [['data_creazione', 'DESC']] // I più recenti per primi
    });

    return res.status(200).json(commenti);

  } catch (error) {
    console.error('Errore getMemeComments:', error);
    return res.status(500).json({ error: 'Errore nel recupero dei commenti' });
  }
};