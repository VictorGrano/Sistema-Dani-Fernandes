const connection = require("../database");

const logChange = (
  iduser,
  usuario,
  tabela_alterada,
  tipo_mudanca,
  produto_id,
  lote,
  valor_inserido,
  valor_antigo,
  local_armazenado,
  coluna
) => {
  const query = `
    INSERT INTO historico_mudancas 
    (id_usuario, usuario, tabela_alterada, tipo_mudanca, produto_id, lote, valor_movimentacao, valor_antigo, local_armazenado, coluna) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    iduser,
    usuario,
    tabela_alterada,
    tipo_mudanca,
    produto_id,
    lote,
    valor_inserido,
    valor_antigo,
    local_armazenado,
    coluna,
  ];

  connection.query(query, params, (error, results) => {
    if (error) {
      console.error("Erro ao registrar mudança no histórico:", error);
    } else {
      console.log("Mudança registrada com sucesso no histórico:", results);
    }
  });
};

function convertToValidDate(dateString) {
  // Verifica se a data está no formato MM-yyyy
  if (dateString.match(/^\d{2}-\d{4}$/)) {
    const [month, year] = dateString.split("-");
    return `${year}-${month}-01`; // Retorna no formato YYYY-MM-DD com o dia 01
  }

  // Verifica se a data está no formato YYYY-MM-DD
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString; // A data já está no formato correto
  }

  // Verifica se a data está no formato ISO 8601 (YYYY-MM-DDTHH:MM:SSZ)
  if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/)) {
    return dateString.split("T")[0]; // Retorna apenas a parte da data no formato YYYY-MM-DD
  }

  return null; // Retorna null se o formato não for reconhecido
}

exports.getPrateleira = (req, res) => {
  const q = `
SELECT 
  lp.id, 
  lp.produto_id, 
  lp.lote_id, 
  lp.quantidade, 
  lp.concluido,
  p.nome AS nome_produto,
  l.nome_lote AS nome_lote,
  la.nome_local AS nome_local,  -- Nome do local armazenado
  l.coluna  -- Inclui a coluna
FROM 
  lista_prateleira lp
JOIN 
  produtos p ON lp.produto_id = p.id 
JOIN 
  lotes l ON lp.lote_id = l.id
JOIN 
  locais_armazenamento la ON l.local_armazenado_id = la.id  -- Join para buscar o nome do local
ORDER BY 
  la.nome_local,  -- Ordena primeiro pelo nome do local
  l.coluna;  -- Depois pela coluna
  `;
  connection.query(q, (error, results) => {
    if (error) {
      console.error("Error executing query:", error);
      res.status(500).json({ error: "Database query failed" });
      return;
    }
    res.status(200).json(results);
  });
};

exports.putPrateleira = (req, res) => {
  const { id } = req.params;
  const concluido = "sim";

  const updateQuery = `
    UPDATE lista_prateleira 
    SET concluido = ? 
    WHERE id = ?`;

  connection.query(updateQuery, [concluido, id], (error, results) => {
    if (error) {
      console.error("Error updating prateleira item:", error);
      res.status(500).json({ error: "Database update failed" });
      return;
    }
    res.status(200).json({ success: true });
  });
};

exports.putItemConcluido = (req, res) => {
  const { id } = req.params;
  const { concluido } = req.body;

  const updateQuery = `
    UPDATE lista_prateleira 
    SET concluido = ? 
    WHERE id = ?`;

  connection.query(updateQuery, [concluido, id], (error, results) => {
    if (error) {
      console.error("Error updating prateleira item:", error);
      res.status(500).json({ error: "Database update failed" });
      return;
    }
    res.status(200).json({ success: true });
  });
};

exports.deletePrateleira = (req, res) => {
  const { id } = req.params;

  const deleteQuery = `
    DELETE FROM lista_prateleira 
    WHERE id = ?`;

  connection.query(deleteQuery, [id], (error, results) => {
    if (error) {
      console.error("Error deleting prateleira item:", error);
      res.status(500).json({ error: "Database delete failed" });
      return;
    }
    res.status(200).json({ success: true });
  });
};

exports.postPrateleira = (req, res) => {
  const { produto_id, lote_id, quantidade } = req.body;

  // Verifica se o produto já está na lista
  const checkQuery =
    "SELECT * FROM lista_prateleira WHERE produto_id = ? AND lote_id = ?";
  connection.query(
    checkQuery,
    [produto_id, lote_id],
    (checkError, checkResults) => {
      if (checkError) {
        console.error("Error executing query:", checkError);
        res.status(500).json({ error: "Database query failed" });
        return;
      }

      if (checkResults.length > 0) {
        res.status(400).json({ error: "Produto já adicionado na lista" });
        return;
      }

      // Se o produto não está na lista, insere o novo produto com concluido como false
      const insertQuery =
        "INSERT INTO lista_prateleira (produto_id, lote_id, quantidade, concluido) VALUES (?, ?, ?, ?)";
      connection.query(
        insertQuery,
        [produto_id, lote_id, quantidade, false],
        (insertError, insertResults) => {
          if (insertError) {
            console.error("Error executing query:", insertError);
            res.status(500).json({ error: "Database query failed" });
            return;
          }

          res.status(200).json({ success: true });
        }
      );
    }
  );
};

exports.getStockQuantity = (req, res) => {
  const q =
    "SELECT id, nome_local, estoque_total, estoque_utilizado, estoque_total - estoque_utilizado AS estoque_livre FROM locais_armazenamento WHERE id = ?";
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
    quantidade_caixas,
    user,
    iduser,
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

  // Validação das datas
  const validadeDate = convertToValidDate(validade);
  const fabricacaoDate = convertToValidDate(fabricacao);

  if (!validadeDate || !fabricacaoDate) {
    console.error("Formato de data inválido:", { validade, fabricacao });
    return res.status(400).json({ error: "Formato de data inválido" });
  }

  console.log("Dados recebidos:", req.body);
  console.log("Datas convertidas:", { validadeDate, fabricacaoDate });

  const checkQuery = `
  SELECT id, quantidade, quantidade_caixas, local_armazenado_id, coluna 
  FROM lotes 
  WHERE (nome_lote = ? OR id = ?) AND produto_id = ?`;

  connection.query(checkQuery, [lote, lote, id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      return res.status(500).json({ error: "Erro no servidor" });
    }

    if (results.length > 0) {
      const loteResult = results[0];

      // Atualizando lote existente
      const updateQuery = `
      UPDATE lotes 
      SET quantidade = quantidade + ?, local_armazenado_id = ?, coluna = ?, quantidade_caixas = quantidade_caixas + ? 
      WHERE id = ?`;
      connection.query(
        updateQuery,
        [quantidade, localArmazenado, coluna, quantidade_caixas, loteResult.id],
        (updateError) => {
          if (updateError) {
            console.error("Erro ao atualizar lote:", updateError);
            return res.status(500).json({ error: "Erro ao atualizar lote" });
          }

          // Atualizando o estoque do local de armazenamento
          connection.query(
            "UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado + ? WHERE id = ?",
            [quantidade_caixas, localArmazenado],
            (updateStockError) => {
              if (updateStockError) {
                console.error("Erro ao atualizar estoque:", updateStockError);
                return res.status(500).json({
                  error: "Erro ao atualizar estoque do local de armazenamento",
                });
              }

              // Registro da mudança
              logChange(
                iduser,
                user,
                "lotes",
                "entrada",
                id,
                lote,
                JSON.stringify({
                  quantidade: quantidade,
                  quantidade_caixas: quantidade_caixas,
                }),
                JSON.stringify({
                  quantidade: loteResult.quantidade,
                  quantidade_caixas: loteResult.quantidade_caixas,
                }),
                localArmazenado,
                coluna
              );

              res.json({ message: "Lote atualizado com sucesso" });
            }
          );
        }
      );
    } else {
      // Inserindo novo lote
      const insertQuery = `
      INSERT INTO lotes 
      (produto_id, nome_lote, quantidade, data_entrada, local_armazenado_id, data_validade, data_fabricacao, coluna, quantidade_caixas) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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
          quantidade_caixas,
        ],
        (insertError) => {
          if (insertError) {
            console.error("Erro ao inserir lote:", insertError);
            return res.status(500).json({ error: "Erro ao inserir lote" });
          }

          // Atualizando o estoque do local de armazenamento
          connection.query(
            "UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado + ? WHERE id = ?",
            [quantidade_caixas, localArmazenado],
            (updateStockError) => {
              if (updateStockError) {
                console.error("Erro ao atualizar estoque:", updateStockError);
                return res.status(500).json({
                  error: "Erro ao atualizar estoque do local de armazenamento",
                });
              }

              // Registro da mudança
              logChange(
                iduser,
                user,
                "lotes",
                "entrada",
                id,
                lote,
                JSON.stringify({ quantidade, quantidade_caixas }),
                0,
                localArmazenado,
                coluna
              );

              res.json({ message: "Lote inserido com sucesso" });
            }
          );
        }
      );
    }
  });
};

