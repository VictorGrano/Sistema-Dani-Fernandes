const express = require("express");
const router = express.Router();
const stockController = require("../controllers/stockController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/QuantidadeEstoque", authMiddleware.verifyToken, stockController.getStockQuantity);
router.get("/Locais", authMiddleware.verifyToken, stockController.getLocais);
router.get("/ListaPrateleira", authMiddleware.verifyToken, stockController.getPrateleira);
router.put("/ListaPrateleira/Concluido/:id", authMiddleware.verifyToken, stockController.putItemConcluido);
router.delete("/ListaPrateleira/:id", authMiddleware.verifyToken, stockController.deletePrateleira);
router.post("/AddPrateleira", authMiddleware.verifyToken, stockController.postPrateleira);
router.post("/Entrada", authMiddleware.verifyToken, stockController.postEntrada);
router.post("/EntradaInsumo", authMiddleware.verifyToken, stockController.postEntradaInsumo);
router.post("/Saida", authMiddleware.verifyToken, stockController.postSaida);
router.post("/SaidaInsumo", authMiddleware.verifyToken, stockController.postSaidaInsumo);

// Novas rotas para matéria-prima
router.post("/EntradaMateriaPrima", authMiddleware.verifyToken, stockController.postEntradaMateriaPrima);
router.post("/SaidaMateriaPrima", authMiddleware.verifyToken, stockController.postSaidaMateriaPrima);

module.exports = router;
