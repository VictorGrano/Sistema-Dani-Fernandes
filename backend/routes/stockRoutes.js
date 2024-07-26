const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get("/QuantidadeEstoque", stockController.getStockQuantity);
router.get("/Locais", stockController.getLocais);
router.post("/Entrada", stockController.postEntrada);
router.post("/Saida", stockController.postSaida);

// Adicione outras rotas relacionadas a estoque aqui

module.exports = router;
