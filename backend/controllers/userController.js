const connection = require("../database");
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const secretKey = 'chaveSecretaD@niFernandes2024';

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

exports.login = async (req, res) => {
  const { user, senha } = req.body;

  // Validação de entrada
  if (!user || !senha) {
    return res.status(400).json({ error: "Usuário e senha são obrigatórios" });
  }

  try {
    const q = `SELECT * FROM usuarios WHERE login = ?`;
    
    // Consulta ao banco de dados
    connection.query(q, [user], async (error, results) => {
      if (error) {
        console.error("Erro no servidor:", error);
        return res.status(500).json({ error: "Erro no servidor" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Usuário não encontrado" });
      }

      const usuario = results[0];

      // Comparação de senha
      const isMatch = await bcrypt.compare(senha, usuario.senha);

      if (!isMatch) {
        return res.status(401).json({ error: "Senha incorreta" });
      }

      // Gerar token JWT
      const token = jwt.sign({ id: usuario.id }, secretKey, { expiresIn: '12h' });

      // Retornar os dados do usuário junto com o token
      return res.status(200).json({
        message: "Autenticado com sucesso",
        token: token,
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          login: usuario.login,
          tipo: usuario.tipo,
          primeiro_login: usuario.primeiro_login,
        }
      });
    });
  } catch (error) {
    console.error("Erro no servidor:", error);
    return res.status(500).json({ error: "Erro no servidor" });
  }
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
          // Consultas paralelas usando Promise.all
          const produtoQuery = new Promise((resolveProduto, rejectProduto) => {
            const q2 = `SELECT nome FROM produtos WHERE id = ?`;
            connection.query(q2, [result.produto_id], (error, nomeResults) => {
              if (error) {
                console.error("Erro no servidor:", error);
                rejectProduto(error);
              } else {
                results[index].nome_produto = nomeResults[0]?.nome || "Desconhecido";
                resolveProduto();
              }
            });
          });

          const localQuery = new Promise((resolveLocal, rejectLocal) => {
            const q3 = `SELECT nome_local FROM locais_armazenamento WHERE id = ?`;
            connection.query(q3, [result.local_armazenado], (error, localResults) => {
              if (error) {
                console.error("Erro no servidor:", error);
                rejectLocal(error);
              } else {
                results[index].nome_local = localResults[0]?.nome_local || "Desconhecido";
                resolveLocal();
              }
            });
          });

          // Executando ambas as consultas paralelamente
          Promise.all([produtoQuery, localQuery])
            .then(() => resolve())
            .catch((error) => reject(error));
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
          [nome, login, hashedSenha, tipo, true],
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
      "UPDATE usuarios SET senha = ?, primeiro_login = false WHERE id = ?";
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
