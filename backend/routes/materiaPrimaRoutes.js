const express = require("express");
const router = express.Router();
const materiaPrimaController = require("../controllers/materiaPrimaController");
const authMiddleware = require("../middlewares/authMiddleware");

// Rotas para matérias-primas
router.get("/", authMiddleware.verifyToken, materiaPrimaController.getMateriasPrimas);
router.get("/Tipos", authMiddleware.verifyToken, materiaPrimaController.getTiposMateriasPrimas);
router.get("/Info", authMiddleware.verifyToken, materiaPrimaController.getInfoMateriaPrima);
router.post("/Cadastro", authMiddleware.verifyToken, materiaPrimaController.postCadastroMateriaPrima);
router.put("/Atualizar", authMiddleware.verifyToken, materiaPrimaController.updateMateriaPrima);
router.delete("/:id", authMiddleware.verifyToken, materiaPrimaController.deleteMateriaPrima);

module.exports = router;
