const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");

router.get("/QuantidadeEstoque", stockController.getStockQuantity);
router.get("/Locais", stockController.getLocais);
router.get("/ListaPrateleira", stockController.getPrateleira);
router.put("/ListaPrateleira/Concluido/:id", stockController.putPrateleira);
router.delete("/ListaPrateleira/:id", stockController.deletePrateleira);
router.post("/AddPrateleira", stockController.postPrateleira);
router.post("/Entrada", stockController.postEntrada);
router.post("/EntradaInsumo", stockController.postEntradaInsumo);
router.post("/SaidaInsumo", stockController.postSaidaInsumo);

module.exports = router;
