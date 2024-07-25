const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllProducts);
router.get("/InfoProduto", productController.getInfoProduto);
// Adicione outras rotas relacionadas a produtos aqui

module.exports = router;
