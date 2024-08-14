import React, { useEffect, useState } from "react";
// import "./styles/Login.css";

function Login () {

  const apiUrl = process.env.REACT_APP_API_URL;

  return (
    <div className="App">
      <header className="App-header">
        <p className="Titulo">
          Login
        </p>
      </header>
      <main>
        <form>
          <label htmlFor="insumo-select">
           Usuário:
          </label>
          <br/>
          <input />
          <br/>
          <label>
            Digite a quantidade de unidades por caixa:
          </label>
          <br />
        </form>
      </main>
    </div>
  );
}

export default Login;