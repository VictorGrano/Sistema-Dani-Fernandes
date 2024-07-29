const connection = require("../database");

function convertToValidDate(mmYYYY) {
  const [month, year] = mmYYYY.split("-");
  return `${year}-${month}-01`;
}

function validateDate(ddMMYYYY) {
  const [day, month, year] = ddMMYYYY.split("-");
  return `${year}-${month}-${day}`;
}

exports.getStockQuantity = (req, res) => {
  const q = "SELECT id, nome_local, estoque_total, estoque_utilizado, estoque_total - estoque_utilizado AS estoque_livre FROM locais_armazenamento WHERE id = ?";
  const { id } = req.query;

  connection.query(q, [parseInt(id)], (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.json(results);
  });
};

exports.postEntrada = (req, res) => {
  const {
    id,
    quantidade,
    lote,
    validade,
    fabricacao,
    localArmazenado,
    coluna,
    quantidade_caixas
  } = req.body;

  if (
    !id ||
    !quantidade ||
    !lote ||
    !validade ||
    !fabricacao ||
    !localArmazenado ||
    !coluna ||
    !quantidade_caixas
  ) {
    console.error("Todos os campos são necessários:", req.body);
    return res.status(400).json({ error: "Todos os campos são necessários" });
  }

  const validadeDate = convertToValidDate(validade);
  const fabricacaoDate = validateDate(fabricacao);

  if (!validadeDate || !fabricacaoDate) {
    console.error("Formato de data inválido:", { validade, fabricacao });
    return res.status(400).json({ error: "Formato de data inválido" });
  }

  console.log("Dados recebidos:", req.body);
  console.log("Datas convertidas:", { validadeDate, fabricacaoDate });

  const checkQuery = "SELECT id, quantidade FROM lotes WHERE nome_lote = ? AND produto_id = ?";

  connection.query(checkQuery, [lote, id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      throw error;
    }

    if (results.length > 0) {
      const loteResult = results[0];
      const updateQuery = "UPDATE lotes SET quantidade = quantidade + ?, local_armazenado_id = ?, coluna = ?, quantidade_caixas = quantidade_caixas + ? WHERE id = ?";
      connection.query(
        updateQuery,
        [quantidade, localArmazenado, coluna, quantidade_caixas, parseInt(loteResult.id)],
        (updateError) => {
          if (updateError) {
            console.error("Erro ao atualizar lote:", updateError);
            res.status(500).json({ error: "Erro ao atualizar lote" });
            throw updateError;
          }
          connection.query('UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado + ? WHERE id = ?', [quantidade_caixas, localArmazenado], (updateStockError) => {
            if (updateStockError) {
              console.error("Erro ao atualizar estoque:", updateStockError);
              res.status(500).json({ error: "Erro ao atualizar estoque" });
              throw updateStockError;
            }
            res.json({ message: "Lote atualizado com sucesso" });
          });
        }
      );
    } else {
      const insertQuery = "INSERT INTO lotes (produto_id, nome_lote, quantidade, data_entrada, local_armazenado_id, data_validade, data_fabricacao, coluna, quantidade_caixas) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      connection.query(
        insertQuery,
        [
          id,
          lote,
          quantidade,
          new Date().toISOString().split("T")[0],
          localArmazenado,
          validadeDate,
          fabricacaoDate,
          coluna,
          quantidade_caixas
        ],
        (insertError) => {
          if (insertError) {
            console.error("Erro ao inserir lote:", insertError);
            res.status(500).json({ error: "Erro ao inserir lote" });
            throw insertError;
          }
          connection.query('UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado + ? WHERE id = ?', [quantidade_caixas, localArmazenado], (updateStockError) => {
            if (updateStockError) {
              console.error("Erro ao atualizar estoque:", updateStockError);
              res.status(500).json({ error: "Erro ao atualizar estoque" });
              throw updateStockError;
            }
            res.json({ message: "Lote inserido com sucesso" });
          });
        }
      );
    }
  });
};

exports.postSaida = (req, res) => {
  const { id, quantidade, lote, quantidade_caixas } = req.body;

  if (!id || !quantidade || !lote || !quantidade_caixas) {
    console.error("Todos os campos são necessários:", req.body);
    return res.status(400).json({ error: "Todos os campos são necessários" });
  }

  console.log("Dados recebidos:", req.body);

  const checkQuery = "SELECT id, quantidade, local_armazenado_id FROM lotes WHERE nome_lote = ? AND produto_id = ?";

  connection.query(checkQuery, [lote, id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      throw error;
    }

    if (results.length > 0) {
      const loteResult = results[0];
      if (loteResult.quantidade < quantidade) {
        return res
          .status(400)
          .json({ error: "Quantidade insuficiente no lote" });
      }

      const updateQuery = "UPDATE lotes SET quantidade = quantidade - ?, quantidade_caixas = quantidade_caixas - ? WHERE id = ?";
      connection.query(
        updateQuery,
        [quantidade, quantidade_caixas, parseInt(loteResult.id)],
        (updateError) => {
          if (updateError) {
            console.error("Erro ao atualizar lote:", updateError);
            res.status(500).json({ error: "Erro ao atualizar lote" });
            throw updateError;
          }
          connection.query('UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado - ? WHERE id = ?', [quantidade_caixas, loteResult.local_armazenado_id], (updateStockError) => {
            if (updateStockError) {
              console.error("Erro ao atualizar estoque:", updateStockError);
              res.status(500).json({ error: "Erro ao atualizar estoque" });
              throw updateStockError;
            }
            res.json({ message: "Lote atualizado com sucesso" });
          });
        }
      );
    } else {
      res.status(404).json({ error: "Lote não encontrado" });
    }
  });
};

exports.getLocais = (req, res) => {
  connection.query("SELECT * FROM locais_armazenamento", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
};
