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

// Conexión a MongoDB o modo en memoria si no hay MONGO_URL
let useMemoryStore = false;
const mongoUrl = process.env.MONGO_URL;
if (mongoUrl) {
  mongoose
    .connect(mongoUrl)
    .then(() => console.log("✔ Conectado a MongoDB"))
    .catch((err) => {
      console.error("Error al conectar con MongoDB:", err);
      console.warn("⚠ Iniciando en modo memoria para /api/productos");
      useMemoryStore = true;
    });
} else {
  console.warn("⚠ MONGO_URL no definida. Usando modo memoria para /api/productos");
  useMemoryStore = true;
}

// Esquema y modelo de Producto
const productoSchema = new mongoose.Schema({
  name: String,
  price: Number,
  category: String,
  image: String // nombre archivo imagen, ej: "remeraroja.png"
});
const Producto = mongoose.models.Producto || mongoose.model("Producto", productoSchema, "products");

// Datos en memoria (fallback)
let memoryProducts = [
  { _id: "1", name: "Remera Amarilla", price: 15999, category: "Remeras", image: "remeraamarilla.png" },
  { _id: "2", name: "Remera Verde", price: 15999, category: "Remeras", image: "remeraverde.png" },
  { _id: "3", name: "Pantalón Azul", price: 24999, category: "Pantalones", image: "pantalonazul.png" },
  { _id: "4", name: "Pantalón Cargo", price: 29999, category: "Pantalones", image: "pantaloncargo.png" },
  { _id: "5", name: "Zapatilla Urban", price: 45999, category: "Calzado", image: "zapatilla1.png" },
  { _id: "6", name: "Bota Cuero", price: 79999, category: "Calzado", image: "bota1.png" }
];
let memorySeq = memoryProducts.length + 1;

// Obtener todos los productos
app.get("/api/productos", async (req, res) => {
  if (useMemoryStore) {
    return res.json(memoryProducts);
  }
  try {
    const productos = await Producto.find();
    res.json(productos);
  } catch (err) {
    console.error("/api/productos error:", err);
    res.status(500).json({ error: "Error al obtener productos" });
  }
});

// Agregar producto
app.post("/api/productos", async (req, res) => {
  if (useMemoryStore) {
    const doc = { _id: String(memorySeq++), ...req.body };
    memoryProducts.push(doc);
    return res.status(201).json(doc);
  }
  try {
    const nuevoProducto = new Producto(req.body);
    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (err) {
    console.error("POST /api/productos error:", err);
    res.status(400).json({ error: "Error al agregar producto" });
  }
});

app.get("/", (req, res) => {
  res.send("Backend conectado correctamente");
});

app.listen(PORT, () => {
  console.log(`▶ Servidor escuchando en http://localhost:${PORT}`);
});

