const express = require("express");
const router = express.Router();
const insumoController = require("../controllers/insumoController");

router.get("/", insumoController.getInsumos);
router.get("/TiposInsumos", insumoController.getTiposInsumos);
router.get("/InfoInsumo", insumoController.getInfoInsumo);
router.post("/CadastroInsumo", insumoController.postCadastroInsumo);

module.exports = router;
