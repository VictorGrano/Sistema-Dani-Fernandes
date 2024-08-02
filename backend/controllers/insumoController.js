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

exports.getInsumos = (req, res) => {
  const q = `SELECT * FROM insumos ORDER BY nome`;
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
