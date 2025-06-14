const express = require("express");
const cors = require('cors');
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.send('RECIBIDO!')
});

mongoose.connect(process.env.MONGO_URL || '')
  .then(() => console.log("CONECTADO A MONGO"))
  .catch(err => console.log("ERROR DE CONEXION", err))

.then(() => console.log("CONECTADO A MONGO"))
.catch(err => console.log("ERROR DE CONEXION", err));

app.listen(PORT, ()=> {
    console.log(`Servidor escuchando en el puerto ${PORT}`);
});