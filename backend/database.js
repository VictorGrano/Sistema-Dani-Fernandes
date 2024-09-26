const mysql = require("mysql");
const config = require("./config");

const connection = mysql.createConnection(config.database);

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.stack);
    return;
  }
  console.log("Conectado ao banco de dados como id " + connection.threadId);

  // Mantendo a conexão ativa
  setInterval(function () {
    connection.query('SELECT 1', (error) => {
      if (error) {
        console.error('Erro ao executar keep-alive query:', error);
      }
    });
  }, 5000); // Executa a cada 5 segundos
});

module.exports = connection;
