const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Servir archivos estáticos (imágenes) desde la carpeta 'public/img'
// Usar path.resolve para ruta absoluta
console.log('Ruta pública imágenes:', path.join(__dirname, 'public', 'img'));

app.use('/img', express.static(path.resolve(__dirname, 'public', 'img')));

// Conexión a MongoDB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✔ Conectado a MongoDB"))
  .catch((err) => console.error("Error al conectar con MongoDB:", err));

// Esquema y modelo de Producto
const productoSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String // nombre archivo imagen, ej: "remeraroja.png"
});
const Producto = mongoose.model("Producto", productoSchema, "products");

// Obtener todos los productos
app.get("/api/productos", async (req, res) => {
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Agregar producto
app.post("/api/productos", async (req, res) => {
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    res.status(400).json({ error: "Error al agregar producto" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend conectado correctamente");
});

app.listen(PORT, () => {
  console.log(`▶ Servidor escuchando en http://localhost:${PORT}`);
});

