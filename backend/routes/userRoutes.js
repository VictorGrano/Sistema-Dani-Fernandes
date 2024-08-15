const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");


router.get("/", authMiddleware.verifyToken, userController.usuarios);
router.post("/Login", userController.login);
router.post("/Historico", authMiddleware.verifyToken, userController.historico);
router.post("/Cadastro", authMiddleware.verifyToken, userController.cadastraUsuario);
router.put("/Atualizar", authMiddleware.verifyToken, userController.updateUsuario);
router.delete("/:id", authMiddleware.verifyToken, userController.deleteUser);
router.post("/NovaSenha", authMiddleware.verifyToken, userController.setNewPassword);


module.exports = router;
