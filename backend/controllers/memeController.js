import { Meme, Tag, Utente } from '../data/remote/Database.js';

export const uploadMeme = async (req, res) => {
  try {
    const {
      immagine,
      formato_file,
      tags,
      titolo,
      id_autore
    } = req.body;

    // Validazioni base
    if (!immagine) {
      return res.status(400).json({ error: 'Campo "immagine" mancante' });
    }

    if (!id_autore) {
      return res.status(400).json({ error: 'Campo "id_autore" mancante' });
    }

    if (!titolo) {
      return res.status(400).json({ error: 'Campo "titolo" mancante' });
    }

    // Rimuove il prefisso data:image/...;base64,
    const base64Data = immagine.replace(/^data:image\/\w+;base64,/, '');

    let bufferImmagine;
    try {
      bufferImmagine = Buffer.from(base64Data, 'base64');
    } catch (err) {
      return res.status(400).json({ error: 'Immagine Base64 non valida' });
    }

    const nuovoMeme = await Meme.create({
      immagine: bufferImmagine,
      formato_file: formato_file || 'image/jpeg',
      titolo: titolo,
      id_caricatore: id_autore
    });

    // Gestione tags
    if (Array.isArray(tags)) {
      for (const nomeTag of tags) {
        const [tagInstance] = await Tag.findOrCreate({
          where: { nome: nomeTag }
        });
        await nuovoMeme.addTag(tagInstance);
      }
    }

    return res.status(201).json({
      message: 'Meme caricato con successo!',
      id: nuovoMeme.id
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore nel caricamento del meme' });
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

    const risultato = memes.map(meme => ({
      id: meme.id,
      titolo: meme.titolo,
      formato_file: meme.formato_file,
      autore: {
        id: meme.autore.id,
        username: meme.autore.username
      },
      tags: meme.tags.map(tag => tag.nome),
      immagine: `data:${meme.formato_file};base64,${meme.immagine.toString('base64')}`,
      data_caricamento: meme.data_caricamento
    }));

    return res.status(200).json(risultato);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Errore nel recupero dei meme' });
  }
};
