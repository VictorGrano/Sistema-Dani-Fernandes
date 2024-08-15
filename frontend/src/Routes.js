import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './Dashboard';
import EtiquetaInsumo from './EtiquetaInsumo';
import EtiquetaProduto from './EtiquetaProduto';
import Login from './Login';

// Função para verificar se o usuário está autenticado
function PrivateRoute({ element: Element }) {
  const isAuthenticated = !!localStorage.getItem('token');
  
  return isAuthenticated ? <Element /> : <Navigate to="/" />;
}

function MainRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/Dashboard" element={<PrivateRoute element={Dashboard} />} />
      <Route path="/etiquetaProduto" element={<PrivateRoute element={EtiquetaProduto} />} />
      <Route path="/etiquetaInsumo" element={<PrivateRoute element={EtiquetaInsumo} />} />
    </Routes>
  );
}

export default MainRoutes;