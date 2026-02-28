// web-admin/src/pages/Dashboard.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Al cargar la página, buscamos el token
    const token = localStorage.getItem('saas_token');
    
    if (!token) {
      // Si no hay token (no se ha logueado), lo pateamos al Login
      navigate('/login');
      return;
    }

    // Si hay token, vamos al backend a pedir la plata
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
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Mi Negocio</h1>
          <button 
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded shadow"
          >
            Cerrar Sesión
          </button>
        </div>

        {error ? (
          <p className="text-red-500">{error}</p>
        ) : !metrics ? (
          <p className="text-gray-500 text-xl">Cargando tus millones...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Tarjeta 1: Clientes */}
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-500">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Total Clientes</h3>
              <p className="text-3xl font-bold text-gray-800 mt-2">{metrics.totalCustomers}</p>
            </div>

            {/* Tarjeta 2: Dinero Cobrado */}
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-500">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Dinero en Caja</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                ${metrics.totalCollected.toLocaleString()}
              </p>
            </div>

            {/* Tarjeta 3: Dinero en la Calle */}
            <div className="bg-white p-6 rounded-xl shadow border-l-4 border-orange-500">
              <h3 className="text-gray-500 text-sm font-bold uppercase">Dinero por Cobrar</h3>
              <p className="text-3xl font-bold text-orange-500 mt-2">
                ${metrics.totalPending.toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}