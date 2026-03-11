// web-admin/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('saas_token');
    if (!token) {
      navigate('/login');
      return;
    }

    const fetchDashboard = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/dashboard', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMetrics(response.data.metrics);
      } catch (err) {
        setError('Error al cargar los datos. Tu sesión pudo haber expirado.');
        localStorage.removeItem('saas_token');
        navigate('/login');
      }
    };

    fetchDashboard();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('saas_token');
    localStorage.removeItem('saas_role'); // <-- NUEVO
    navigate('/login');
  };
  const userRole = localStorage.getItem('saas_role');
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* CABECERA CON BOTONES CORRECTAMENTE UBICADOS */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mi Negocio</h1>

          <div className="flex space-x-3">
            
            {/* Solo el Dueño del SaaS ve la Bóveda */}
            {userRole === 'SUPER_ADMIN' && (
              <Link to="/superadmin" className="bg-purple-600 hover:bg-purple-700 text-white font-bold px-4 py-2 rounded shadow transition-colors">
                👑 Admin
              </Link>
            )}

            {/* Los Jefes de Agencia y el Dueño ven el Equipo y la Configuración */}
            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <>
                <Link to="/cobradores" className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold px-4 py-2 rounded shadow transition-colors">
                  🛵 Equipo
                </Link>
                <Link to="/configuracion" className="bg-blue-500 hover:bg-blue-600 text-white font-bold px-4 py-2 rounded shadow transition-colors">
                  ⚙️ Configuraciones
                </Link>
                <Link to="/cajas" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded shadow transition-colors">
                  🏦 Cajas
                </Link>

              </>
              
            )}

            {/* Todos (incluyendo los Prestamistas) ven los Clientes y Cobros */}
            <Link to="/clientes" className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-2 rounded shadow transition-colors">
              👥 Clientes
            </Link>
            <Link to="/cobros" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-4 py-2 rounded shadow transition-colors">
              💰 Cobros
            </Link>

            {/* Solo los Administradores ven la Bóveda */}
            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') && (
              <Link to="/cajas" className="bg-teal-500 hover:bg-teal-600 text-white font-bold px-4 py-2 rounded shadow transition-colors">
                🏦 Bóveda
              </Link>
            )}

            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white font-bold px-4 py-2 rounded shadow transition-colors">
              Cerrar Sesión
            </button>
          </div>


        </div>

        {/* MÉTRICAS */}
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : !metrics ? (
          <p className="text-gray-500 text-xl">Cargando tus millones...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Total Clientes</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.totalCustomers}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-bold uppercase">
                {userRole === 'PRESTAMISTA' ? 'Efectivo en mi Bolsillo' : 'Dinero en Caja Fuerte'}
              </h3>
              <p className="text-3xl font-bold text-green-600 mt-2">${metrics.totalCollected.toLocaleString()}</p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Dinero por Cobrar</h3>
              <p className="text-3xl font-bold text-orange-500 mt-2">${metrics.totalPending.toLocaleString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}