const connection = require("../database");

const queryAsync = (query, params) => {
  return new Promise((resolve, reject) => {
    connection.query(query, params, (error, results) => {
      if (error) return reject(error);
      resolve(results);
    });
  });
};

// Obter todos os tipos de matérias-primas
exports.getTiposMateriasPrimas = (req, res) => {
  const q = `SELECT * FROM tipo_materia_prima ORDER BY nome`;
  connection.query(q, (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Nenhum tipo encontrado" });
    }
  });
};

// Obter todas as matérias-primas
exports.getMateriasPrimas = async (req, res) => {
  const q = `
    SELECT 
      materias_primas.id,
      materias_primas.nome,
      materias_primas.descricao,
      materias_primas.estoque,
      materias_primas.preco,
      materias_primas.coluna,
      materias_primas.unidade,
      tipo_materia_prima.nome AS tipo,
      locais_armazenamento.nome_local AS local
    FROM materias_primas
    LEFT JOIN tipo_materia_prima ON materias_primas.tipo_id = tipo_materia_prima.id
    LEFT JOIN locais_armazenamento ON materias_primas.local_armazenado = locais_armazenamento.id
    ORDER BY materias_primas.nome
  `;

  try {
    const results = await queryAsync(q);

    if (results.length > 0) {
      res.json(results);
    } else {
      res.status(404).json({ message: "Nenhuma matéria-prima encontrada" });
    }
  } catch (error) {
    console.error("Erro no servidor:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};

// Atualizar uma matéria-prima
exports.updateMateriaPrima = async (req, res) => {
  const { id, nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna, unidade } = req.body;

  const q1 = "SELECT * FROM materias_primas WHERE nome = ? AND id != ?";
  connection.query(q1, [nome, id], async (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({
        message: "Erro ao atualizar! Já existe uma matéria-prima com este nome no sistema!",
      });
    } else {
      try {
        const q2 = "UPDATE materias_primas SET nome = ?, descricao = ?, estoque = ?, preco = ?, tipo_id = ?, local_armazenado = ?, coluna = ?, unidade = ? WHERE id = ?";
        const params = [nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna, unidade, id];

        connection.query(q2, params, (error, results) => {
          if (error) {
            console.error("Erro no servidor:", error);
            res.status(500).json({ error: "Erro no servidor" });
            return;
          }
          res.status(200).json({ message: "Matéria-prima atualizada com sucesso!" });
        });
      } catch (error) {
        console.error("Erro ao atualizar a matéria-prima:", error);
        res.status(500).json({ error: "Erro ao atualizar a matéria-prima" });
      }
    }
  });
};

// Deletar uma matéria-prima
exports.deleteMateriaPrima = (req, res) => {
  const { id } = req.params;

  const q = "DELETE FROM materias_primas WHERE id = ?";
  connection.query(q, [id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Matéria-prima deletada com sucesso!" });
    } else {
      res.status(404).json({ error: "Matéria-prima não encontrada" });
    }
  });
};

// Cadastrar uma nova matéria-prima
exports.postCadastroMateriaPrima = async (req, res) => {
  const { nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna, unidade } = req.body;
  const q = "INSERT INTO materias_primas (nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna, unidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  
  try {
    const result = await queryAsync(q, [nome, descricao, estoque, preco, tipo_id, local_armazenado, coluna, unidade]);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error("Erro ao cadastrar a matéria-prima:", error);
    res.status(500).json({ error: "Erro no servidor" });
  }
};
