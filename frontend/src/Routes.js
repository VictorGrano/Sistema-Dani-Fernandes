import {Routes, Route} from 'react-router-dom';
import App from './App';

function MainRoutes () {
    return (
        <Routes>
            <Route path='/' element={<App/>} />
        </Routes>
    )
}

export default MainRoutes;