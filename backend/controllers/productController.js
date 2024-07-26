const connection = require("../database");

//Seleciona Todos os Produtos
exports.getAllProducts = (req, res) => {
  connection.query("SELECT * FROM produtos", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
};

//Pega os detalhes do produto selecionado
exports.getInfoProduto = (req, res) => {
  const { id } = req.query;
  const q = "SELECT * FROM produtos WHERE id = ?";

  connection.query(q, [id], (error, produtoResults) => {
    if (error) throw error;

    if (produtoResults.length > 0) {
      const produto = produtoResults[0];
      const q2 = "SELECT nome_aroma FROM aromas WHERE cod_aroma = ?";
      const q3 = "SELECT nome_categoria, sigla FROM tipo_produto WHERE id = ?";
      const q4 = "SELECT SUM(quantidade_caixas) AS total_caixas FROM lotes WHERE produto_id = ?";

      connection.query(q2, [produto.cod_aroma], (error, aromaResults) => {
        if (error) throw error;
        if (aromaResults.length > 0) {
          produto.nome_aroma = aromaResults[0].nome_aroma;
        } else {
          produto.nome_aroma = null;
        }

        connection.query(q3, [produto.categoria_id], (error, tipoResults) => {
          if (error) throw error;
          if (tipoResults.length > 0) {
            produto.categoria = tipoResults[0].nome_categoria;
            produto.sigla = tipoResults[0].sigla;
          } else {
            produto.categoria = null;
            produto.sigla = null;
          }

          connection.query(q4, [produto.id], (error, lotesResults) => {
            if (error) throw error;
            produto.total_caixas = lotesResults[0].total_caixas || 0;

            res.json(produto);
          });
        });
      });
    } else {
      res.status(404).json({ error: "Produto não encontrado" });
    }
  });
};

exports.getLotes = (req, res) => {
  const { produto_id } = req.query;
  const q = "SELECT * FROM lotes WHERE produto_id = ? AND quantidade > 0";

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
};
