const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();
const mercadopago = require("mercadopago");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

// Mercado Pago config
if (!process.env.MP_ACCESS_TOKEN) {
  console.warn("⚠ MP_ACCESS_TOKEN no está definido. Las rutas de pago responderán 500.");
}
mercadopago.configure({ access_token: process.env.MP_ACCESS_TOKEN || "" });

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

// ==== Pagos: crear preferencia de Mercado Pago ====
app.post("/api/payments/create-preference", async (req, res) => {
  try {
    if (!process.env.MP_ACCESS_TOKEN) {
      return res.status(500).json({ error: "MP_ACCESS_TOKEN no configurado" });
    }
    const { items = [], payerEmail } = req.body || {};
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Items vacíos" });
    }

    const preference = {
      items: items.map((i) => ({
        title: i.name,
        quantity: Number(i.qty || 1),
        currency_id: "ARS",
        unit_price: Number(i.price || 0),
        picture_url: i.image ? (typeof i.image === 'string' ? i.image : undefined) : undefined,
      })),
      payer: payerEmail ? { email: payerEmail } : undefined,
      back_urls: {
        success: process.env.MP_SUCCESS_URL || "http://localhost:3000",
        pending: process.env.MP_PENDING_URL || "http://localhost:3000",
        failure: process.env.MP_FAILURE_URL || "http://localhost:3000",
      },
      auto_return: "approved",
      binary_mode: true,
      statement_descriptor: "ALMENDRA",
      notification_url: process.env.MP_WEBHOOK_URL || undefined,
    };

    const mpResp = await mercadopago.preferences.create(preference);
    return res.json({
      preferenceId: mpResp.body.id,
      init_point: mpResp.body.init_point,
      sandbox_init_point: mpResp.body.sandbox_init_point,
    });
  } catch (err) {
    console.error("/api/payments/create-preference error:", err?.message || err);
    return res.status(500).json({ error: "No se pudo crear la preferencia" });
  }
});

// Webhook básico
app.post("/api/payments/webhook", async (req, res) => {
  try {
    // Puedes validar aquí con la API de MP según 'type' e 'id' recibidos
    // y actualizar el estado de tu orden.
    res.sendStatus(200);
  } catch (err) {
    console.error("/api/payments/webhook error:", err?.message || err);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => {
  res.send("Backend conectado correctamente");
});

app.listen(PORT, () => {
  console.log(`▶ Servidor escuchando en http://localhost:${PORT}`);
});

