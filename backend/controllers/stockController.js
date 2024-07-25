const connection = require("../database");

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

// Adicione outras funções relacionadas a estoque aqui
