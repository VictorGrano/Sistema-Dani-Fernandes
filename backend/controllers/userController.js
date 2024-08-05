const connection = require("../database");
const bcrypt = require("bcrypt");

// Função para formatar a data de dd/mm/aaaa para aaaa-mm-dd HH:MM:SS
function formatDateToBeginingOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function formatDateToEndOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function Encriptar(senha) {
  const saltRounds = 5;
  return new Promise((resolve, reject) => {
    bcrypt.hash(senha, saltRounds, function (err, hash) {
      if (err) reject(err);
      resolve(hash);
    });
  });
}

exports.login = (req, res) => {
  const { user, senha } = req.body;
  const q = `SELECT * FROM usuarios WHERE login = ?`;
  connection.query(q, [user], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      bcrypt.compare(senha, results[0].senha, function (err, result) {
        if (err) {
          console.error("Erro no servidor:", err);
          res.status(500).json({ error: "Erro no servidor" });
          return;
        }
        if (result) {
          res.status(200).json(results);
        } else {
          res.status(404).json({ message: "Erro no login" });
        }
      });
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
    params.push(
      formatDateToBeginingOfDay(dataInicio),
      formatDateToEndOfDay(dataFim)
    );
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
      return;
    }
    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Erro na pesquisa" });
    }
  });
};

exports.updateUsuario = async (req, res) => {
  const { nome, login, tipo, id, senha } = req.body;

  // Verifica se o nome ou login já existem, exceto para o usuário atual
  const q1 = "SELECT * FROM usuarios WHERE (nome = ? OR login = ?) AND id != ?";
  connection.query(q1, [nome, login, id], async (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({
        message: "Erro ao atualizar! Já existe o nome ou o login no sistema!",
      });
    } else {
      try {
        let q2;
        let params;

        // Se a senha for fornecida, encripta a senha e atualiza todos os campos
        if (senha) {
          const hashedSenha = await Encriptar(senha);
          q2 = "UPDATE usuarios SET nome = ?, login = ?, senha = ?, tipo = ? WHERE id = ?";
          params = [nome, login, hashedSenha, tipo, id];
        } else {
          // Caso contrário, atualiza apenas nome, login e tipo
          q2 = "UPDATE usuarios SET nome = ?, login = ?, tipo = ? WHERE id = ?";
          params = [nome, login, tipo, id];
        }

        connection.query(q2, params, (error, results) => {
          if (error) {
            console.error("Erro no servidor:", error);
            res.status(500).json({ error: "Erro no servidor" });
            return;
          }
          res.status(200).json({ message: "Usuário atualizado com sucesso!" });
        });
      } catch (error) {
        console.error("Erro ao encriptar a senha:", error);
        res.status(500).json({ error: "Erro ao encriptar a senha" });
      }
    }
  });
};

exports.deleteUser = (req, res) => {
  const { id } = req.params;

  const q = "DELETE FROM usuarios WHERE id = ?";
  connection.query(q, [id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } else {
      res.status(404).json({ error: "Usuário não encontrado" });
    }
  });
};

exports.cadastraUsuario = async (req, res) => {
  const { nome, login, tipo, senha } = req.body;
  const q1 = "SELECT * FROM usuarios WHERE nome = ? OR login = ?";
  connection.query(q1, [nome, login], async (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({
        message: "Erro ao cadastrar! Já tem o nome ou o login no sistema!",
      });
    } else {
      try {
        const hashedSenha = await Encriptar(senha);
        const q2 =
          "INSERT INTO usuarios (nome, login, senha, tipo, primeiro_login) values (?, ?, ?, ?, ?)";
        connection.query(
          q2,
          [nome, login, hashedSenha, tipo, "sim"],
          (error, results) => {
            if (error) {
              console.error("Erro no servidor:", error);
              res.status(500).json({ error: "Erro no servidor" });
              return;
            }
            res
              .status(201)
              .json({ message: "Usuário cadastrado com sucesso!" });
          }
        );
      } catch (error) {
        console.error("Erro ao encriptar a senha:", error);
        res.status(500).json({ error: "Erro ao encriptar a senha" });
      }
    }
  });
};

exports.setNewPassword = async (req, res) => {
  const { id, senha } = req.body;
  try {
    const hashedSenha = await Encriptar(senha);
    const q =
      "UPDATE usuarios SET senha = ?, primeiro_login = 'nao' WHERE id = ?";
    connection.query(q, [hashedSenha, id], (error, results) => {
      if (error) {
        console.error("Erro no servidor:", error);
        res.status(500).json({ error: "Erro no servidor" });
        return;
      }
      if (results.affectedRows > 0) {
        res
          .status(200)
          .json({ success: true, message: "Senha alterada com sucesso!" });
      } else {
        res
          .status(404)
          .json({ success: false, message: "Usuário não encontrado." });
      }
    });
  } catch (error) {
    console.error("Erro ao encriptar a senha:", error);
    res.status(500).json({ error: "Erro ao encriptar a senha" });
  }
};
