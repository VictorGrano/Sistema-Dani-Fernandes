const connection = require("../database");

// Função para formatar a data de dd/mm/aaaa para aaaa-mm-dd HH:MM:SS
const formatData = (data, isEnd = false) => {
  const [dia, mes, ano] = data.split("/");
  const time = isEnd ? "23:59:59" : "00:00:00";
  return `${ano}-${mes}-${dia} ${time}`;
};

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
    tipo_mudança, 
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
    params.push(formatData(dataInicio), formatData(dataFim, true));
  } else if (dataInicio) {
    q += " AND data_mudanca > ?";
    params.push(formatData(dataInicio));
  } else if (dataFim) {
    q += " AND data_mudanca < ?";
    params.push(formatData(dataFim, true));
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
  if (tipo_mudança) {
    q += " AND tipo_mudança = ?";
    params.push(tipo_mudança);
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
