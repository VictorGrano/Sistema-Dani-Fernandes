import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '../src/Dashboard';
import EtiquetaInsumo from '../src/EtiquetaInsumo';
import EtiquetaProduto from '../src/EtiquetaProduto';
import Login from '../src/Login';

// Função para verificar se o usuário está autenticado
function PrivateRoute({ element: Element }) {
  const isAuthenticated = !!localStorage.getItem('token');
  return isAuthenticated ? <Element /> : <Navigate to="/Login" />;
}

function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PrivateRoute element={Dashboard} />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/etiquetaProduto" element={<PrivateRoute element={EtiquetaProduto} />} />
      <Route path="/etiquetaInsumo" element={<PrivateRoute element={EtiquetaInsumo} />} />
    </Routes>
  );
}

export default MainRoutes;