exports.postEntradaInsumo = (req, res) => {
  const {
    id,
    lote,
    quantidade,
    quantidade_caixas,
    localArmazenado,
    coluna,
    user,
    iduser,
  } = req.body;

  if (!id || !quantidade || !localArmazenado || !coluna) {
    console.error("Todos os campos são necessários:", req.body);
    return res.status(400).json({ error: "Todos os campos são necessários" });
  }

  const atualizaEstoque = () => {
    connection.query(
      "UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado + ?, quantidade_insumos = quantidade_insumos + ? WHERE id = ?",
      [quantidade_caixas, quantidade, localArmazenado],
      (updateStockError) => {
        if (updateStockError) {
          console.error("Erro ao atualizar estoque:", updateStockError);
          res.status(500).json({ error: "Erro ao atualizar estoque" });
          return;
        }
        // Registro da mudança
        logChange(
          iduser,
          user,
          "insumos",
          "entrada",
          id,
          lote,
          JSON.stringify({ quantidade, quantidade_caixas }),
          0,
          localArmazenado,
          coluna
        );
        res.json({ message: "Insumo atualizado com sucesso" });
      }
    );
  };

  console.log("Dados recebidos:", req.body);
  const checkQuery =
    "SELECT * FROM lote_insumos WHERE insumo_id = ? AND nome_lote = ?;";
  connection.query(checkQuery, [id, lote], (error, results) => {
    if (error) {
      console.error("Erro ao verificar insumo:", error);
      res.status(500).json({ error: "Erro ao verificar insumo" });
      return;
    }
    if (results.length > 0) {
      const updateQuery =
        "UPDATE lote_insumos SET quantidade = quantidade + ?, quantidade_caixas = quantidade_caixas + ?, local_armazenado_id = ?, coluna = ? WHERE nome_lote = ?";

      connection.query(
        updateQuery,
        [quantidade, quantidade_caixas, localArmazenado, coluna, lote],
        (updateError) => {
          if (updateError) {
            console.error("Erro ao atualizar insumo:", updateError);
            res.status(500).json({ error: "Erro ao atualizar insumo" });
            return;
          } else {
            atualizaEstoque();
          }
        }
      );
    } else {
      const insertQuery =
        "INSERT INTO lote_insumos (insumo_id, nome_lote, quantidade, quantidade_caixas, local_armazenado_id, coluna) VALUES (?, ?, ?, ?, ?, ?)";

      connection.query(
        insertQuery,
        [id, lote, quantidade, quantidade_caixas, localArmazenado, coluna],
        (insertError) => {
          if (insertError) {
            console.error("Erro ao inserir insumo:", insertError);
            res.status(500).json({ error: "Erro ao inserir insumo" });
            return;
          } else {
            atualizaEstoque();
          }
        }
      );
    }
  });
};

