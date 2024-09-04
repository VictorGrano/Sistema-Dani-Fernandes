import React, { useState } from "react";
import axios from "axios";
import "./styles/Login.css";
import { useNavigate } from "react-router-dom"; 

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const apiUrl = process.env.REACT_APP_API_URL; // Certifique-se de definir esta variável em um arquivo .env
  const navigate = useNavigate(); // Defina o hook useNavigate

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(`${apiUrl}/usuarios/Login`, {
        user: username,
        senha: password,
      });

      if (response.data.token) {
        // Login bem-sucedido, armazenar o token
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("tipoUsuario", response.data.usuario.tipo);

        // Configurando o interceptor para incluir o token em todas as requisições
        axios.interceptors.request.use(
          (config) => {
            const token = localStorage.getItem("token"); // Pegando o token do localStorage
            if (token) {
              config.headers["x-access-token"] = token; // Adiciona o token ao header x-access-token
            }
            return config;
          },
          (error) => {
            return Promise.reject(error);
          }
        );
        navigate("/");
      } else {
        setError(response.data.error || "Erro ao autenticar");
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setError("Erro no servidor ou credenciais inválidas");
    }
  };

  return (
    <body className="loginBody">
    <div className="login-container">
      <header className="login-header">
        <h1>Login</h1>
      </header>
      <main>
        <form onSubmit={handleLogin} className="login-form" autoComplete="off">
          <div className="form-group">
            <label htmlFor="username">Usuário:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Senha:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}
          <div>
          <button type="submit" className="login-button">
            Entrar
          </button>
          </div>
        </form>
      </main>
    </div>
    </body>
  );
}

export default Login;
