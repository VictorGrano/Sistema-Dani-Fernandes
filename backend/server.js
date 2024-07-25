const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const productRoutes = require("./routes/productRoutes");
const stockRoutes = require("./routes/stockRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();
app.use(bodyParser.json());
app.use(cors());

app.use("/produtos", productRoutes);
app.use("/estoque", stockRoutes);
app.use("/usuarios", userRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
