// db/mongo.js
const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  description: String,
  price: Number
}, { timestamps: true });

const ItemModel = mongoose.models.Item || mongoose.model('Item', itemSchema);

async function connectMongo(uri) {
  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
}

module.exports = { connectMongo, ItemModel };