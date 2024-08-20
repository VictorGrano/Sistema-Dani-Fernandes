const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware.verifyToken, productController.getAllProducts);
router.get("/InfoProduto", authMiddleware.verifyToken, productController.getInfoProduto);
router.post("/CadastroProduto", authMiddleware.verifyToken, productController.createProduct);
router.put("/Atualizar", authMiddleware.verifyToken, productController.updateProduct);
router.post("/AtualizarLote", authMiddleware.verifyToken, productController.updateLote);
router.delete("/:id", authMiddleware.verifyToken, productController.deleteProduct);
router.get("/Tipo", authMiddleware.verifyToken, productController.getTipo);
router.get("/Lotes",authMiddleware.verifyToken,  productController.getLotes);
router.get("/AllLotes", authMiddleware.verifyToken, productController.getAllLotes);
router.get("/Aromas", authMiddleware.verifyToken, productController.getAromas);
router.get("/InfoAromas", authMiddleware.verifyToken, productController.getInfoAromas);
router.post("/RelatorioProdutos", authMiddleware.verifyToken, productController.postRelatorioProdutos);

module.exports = router;
