const express = require("express");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "usbw",
  port: "3307",
  database: "danifernandes",
  charset: "utf8mb4",
});

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.stack);
    return;
  }
  console.log("Conectado ao banco de dados como id " + connection.threadId);
});

const convertToValidDate = (mmYYYY) => {
  const [month, year] = mmYYYY.split("-");
  return `${year}-${month}-01`;
};

const validateDate = (ddMMYYYY) => {
  const [day, month, year] = ddMMYYYY.split("-");
  return `${year}-${month}-${day}`;
};

app.get("/produtos", (req, res) => {
  connection.query("SELECT * FROM produtos", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get("/locais", (req, res) => {
  connection.query("SELECT * FROM locais_armazenamento", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
});

app.get("/buscaProduto", (req, res) => {
  const { id } = req.query;
  const q = "SELECT * FROM produtos WHERE id = ?";

  connection.query(q, [id], (error, produtoResults) => {
    if (error) throw error;

    if (produtoResults.length > 0) {
      const produto = produtoResults[0];
      const q2 = "SELECT nome_aroma FROM aromas WHERE cod_aroma = ?";

      connection.query(q2, [produto.cod_aroma], (error, aromaResults) => {
        if (error) throw error;

        if (aromaResults.length > 0) {
          produto.nome_aroma = aromaResults[0].nome_aroma;
        } else {
          produto.nome_aroma = null;
        }

        res.json(produto);
      });
    } else {
      res.status(404).json({ error: "Produto não encontrado" });
    }
  });
});

app.get("/buscarlotes", (req, res) => {
  const { produto_id } = req.query;
  const q = "SELECT * FROM lotes WHERE produto_id = ?";

  connection.query(q, [produto_id], (error, results) => {
    if (error) throw error;

    if (results.length > 0) {
      const promises = results.map((lote) => {
        return new Promise((resolve, reject) => {
          const q2 = "SELECT nome_local FROM locais_armazenamento WHERE id = ?";

          connection.query(q2, [lote.local_armazenado_id], (error, localResult) => {
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
          });
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
});

app.get("/produtoDetalhes", (req, res) => {
  const { produto_id } = req.query;
  const query = `SELECT categoria_id, cod_aroma FROM produtos WHERE id = ?`;
  connection.query(query, [parseInt(produto_id)], (error, results) => {
    if (error) throw error;
    if (results.length > 0) {
      const produto = results[0];
      const q2 = `SELECT sigla FROM tipo_produto WHERE id = ?`;
      connection.query(q2, [produto.categoria_id], (error, siglaResults) => {
        if (error) throw error;
        if (siglaResults.length > 0) {
          produto.sigla = siglaResults[0].sigla;
        } else {
          produto.sigla = null;
        }
        res.json(produto);
      });
    } else {
      res.status(404).json({ error: "Produto não encontrado" });
    }
  });
});

app.post("/entradas", (req, res) => {
  const { id, quantidade, lote, validade, fabricacao, localArmazenado, coluna } = req.body;

  if (!id || !quantidade || !lote || !validade || !fabricacao || !localArmazenado || !coluna) {
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

  const checkQuery = `SELECT id, quantidade FROM lotes WHERE nome_lote = ? AND produto_id = ?`;

  connection.query(checkQuery, [lote, id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      throw error;
    }

    if (results.length > 0) {
      const loter = results[0];
      const updateQuery = `UPDATE lotes SET quantidade = quantidade + ?, local_armazenado_id = ?, coluna = ? WHERE id = ?`;
      connection.query(
        updateQuery,
        [quantidade, localArmazenado, coluna, parseInt(loter.id)],
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
      const insertQuery = `INSERT INTO lotes (produto_id, nome_lote, quantidade, data_entrada, local_armazenado_id, data_validade, data_fabricacao, coluna) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
      connection.query(
        insertQuery,
        [id, lote, quantidade, new Date().toISOString().split('T')[0], localArmazenado, validadeDate, fabricacaoDate, coluna],
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
});

app.post("/saidas", (req, res) => {
  const { id, quantidade, lote } = req.body;

  if (!id || !quantidade || !lote) {
    console.error("Todos os campos são necessários:", req.body);
    return res.status(400).json({ error: "Todos os campos são necessários" });
  }

  console.log("Dados recebidos:", req.body);

  const checkQuery = `SELECT id, quantidade FROM lotes WHERE nome_lote = ? AND produto_id = ?`;

  connection.query(checkQuery, [lote, id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      throw error;
    }

    if (results.length > 0) {
      const loter = results[0];
      if (loter.quantidade < quantidade) {
        return res.status(400).json({ error: "Quantidade insuficiente no lote" });
      }

      const updateQuery = `UPDATE lotes SET quantidade = quantidade - ? WHERE id = ?`;
      connection.query(
        updateQuery,
        [quantidade, parseInt(loter.id)],
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
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
