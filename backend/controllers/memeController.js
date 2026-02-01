import { Meme, Tag, Utente } from '../data/remote/Database.js';
import { sequelize } from '../data/remote/Database.js';
import { Op } from "sequelize";

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
    // Prima ottieni tutti i meme con i loro voti
    const memes = await Meme.findAll({
      include: [
        {
          model: Utente,
          as: 'autore',
          attributes: ['id', 'username']
        }
      ],
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM voto 
              WHERE voto.id_meme = meme.id 
              AND voto.tipo_voto = 1
            )`),
            'upvotes'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM voto 
              WHERE voto.id_meme = meme.id 
              AND voto.tipo_voto = -1
            )`),
            'downvotes'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) 
              FROM voto 
              WHERE voto.id_meme = meme.id 
              AND voto.tipo_voto = 1
            ) - (
              SELECT COUNT(*) 
              FROM voto 
              WHERE voto.id_meme = meme.id 
              AND voto.tipo_voto = -1
            )`),
            'score'
          ]
        ]
      },
      order: [[sequelize.literal('score'), 'DESC']],
      limit: 1
    });

    if (!memes || memes.length === 0) {
      return res.status(404).json({ error: 'Nessun meme trovato' });
    }

    const meme = memes[0];

    return res.status(200).json({
      id: meme.id,
      titolo: meme.titolo,
      formato_file: meme.formato_file,
      pathRelativo: meme.pathRelativo,
      autore: {
        id: meme.autore.id,
        username: meme.autore.username
      },
      upvotes: parseInt(meme.get('upvotes')) || 0,
      downvotes: parseInt(meme.get('downvotes')) || 0
    });

  } catch (error) {
    console.error('Errore getDailyMeme:', error);
    return res.status(500).json({ error: 'Errore nel recupero del meme del giorno' });
  }
};

export const searchMemes = async (req, res) => {
  try {
    const { q, page = 1, size = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Stringa di ricerca mancante' });
    }

    const limit = parseInt(size);
    const offset = (parseInt(page) - 1) * limit;

    const { count, rows } = await Meme.findAndCountAll({

      subQuery: false,
      
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
      attributes: {
        include: [
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM voto 
              WHERE voto.id_meme = meme.id AND voto.tipo_voto = 1
            )`),
            'upvotes'
          ],
          [
            sequelize.literal(`(
              SELECT COUNT(*) FROM voto 
              WHERE voto.id_meme = meme.id AND voto.tipo_voto = -1
            )`),
            'downvotes'
          ]
        ]
      },
      distinct: true, 
      limit: limit,
      offset: offset,
      order: [['data_caricamento', 'DESC']]
    });

    const formattedMemes = rows.map(meme => ({
      id: meme.id,
      titolo: meme.titolo,
      pathRelativo: meme.pathRelativo,
      formato_file: meme.formato_file,
      autore: meme.autore ? {
        id: meme.autore.id,
        username: meme.autore.username
      } : { id: null, username: 'Anonimo' },
      upvotes: parseInt(meme.get('upvotes')) || 0,
      downvotes: parseInt(meme.get('downvotes')) || 0,
      tags: meme.tags ? meme.tags.map(t => t.nome) : []
    }));

    return res.status(200).json({
      totalItems: count,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page),
      memes: formattedMemes
    });

  } catch (error) {
    console.error('--- ERRORE SQL DETTAGLIATO ---', error);
    return res.status(500).json({ 
      error: 'Errore durante la ricerca',
      details: error.message 
    });
  }
};