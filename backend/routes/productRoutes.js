const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/", productController.getAllProducts);
router.get("/InfoProduto", productController.getInfoProduto);
router.get("/Lotes", productController.getLotes);

module.exports = router;