exports.postSaida = (req, res) => {
  const { id, quantidade, lote, quantidade_caixas, user, iduser } = req.body;

  if (!id || !quantidade || !lote || !quantidade_caixas) {
    console.error("Todos os campos são necessários:", req.body);
    return res.status(400).json({ error: "Todos os campos são necessários" });
  }

  console.log("Dados recebidos:", req.body);

  const checkQuery =
    "SELECT id, quantidade, local_armazenado_id, coluna FROM lotes WHERE nome_lote = ? AND produto_id = ?";

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

      const updateQuery =
        "UPDATE lotes SET quantidade = quantidade - ?, quantidade_caixas = quantidade_caixas - ? WHERE id = ?";
      connection.query(
        updateQuery,
        [quantidade, quantidade_caixas, parseInt(loteResult.id)],
        (updateError) => {
          if (updateError) {
            console.error("Erro ao atualizar lote:", updateError);
            res.status(500).json({ error: "Erro ao atualizar lote" });
            throw updateError;
          }
          connection.query(
            "UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado - ? WHERE id = ?",
            [quantidade_caixas, loteResult.local_armazenado_id],
            (updateStockError) => {
              if (updateStockError) {
                console.error("Erro ao atualizar estoque:", updateStockError);
                res.status(500).json({ error: "Erro ao atualizar estoque" });
                throw updateStockError;
              }
              // Registro da mudança
              logChange(
                iduser,
                user,
                "lotes",
                "saída",
                id,
                lote,
                JSON.stringify({
                  quantidade: quantidade,
                  quantidade_caixas: quantidade_caixas,
                }),
                JSON.stringify({
                  quantidade: loteResult.quantidade,
                  quantidade_caixas: loteResult.quantidade_caixas,
                }),
                loteResult.local_armazenado_id,
                loteResult.coluna
              );
              res.json({ message: "Lote atualizado com sucesso" });
            }
          );
        }
      );
    } else {
      res.status(404).json({ error: "Lote não encontrado" });
    }
  });
};

