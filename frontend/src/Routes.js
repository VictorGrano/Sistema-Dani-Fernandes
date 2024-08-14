import {Routes, Route} from 'react-router-dom';
import App from './App';
import EtiquetaInsumo from './EtiquetaInsumo';
import Login from './Login';

function MainRoutes () {
    return (
        <Routes>
            <Route path='/' element={<App/>} />
            <Route path='/Login' element={<Login/>} />
            <Route path='/etiquetaInsumo' element={<EtiquetaInsumo/>} />
        </Routes>
    )
}

export default MainRoutes;