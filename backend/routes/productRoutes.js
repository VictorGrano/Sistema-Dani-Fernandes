const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllProducts);
router.get("/InfoProduto", productController.getInfoProduto);
router.post("/Cadastrar", productController.getInfoProduto);
router.put("/Atualizar", productController.updateProduct);
router.put("/AtualizarLote:lote_id", productController.updateLote);
router.delete("/:id", productController.deleteProduct);
router.get("/Tipo", productController.getTipo);
router.get("/Lotes", productController.getLotes);
router.get("/Aromas", productController.getAromas);
router.get("/InfoAromas", productController.getInfoAromas);
router.post("/RelatorioProdutos", productController.postRelatorioProdutos);

module.exports = router;
