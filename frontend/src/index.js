import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './axiosConfig';
import reportWebVitals from '../src/reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import MainRoutes from './Routes';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
  <MainRoutes/>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
