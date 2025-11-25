const express = require('express');
const dotenv = require('dotenv');
const itemsRouter = require('./routes/items');
const { connectMongo } = require('./db/mongo');


dotenv.config();


const app = express();
app.use(express.json());


app.use('/api/items', itemsRouter);


app.get('/', (req, res) => res.send({ ok: true, message: 'API funcionando' }));


const PORT = process.env.PORT || 3000;


async function start() {
  // Conexión con mongo db atlas
  if (process.env.MONGO_URI) {
    try {
      await connectMongo(process.env.MONGO_URI);
      console.log('Conectado a MongoDB Atlas');
    } catch (err) {
      console.error('Error conectando a MongoDB:', err.message);
    }
  } else {
    console.log('MONGO_URI no configurado, la API usará solo el archivo JSON local');
  }


  app.listen(PORT, () => console.log(`Servidor escuchando en http://localhost:${PORT}`));
}


start();