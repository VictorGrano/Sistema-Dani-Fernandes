import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './styles/App.css';

function Login() {

    return(
        <div className='Login'>
            <header>
                Login
            </header>
            <main>
                <form>
                    <label>
                    Login:
                    </label>
                    <br/>
                    <input></input>
                    <br/>
                    <label>
                    Senha:
                    </label>
                </form>
            </main>
        </div>
    )
}

export default Login;