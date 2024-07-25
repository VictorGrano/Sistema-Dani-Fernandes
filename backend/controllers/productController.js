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
};;
