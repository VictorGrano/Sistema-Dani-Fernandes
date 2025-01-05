const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const authMiddleware = require("./middlewares/authMiddleware");
const productRoutes = require('./routes/productRoutes');
const stockRoutes = require('./routes/stockRoutes');
const userRoutes = require('./routes/userRoutes');
const insumoRoutes = require('./routes/insumoRoutes');
const materiaPrimaRoutes = require('./routes/materiaPrimaRoutes');

const app = express();
app.use(bodyParser.json());

app.use(cors({
  origin: "*",
}));

// Rotas principais
app.use('/produtos', authMiddleware.verifyToken, productRoutes);
app.use('/estoque', authMiddleware.verifyToken, stockRoutes);
app.use('/usuarios', userRoutes);  // Deixe esta rota aberta para login
app.use('/insumos', authMiddleware.verifyToken, insumoRoutes);
app.use("/materia-prima", authMiddleware.verifyToken, materiaPrimaRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
