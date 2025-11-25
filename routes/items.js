const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { readData, writeData } = require('../services/fileStore');
const { ItemModel } = require('../db/mongo');



async function syncToMongo(item) {
  if (!ItemModel || !process.env.MONGO_URI) return;
  try {
    await ItemModel.findOneAndUpdate({ id: item.id }, item, { upsert: true, new: true });
  } catch (err) {
    console.error('Error sincronizando a Mongo:', err.message);
  }
}


router.get('/', async (req, res) => {
  try {
    const data = await readData();
    res.json(data.items || []);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const data = await readData();
    const item = (data.items || []).find(i => i.id === req.params.id);
    if (!item) return res.status(404).json({ error: 'Item no encontrado' });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    if (!name) return res.status(400).json({ error: 'El campo name es requerido' });


    const data = await readData();
    const newItem = {
      id: uuidv4(),
      name,
      description: description || '',
      price: typeof price === 'number' ? price : 0
    };


    data.items = data.items || [];
    data.items.push(newItem);
    await writeData(data);


    syncToMongo(newItem);


    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.put('/:id', async (req, res) => {
  try {
    const { name, description, price } = req.body;
    const data = await readData();
    const idx = (data.items || []).findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item no encontrado' });


    const updated = { ...data.items[idx], name: name ?? data.items[idx].name, description: description ?? data.items[idx].description, price: typeof price === 'number' ? price : data.items[idx].price };
    data.items[idx] = updated;
    await writeData(data);


    syncToMongo(updated);


    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// DELETE /api/items/:id
router.delete('/:id', async (req, res) => {
  try {
    const data = await readData();
    const idx = (data.items || []).findIndex(i => i.id === req.params.id);
    if (idx === -1) return res.status(404).json({ error: 'Item no encontrado' });


    const [removed] = data.items.splice(idx, 1);
    await writeData(data);


    // Remove from Mongo if connected
    if (process.env.MONGO_URI && ItemModel) {
      try {
        await ItemModel.deleteOne({ id: removed.id });
      } catch (err) {
        console.error('Error eliminando de Mongo:', err.message);
      }
    }


    res.json({ ok: true, removed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;