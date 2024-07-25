const connection = require("../database");

exports.login = (req, res) => {
  const { user, senha } = req.body;
  const q = `SELECT * FROM usuarios WHERE login = ? AND senha = ?`;
  connection.query(q, [user, senha], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      throw error;
    }
    if (results.length > 0) {
      res.json({ message: "Logado" });
    } else {
      res.status(404).json({ message: "Erro no login" });
    }
  });
};

// Adicione outras funções relacionadas a usuários aqui
