const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get("/QuantidadeEstoque", stockController.getStockQuantity);

// Adicione outras rotas relacionadas a estoque aqui

module.exports = router;
