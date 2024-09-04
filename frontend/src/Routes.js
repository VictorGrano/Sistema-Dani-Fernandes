import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../src/Dashboard';
import EtiquetaInsumo from '../src/EtiquetaInsumo';
import EtiquetaProduto from '../src/EtiquetaProduto';
import Login from '../src/Login';
import ListaProdutos from './ListaProdutos';
import ListaInsumos from './ListaInsumos';
import ListaLotes from './ListaLotes';
import Historico from './Historico';

// Função para verificar se o usuário está autenticado
function PrivateRoute({ element: Element }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Element /> : <Navigate to="/Login" />;
}

// Função para verificar se o usuário é administrador
function AdminRoute({ element: Element }) {
  const isAuthenticated = !!localStorage.getItem('token');
  const tipoUsuario = localStorage.getItem('tipoUsuario'); // Verifica o tipo de usuário
  return isAuthenticated && tipoUsuario === 'admin' ? (
    <Element />
  ) : (
    <Navigate to="/" /> // Redireciona para a página principal se não for admin
  );
}

function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute element={Dashboard} />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/etiquetaProduto" element={<PrivateRoute element={EtiquetaProduto} />} />
      <Route path="/etiquetaInsumo" element={<PrivateRoute element={EtiquetaInsumo} />} />
      <Route path="/ListaProdutos" element={<AdminRoute element={ListaProdutos} />} />
      <Route path="/ListaLotes" element={<AdminRoute element={ListaLotes} />} />
      <Route path="/ListaInsumos" element={<AdminRoute element={ListaInsumos} />} />
      <Route path="/Historico" element={<AdminRoute element={Historico} />} />
      
    </Routes>
  );
}

export default MainRoutes;