exports.postSaidaInsumo = (req, res) => {
  const { id, lote, quantidade, quantidade_caixas, user, iduser } = req.body;

  if (!id || !quantidade || !lote) {
    console.error("Todos os campos são necessários:", req.body);
    return res.status(400).json({ error: "Todos os campos são necessários" });
  }

  console.log("Dados recebidos:", req.body);

  // Verifica o lote do insumo
  const checkQuery =
    "SELECT id, quantidade, quantidade_caixas, local_armazenado_id, coluna FROM lote_insumos WHERE insumo_id = ? AND nome_lote = ?";

  connection.query(checkQuery, [id, lote], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      return res.status(500).json({ error: "Erro no servidor" });
    }

    if (results.length > 0) {
      const loteResult = results[0];

      // Verifica se a quantidade no lote é suficiente
      if (loteResult.quantidade < quantidade) {
        return res
          .status(400)
          .json({ error: "Quantidade insuficiente no lote" });
      }

      // Atualiza a quantidade e a quantidade de caixas no lote
      const updateQuery =
        "UPDATE lote_insumos SET quantidade = quantidade - ?, quantidade_caixas = quantidade_caixas - ? WHERE id = ?";

      connection.query(
        updateQuery,
        [quantidade, quantidade_caixas, loteResult.id],
        (updateError) => {
          if (updateError) {
            console.error("Erro ao atualizar lote:", updateError);
            return res.status(500).json({ error: "Erro ao atualizar lote" });
          }

          // Atualiza o estoque do local de armazenamento
          connection.query(
            "UPDATE locais_armazenamento SET estoque_utilizado = estoque_utilizado - ?, quantidade_insumos = quantidade_insumos - ? WHERE id = ?",
            [quantidade_caixas, quantidade, loteResult.local_armazenado_id],
            (updateStockError) => {
              if (updateStockError) {
                console.error(
                  "Erro ao atualizar estoque do local de armazenamento:",
                  updateStockError
                );
                return res
                  .status(500)
                  .json({ error: "Erro ao atualizar estoque" });
              }

              // Registro da mudança no log
              logChange(
                iduser,
                user,
                "insumos",
                "saída",
                id,
                lote,
                JSON.stringify({
                  quantidade: quantidade,
                  quantidade_caixas: quantidade_caixas,
                }),
                JSON.stringify({
                  quantidade: loteResult.quantidade,
                  quantidade_caixas: loteResult.quantidade_caixas,
                }),
                loteResult.local_armazenado_id,
                loteResult.coluna
              );

              res.json({ message: "Saída de insumo realizada com sucesso" });
            }
          );
        }
      );
    } else {
      res.status(404).json({ error: "Lote de insumo não encontrado" });
    }
  });
};

exports.getLocais = (req, res) => {
  connection.query("SELECT * FROM locais_armazenamento", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
};
