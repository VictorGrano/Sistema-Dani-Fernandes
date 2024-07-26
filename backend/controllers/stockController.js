const connection = require("../database");

function convertToValidDate (mmYYYY) {
  const [month, year] = mmYYYY.split("-");
  return `${year}-${month}-01`;
};

function validateDate (ddMMYYYY) {
  const [day, month, year] = ddMMYYYY.split("-");
  return `${year}-${month}-${day}`;
};

exports.getStockQuantity = (req, res) => {
  connection.query(
    "SELECT local_armazenado_id, SUM(quantidade) AS estoque_local FROM lotes GROUP BY local_armazenado_id",
    (error, results) => {
      if (error) throw error;
      
      const promises = results.map(result => {
        return new Promise((resolve, reject) => {
          const q2 = "SELECT nome_local FROM locais_armazenamento WHERE id = ?";
          connection.query(q2, [result.local_armazenado_id], (error, aromaResults) => {
            if (error) return reject(error);
            result.nome_local = aromaResults.length > 0 ? aromaResults[0].nome_local : null;
            resolve();
          });
        });
      });

      Promise.all(promises)
        .then(() => res.json(results))
        .catch(error => {
          console.error(error);
          res.status(500).send('Error retrieving data');
        });
    }
  );
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
    !coluna
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

  connection.query(checkQuery, [lote, id] , (error, results) => {
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
          res.json({ message: "Lote atualizado com sucesso" });
        }
      );
    } else {
      const insertQuery = "INSERT INTO lotes (produto_id, nome_lote, quantidade, data_entrada, local_armazenado_id, data_validade, data_fabricacao, coluna, quantidade_caixas)  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
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
          res.json({ message: "Lote inserido com sucesso" });
        }
      );
    }
  });
};

exports.postSaida = (req, res) => {
  const { id, quantidade, lote } = req.body;

  if (!id || !quantidade || !lote) {
    console.error("Todos os campos são necessários:", req.body);
    return res.status(400).json({ error: "Todos os campos são necessários" });
  }

  console.log("Dados recebidos:", req.body);

  const checkQuery = "SELECT id, quantidade FROM lotes WHERE nome_lote = ? AND produto_id = ?";

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

      const updateQuery = "UPDATE lotes SET quantidade = quantidade - ? WHERE id = ?";
      connection.query(
        updateQuery,
        [quantidade, parseInt(loteResult.id)],
        (updateError) => {
          if (updateError) {
            console.error("Erro ao atualizar lote:", updateError);
            res.status(500).json({ error: "Erro ao atualizar lote" });
            throw updateError;
          }
          res.json({ message: "Lote atualizado com sucesso" });
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
