const connection = require("../database");

//Seleciona Todos os Produtos
exports.getAllProducts = (req, res) => {
  const query = `
    SELECT 
      p.id, p.nome, p.descricao, p.estoque_total, p.preco, p.unidade, p.categoria_id, p.cod_aroma,
      a.nome_aroma, 
      t.nome_categoria, t.sigla, 
      COALESCE(SUM(l.quantidade_caixas), 0) AS total_caixas
    FROM 
      produtos p
    LEFT JOIN 
      aromas a ON p.cod_aroma = a.cod_aroma
    LEFT JOIN 
      tipo_produto t ON p.categoria_id = t.id
    LEFT JOIN 
      lotes l ON p.id = l.produto_id
    GROUP BY 
      p.id, a.nome_aroma, t.nome_categoria, t.sigla
  `;

  connection.query(query, (error, results) => {
    if (error) throw error;
    res.json(results);
  });
};

exports.getInfoProduto = (req, res) => {
  const { id } = req.query;
  const q = "SELECT * FROM produtos WHERE id = ?";

  connection.query(q, [id], (error, produtoResults) => {
    if (error) throw error;

    if (produtoResults.length > 0) {
      const produto = produtoResults[0];
      const q2 = "SELECT nome_aroma FROM aromas WHERE cod_aroma = ?";
      const q3 = "SELECT nome_categoria, sigla FROM tipo_produto WHERE id = ?";
      const q4 =
        "SELECT SUM(quantidade_caixas) AS total_caixas FROM lotes WHERE produto_id = ?";

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

exports.updateProduct = async (req, res) => {
  const { id, nome, descricao, estoque_total, preco, unidade, tipo, cod_aroma } = req.body;

  // Verifica se o nome do produto já existe, exceto para o produto atual
  const q1 = "SELECT * FROM produtos WHERE nome = ? AND id != ?";
  connection.query(q1, [nome, id], async (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.length > 0) {
      res.status(409).json({
        message: "Erro ao atualizar! Já existe um produto com este nome no sistema!",
      });
    } else {
      try {
        const q2 = "UPDATE produtos SET nome = ?, descricao = ?, categoria_id = ?,estoque_total = ?, preco = ?, unidade = ?, cod_aroma = ? WHERE id = ?";
        const params = [nome, descricao, tipo, estoque_total, preco, unidade, cod_aroma, id];

        connection.query(q2, params, (error, results) => {
          if (error) {
            console.error("Erro no servidor:", error);
            res.status(500).json({ error: "Erro no servidor" });
            return;
          }
          res.status(200).json({ message: "Produto atualizado com sucesso!" });
        });
      } catch (error) {
        console.error("Erro ao atualizar o produto:", error);
        res.status(500).json({ error: "Erro ao atualizar o produto" });
      }
    }
  });
};

exports.deleteProduct = (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM produtos WHERE id = ?";
  connection.query(query, [id], (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }
    if (results.affectedRows > 0) {
      res.status(200).json({ message: "Produto deletado com sucesso!" });
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

exports.getAromas = (req, res) => {
  connection.query("SELECT * FROM aromas ORDER BY nome_aroma", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
};

exports.getTipo = (req, res) => {
  connection.query("SELECT * FROM tipo_produto", (error, results) => {
    if (error) throw error;
    res.json(results);
  });
};

exports.getInfoAromas = (req, res) => {
  const { cod_aroma } = req.query;
  const q1 = "SELECT * FROM produtos WHERE cod_aroma = ?";
  const q2 = "SELECT nome_aroma FROM aromas WHERE cod_aroma = ?";
  const q3 = "SELECT nome_categoria FROM tipo_produto WHERE id = ?";

  // Promisify the query function
  const queryPromise = (query, params) => {
    return new Promise((resolve, reject) => {
      connection.query(query, params, (error, results) => {
        if (error) {
          return reject(error);
        }
        resolve(results);
      });
    });
  };

  (async () => {
    try {
      const productResults = await queryPromise(q1, [cod_aroma]);
      const aromaResults = await queryPromise(q2, [cod_aroma]);

      if (aromaResults.length > 0) {
        for (let product of productResults) {
          const tipoProdutoResults = await queryPromise(q3, [product.categoria_id]);

          if (tipoProdutoResults.length > 0) {
            product.categoria = tipoProdutoResults[0].nome_categoria;
          }

          product.nome_aroma = aromaResults[0].nome_aroma;
        }
      }

      res.json(productResults);
    } catch (error) {
      console.error("Erro ao buscar informações:", error);
      res.status(500).send("Erro ao buscar informações");
    }
  })();
};

exports.postRelatorioProdutos = (req, res) => {
  const { id, categoria_id, cod_aroma, preco } = req.body;
  let params = [];

  let q = `
    SELECT p.*, a.nome_aroma 
    FROM produtos p
    LEFT JOIN aromas a ON p.cod_aroma = a.cod_aroma
    WHERE 1=1
  `;

  if (id) {
    q += " AND p.id = ?";
    params.push(id);
  }
  if (categoria_id) {
    q += " AND p.categoria_id = ?";
    params.push(categoria_id);
  }

  if (cod_aroma) {
    q += " AND p.cod_aroma = ?";
    params.push(cod_aroma);
  }

  if (preco) {
    q += " AND p.preco = ?";
    params.push(preco);
  }

  connection.query(q, params, (error, results) => {
    if (error) {
      console.error("Erro no servidor:", error);
      res.status(500).json({ error: "Erro no servidor" });
      return;
    }

    res.json(results);
  });
};
