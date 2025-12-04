// routes/items.js
const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const { readData, writeData } = require('../services/fileStore');
const { ItemModel } = require('../db/mongo');
const {
  validateCreateItem,
  validateUpdateItem,
  validateIdParam,
  limitBodySize,
  sanitizeQueryParams
} = require('../middlewares/validationMiddleware');

// Función para sincronizar con MongoDB
async function syncToMongo(item) {
  if (!ItemModel || !process.env.MONGO_URI) return;
  try {
    await ItemModel.findOneAndUpdate(
      { id: item.id }, 
      item, 
      { upsert: true, new: true }
    );
  } catch (err) {
    console.error('Error sincronizando a Mongo:', err.message);
  }
}

// GET /api/items - Listar todos los items
router.get('/', sanitizeQueryParams, async (req, res) => {
  try {
    const data = await readData();
    res.json(data.items || []);
  } catch (err) {
    console.error('Error al obtener items:', err);
    res.status(500).json({ 
      error: 'Error al obtener los items',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// GET /api/items/:id - Obtener un item por ID
router.get('/:id', validateIdParam, async (req, res) => {
  try {
    const data = await readData();
    const item = (data.items || []).find(i => i.id === req.params.id);
    
    if (!item) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }
    
    res.json(item);
  } catch (err) {
    console.error('Error al obtener item:', err);
    res.status(500).json({ 
      error: 'Error al obtener el item',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// POST /api/items - Crear un nuevo item
router.post('/', limitBodySize, validateCreateItem, async (req, res) => {
  try {
    const { name, description, price } = req.body;

    const data = await readData();
    
    // Crear nuevo item con valores ya validados
    const newItem = {
      id: uuidv4(),
      name,
      description,
      price
    };

    // Asegurar que existe el array de items
    data.items = data.items || [];
    
    // Agregar el nuevo item
    data.items.push(newItem);
    
    // Guardar en archivo
    await writeData(data);

    // Sincronizar con MongoDB
    await syncToMongo(newItem);

    res.status(201).json(newItem);
  } catch (err) {
    console.error('Error al crear item:', err);
    res.status(500).json({ 
      error: 'Error al crear el item',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// PUT /api/items/:id - Actualizar un item existente
router.put('/:id', validateIdParam, limitBodySize, validateUpdateItem, async (req, res) => {
  try {
    const data = await readData();
    const idx = (data.items || []).findIndex(i => i.id === req.params.id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    // Actualizar solo los campos proporcionados
    const updated = {
      ...data.items[idx],
      ...req.body
    };

    data.items[idx] = updated;
    await writeData(data);

    // Sincronizar con MongoDB
    await syncToMongo(updated);

    res.json(updated);
  } catch (err) {
    console.error('Error al actualizar item:', err);
    res.status(500).json({ 
      error: 'Error al actualizar el item',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// DELETE /api/items/:id - Eliminar un item
router.delete('/:id', validateIdParam, async (req, res) => {
  try {
    const data = await readData();
    const idx = (data.items || []).findIndex(i => i.id === req.params.id);
    
    if (idx === -1) {
      return res.status(404).json({ error: 'Item no encontrado' });
    }

    const [removed] = data.items.splice(idx, 1);
    await writeData(data);

    // Eliminar de MongoDB si está conectado
    if (process.env.MONGO_URI && ItemModel) {
      try {
        await ItemModel.deleteOne({ id: removed.id });
      } catch (err) {
        console.error('Error eliminando de Mongo:', err.message);
      }
    }

    res.json({ ok: true, removed });
  } catch (err) {
    console.error('Error al eliminar item:', err);
    res.status(500).json({ 
      error: 'Error al eliminar el item',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

module.exports = router;