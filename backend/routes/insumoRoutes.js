const express = require("express");
const router = express.Router();
const insumoController = require("../controllers/insumoController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/", authMiddleware.verifyToken, insumoController.getInsumos);
router.get("/TiposInsumos", authMiddleware.verifyToken, insumoController.getTiposInsumos);
router.put("/Atualizar", authMiddleware.verifyToken, insumoController.updateInsumo);
router.delete("/:id", authMiddleware.verifyToken, insumoController.deleteInsumo);
router.get("/InfoInsumo", authMiddleware.verifyToken, insumoController.getInfoInsumo);
router.post("/CadastroInsumo", authMiddleware.verifyToken, insumoController.postCadastroInsumo);

module.exports = router;
