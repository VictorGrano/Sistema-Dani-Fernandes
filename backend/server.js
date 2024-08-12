const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const userRoutes = require("./routes/userRoutes");
const insumoRoutes = require("./routes/insumoRoutes");

const app = express();
app.use(bodyParser.json());
app.use(cors());

//Rotas principais:

app.use("/produtos", productRoutes);
app.use("/estoque", stockRoutes);
app.use("/usuarios", userRoutes);
app.use("/insumos", insumoRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
