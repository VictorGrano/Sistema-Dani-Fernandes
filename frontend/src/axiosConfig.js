import axios from "axios";

// Configurando o interceptor globalmente
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
