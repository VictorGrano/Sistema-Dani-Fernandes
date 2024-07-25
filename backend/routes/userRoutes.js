const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

router.post("/Login", userController.login);

// Adicione outras rotas relacionadas a usuários aqui

module.exports = router;
