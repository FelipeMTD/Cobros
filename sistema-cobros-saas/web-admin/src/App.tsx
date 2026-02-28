// web-admin/src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard'; // <-- IMPORTAMOS EL DASHBOARD
import Configuracion from './pages/Configuracion'; // <-- ¿ESTÁ ESTO?
import Clientes from './pages/Clientes'; // <-- Importa esto arriba
import Cobros from './pages/Cobros';
import Cobradores from './pages/Cobradores';
import SuperAdmin from './pages/SuperAdmin'; 

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* <-- AGREGAMOS LA RUTA */}
        <Route path="/configuracion" element={<Configuracion />} /> {/* <-- ¿ESTÁ ESTO? */}
        <Route path="/clientes" element={<Clientes />} /> {/* <-- Agrega esta línea */}
        <Route path="/cobros" element={<Cobros />} />
        <Route path="/cobradores" element={<Cobradores />} />
        <Route path="/superadmin" element={<SuperAdmin />} />
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;