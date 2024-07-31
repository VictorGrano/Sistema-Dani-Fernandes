const connection = require("../database");

// Função para formatar a data de dd/mm/aaaa para aaaa-mm-dd HH:MM:SS
function formatDateToBeginingOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}
function formatDateToEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

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
      res.json(results);
    } else {
      res.status(404).json({ message: "Erro no login" });
    }
  });
};

exports.historico = (req, res) => {
  const {
    idusuario,
    dataInicio,
    dataFim,
    produtoid,
    lote,
    local_armazenado,
    tipo_mudanca, 
    ordenar,
  } = req.body;

  let q = "SELECT * FROM historico_mudancas WHERE 1=1";
  let params = [];

  if (idusuario) {
    q += " AND id_usuario = ?";
    params.push(idusuario);
  }
  if (dataInicio && dataFim) {
    q += " AND data_mudanca BETWEEN ? AND ?";
    params.push(formatDateToBeginingOfDay(dataInicio), formatDateToEndOfDay(dataFim));
  } else if (dataInicio) {
    q += " AND data_mudanca > ?";
    params.push(formatDateToBeginingOfDay(dataInicio));
  } else if (dataFim) {
    q += " AND data_mudanca < ?";
    params.push(formatDateToEndOfDay(dataFim));
  }
  if (produtoid) {
    q += " AND produto_id = ?";
    params.push(produtoid);
  }
  if (lote) {
    q += " AND lote LIKE ?";
    params.push(`%${lote}%`);
  }
  if (local_armazenado) {
    q += " AND local_armazenado = ?";
    params.push(local_armazenado);
  }
  if (tipo_mudanca) {
    q += " AND tipo_mudanca = ?";
    params.push(tipo_mudanca);
  }
  q += ` ORDER BY ${ordenar || "data_mudanca"} DESC`;

  connection.query(q, params, (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      const promises = results.map((result, index) => {
        return new Promise((resolve, reject) => {
          const q2 = `SELECT nome FROM produtos WHERE id = ?`;
          connection.query(q2, [result.produto_id], (error, nomeResults) => {
            if (error) {
              console.error("Erro no servidor:", error);
              reject(error);
            } else {
              results[index].nome_produto = nomeResults[0].nome;
              resolve();
            }
          });
          const q3 = `SELECT nome_local FROM locais_armazenamento WHERE id = ?`;
          connection.query(q3, [result.local_armazenado], (error, localResults) => {
            if (error) {
              console.error("Erro no servidor:", error);
              reject(error);
            } else {
              results[index].nome_local = localResults[0].nome_local;
              resolve();
            }
          });
        });
      });

      Promise.all(promises)
        .then(() => {
          res.json(results);
        })
        .catch((error) => {
          console.error("Erro no servidor:", error);
          res.status(500).json({ error: "Erro no servidor" });
        });
    } else {
      res.status(404).json({ message: "Nenhum registro encontrado" });
    }
  });
};

exports.usuarios = (req, res) => {
  const q = `SELECT * FROM usuarios ORDER BY nome`;
  connection.query(q, (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      throw error;
    }
    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Erro na pesquisa" });
    }
  });
};
