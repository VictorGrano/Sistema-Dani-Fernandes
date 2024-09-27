//Qualquer parte lógica relacionada a insumos:

const connection = require("../database");

const queryAsync = (query, params) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

exports.getTiposInsumos = (req, res) => {
  const q = `SELECT * FROM tipo_insumo ORDER BY nome`;
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

exports.getInsumos = async (req, res) => {
  const q = `
    SELECT 
      insumos.id,
      insumos.nome,
      insumos.descricao,
      insumos.estoque,
      insumos.preco,
      insumos.coluna,
      tipo_insumo.nome AS tipo,
      locais_armazenamento.nome_local AS local
    FROM insumos
    LEFT JOIN tipo_insumo ON insumos.tipo_id = tipo_insumo.id
    LEFT JOIN locais_armazenamento ON insumos.local_armazenado = locais_armazenamento.id
    ORDER BY insumos.nome
  `;

  try {
    const results = await queryAsync(q);

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Erro na pesquisa" });
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};
exports.getAdesivos = async (req, res) => {
  const q = `
    SELECT 
      insumos.id,
      insumos.nome,
      insumos.descricao,
      insumos.estoque,
      insumos.preco,
      insumos.coluna,
      tipo_insumo.nome AS tipo,
      locais_armazenamento.nome_local AS local
    FROM insumos
    LEFT JOIN tipo_insumo ON insumos.tipo_id = tipo_insumo.id
    LEFT JOIN locais_armazenamento ON insumos.local_armazenado = locais_armazenamento.id
    WHERE insumos.tipo_id in (10, 13, 14)
    ORDER BY insumos.nome
  `;

  try {
    const results = await queryAsync(q);

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Erro na pesquisa" });
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

exports.getLotesInsumo = (req, res) => {
  const { insumo_id } = req.query;
  const q = "SELECT * FROM lote_insumos WHERE insumo_id = ? AND quantidade > 0";

  connection.query(q, [insumo_id], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const promises = results.map((lote) => {
        return new Promise((resolve, reject) => {
          const q2 = "SELECT nome_local FROM locais_armazenamento WHERE id = ?";
          connection.query(
            q2,
            [lote.local_armazenado_id],
            (error, localResult) => {
              if (error) {
                reject(error);
              } else {
                if (localResult.length > 0) {
                  lote.nome_local = localResult[0].nome_local;
                } else {
                  lote.nome_local = null;
                }
                resolve(lote);
              }
            }
          );
        });
      });

      Promise.all(promises)
        .then((lotesComNomeLocal) => {
          res.json(lotesComNomeLocal);
        })
        .catch((error) => {
          console.error("Error fetching local names:", error);
          res.status(500).json({ error: "Internal server error" });
        });
    } else {
      res.status(404).json({ error: "Lotes não encontrados" });
    }
  });
};

exports.updateInsumo = async (req, res) => {
  const { id, nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna } = req.body;

  // Verifica se o nome já existe, exceto para o insumo atual
  const q1 = "SELECT * FROM insumos WHERE nome = ? AND id != ?";
  connection.query(q1, [nome, id], async (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({
        message: "Erro ao atualizar! Já existe um insumo com este nome no sistema!",
      });
    } else {
      try {
        const q2 = "UPDATE insumos SET nome = ?, descricao = ?, estoque = ?, preco = ?, tipo_id = ?, local_armazenado = ?, coluna = ? WHERE id = ?";
        const params = [nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna, id];

        connection.query(q2, params, (error, results) => {
          if (error) {
            console.error("Erro no servidor:", error);
            res.status(500).json({ error: "Erro no servidor" });
            return;
          }
          res.status(200).json({ message: "Insumo atualizado com sucesso!" });
        });
      } catch (error) {
        console.error("Erro ao atualizar o insumo:", error);
        res.status(500).json({ error: "Erro ao atualizar o insumo" });
      }
    }
  });
};

exports.updateTipoInsumo = async (req, res) => {
  const { id, nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna } = req.body;

  // Verifica se o nome já existe, exceto para o insumo atual
  const q1 = "SELECT * FROM tipo_insumo WHERE nome = ? AND id != ?";
  connection.query(q1, [nome, id], async (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({
        message: "Erro ao atualizar! Já existe um tipo de insumo com este nome no sistema!",
      });
    } else {
      try {
        const q2 = "UPDATE tipo_insumo SET nome = ? WHERE id = ?";
        const params = [nome, id];

        connection.query(q2, params, (error, results) => {
          if (error) {
            res.status(500).json({ error: "Erro no servidor" });
            return;
          }
          res.status(200).json({ message: "Insumo atualizado com sucesso!" });
        });
      } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar o insumo" });
      }
    }
  });
};

exports.deleteInsumo = (req, res) => {
  const { id } = req.params;

  const q = "DELETE FROM insumos WHERE id = ?";
  connection.query(q, [id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Insumo deletado com sucesso!" });
    } else {
      res.status(404).json({ error: "Insumo não encontrado" });
    }
  });
};

exports.deleteTipoInsumo = (req, res) => {
  const { id } = req.params;

  const q = "DELETE FROM tipo_insumo WHERE id = ?";
  connection.query(q, [id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Tipo de insumo deletado com sucesso!" });
    } else {
      res.status(404).json({ error: "Tipo de insumo não encontrado" });
    }
  });
};

exports.getInfoInsumo = async (req, res) => {
  const { id } = req.query;
  const q = "SELECT * FROM insumos WHERE id = ?";

  try {
    const insumoResults = await queryAsync(q, [id]);

    if (insumoResults.length > 0) {
      const insumo = insumoResults[0];
      const q3 = "SELECT nome FROM tipo_insumo WHERE id = ?";
      const q4 = "SELECT nome_local FROM locais_armazenamento WHERE id = ?";

      const localResults = await queryAsync(q4, [insumo.local_armazenado]);
      const tipoResults = await queryAsync(q3, [insumo.tipo_id]);

      if (localResults.length > 0) {
        insumo.local = localResults[0].nome_local;
      } else {
        insumo.local = null;
      }

      if (localResults.length > 0) {
        insumo.nome_local = localResults[0].nome_local; // Corrigi o nome do campo para `nome`
      } else {
        insumo.nome_local = null;
      }
      if (tipoResults.length > 0) {
        insumo.tipo_insumo = tipoResults[0].nome; // Corrigi o nome do campo para `nome`
      } else {
        insumo.tipo_insumo = null;
      }

      res.json(insumo);
    } else {
      res.status(404).json({ error: "Produto não encontrado" });
    }
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
};

exports.postCadastroTipoInsumo = async (req, res) => {
  const { nome } = req.body;
  const q = "INSERT INTO tipo_insumo (nome) VALUES (?)";
  try {
    const result = await queryAsync(q, nome);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
};

exports.postCadastroInsumo = async (req, res) => {
  const { nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna } = req.body;
  const q = "INSERT INTO insumos (nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna) VALUES (?, ?, ?, ?, ?, ?, ?)";
  
  try {
    const result = await queryAsync(q, [nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna]);
    res.status(201).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Erro no servidor" });
  }
};
