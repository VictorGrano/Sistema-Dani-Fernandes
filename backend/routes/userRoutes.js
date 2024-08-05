const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.get("/", userController.usuarios);
router.post("/Login", userController.login);
router.post("/Historico", userController.historico);
router.post("/Cadastro", userController.cadastraUsuario);
router.put("/Atualizar", userController.updateUsuario);
router.delete("/:id", userController.deleteUser);
router.post("/NovaSenha", userController.setNewPassword);

// Adicione outras rotas relacionadas a usuários aqui

module.exports = router;
