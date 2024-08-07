import {Routes, Route} from 'react-router-dom';
import Login from './Pages/Login';
import App from './App';

function MainRoutes () {
    return (
        <Routes>
            <Route path='/' element={<Login/>} />
            <Route path='/Etiquetas' element={<App/>} />
        </Routes>
    )
}

export default MainRoutes;