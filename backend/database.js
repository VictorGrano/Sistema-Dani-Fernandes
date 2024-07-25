const mysql = require("mysql");
const config = require("./config");

const connection = mysql.createConnection(config.database);

connection.connect((err) => {
  if (err) {
    console.error("Erro ao conectar ao banco de dados:", err.stack);
    return;
  }
  console.log("Conectado ao banco de dados como id " + connection.threadId);
});

module.exports = connection;
