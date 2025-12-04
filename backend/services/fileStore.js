// services/fileStore.js
const fs = require('fs').promises;
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data.json');

async function readData() {
  try {
    const content = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    if (err.code === 'ENOENT') {
      // Si el archivo no existe, crea uno por defecto
      const defaultData = { items: [] };
      await writeData(defaultData);
      return defaultData;
    }
    throw err;
  }
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = { readData, writeData };