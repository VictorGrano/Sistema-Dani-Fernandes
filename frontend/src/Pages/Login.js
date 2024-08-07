import React, { useEffect, useState } from "react";
import "../styles/Login.css";

function Login() {
  return (
    <div className="loginContainer">
      <main>
        <form>
          <div className="Card">
            <h1>Login - Dani Fernandes</h1>
            <label>Login:</label>
            <br/>
            <input/>
            <br/>
            <label>Senha:</label>
            <br/>
            <input/>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Login;
