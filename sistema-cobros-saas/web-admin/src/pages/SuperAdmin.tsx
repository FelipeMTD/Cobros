// web-admin/src/pages/SuperAdmin.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function SuperAdmin() {
  const navigate = useNavigate();
  const [empresas, setEmpresas] = useState<any[]>([]);
  const [errorDenegado, setErrorDenegado] = useState(false);

  const fetchEmpresas = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token) return navigate('/login');

    try {
      const res = await axios.get('http://localhost:3000/api/tenants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEmpresas(res.data.tenants);
      setErrorDenegado(false);
    } catch (err: any) {
      if (err.response?.status === 403) {
        setErrorDenegado(true);
      }
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, [navigate]);

  const handleCambiarEstado = async (id: string, estadoActual: boolean) => {
    const token = localStorage.getItem('saas_token');
    const confirmacion = window.confirm(`¿Estás seguro de que deseas ${estadoActual ? 'SUSPENDER' : 'ACTIVAR'} esta empresa? Todo su equipo perderá el acceso.`);
    if (!confirmacion) return;

    try {
      await axios.patch(`http://localhost:3000/api/tenants/${id}/status`, {
        isActive: !estadoActual
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEmpresas();
    } catch (err) {
      alert("Error al cambiar estado");
    }
  };

  const handleHack = async () => {
    const token = localStorage.getItem('saas_token');
    try {
      await axios.patch('http://localhost:3000/api/tenants/hack-superadmin', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("👑 Código aceptado: Eres el Dueño del SaaS ahora. Vuelve a iniciar sesión para que el sistema reconozca tu nuevo rango.");
      localStorage.removeItem('saas_token');
      navigate('/login');
    } catch (err) {
      alert("Error en el hack");
    }
  };

  const handleEjecutarMora = async () => {
    const token = localStorage.getItem('saas_token');
    try {
      const res = await axios.post('http://localhost:3000/api/debts/process-mora', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert(res.data.message);
    } catch (err) {
      alert("Error al ejecutar el motor de mora");
    }
  };
  // 🛡️ PANTALLA DE BLOQUEO PARA USUARIOS NORMALES
  if (errorDenegado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl shadow-2xl text-center max-w-md border-t-4 border-red-500">
          <h1 className="text-6xl mb-4">🛑</h1>
          <h2 className="text-2xl font-black text-gray-800 mb-2">Acceso Restringido</h2>
          <p className="text-gray-600 mb-8">Esta es la Bóveda del Super Admin. Tu cuenta actual no tiene los permisos necesarios.</p>
          
          <button onClick={handleHack} className="bg-black hover:bg-gray-800 text-white font-mono font-bold py-3 px-6 rounded w-full transition-all shadow-[0_0_15px_rgba(0,0,0,0.3)]">
            &gt; Ejecutar Hack: Ser Super Admin
          </button>
          
          <div className="mt-4">
            <Link to="/dashboard" className="text-blue-500 hover:underline text-sm">Volver a mi negocio</Link>
          </div>
        </div>
      </div>
    );
  }

  // 👑 PANTALLA DEL DUEÑO DEL SOFTWARE
  return (
    <div className="min-h-screen bg-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <button 
            onClick={handleEjecutarMora}
            className="mt-4 bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-2 px-4 rounded shadow-[0_0_15px_rgba(202,138,4,0.4)] transition-all"
            >
            ⚡ Simular Fin de Día (Ejecutar Motor de Mora)
            </button>
            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
              👑 Bóveda SaaS
            </h1>
            <p className="text-slate-400 mt-2">Panel de Control Global</p>
          </div>
          <Link to="/dashboard" className="bg-slate-800 hover:bg-slate-700 text-white border border-slate-600 px-6 py-2 rounded-full shadow-lg transition-colors">
            Volver
          </Link>
        </div>

        <div className="bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-700">
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900/80 border-b border-slate-700">
                <th className="py-4 px-6 text-sm font-bold text-slate-300">Empresa Cliente</th>
                <th className="py-4 px-6 text-sm font-bold text-slate-300">ID del Servidor</th>
                <th className="py-4 px-6 text-sm font-bold text-slate-300">Estado</th>
                <th className="py-4 px-6 text-sm font-bold text-slate-300 text-right">Acción Crítica</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map(empresa => (
                <tr key={empresa.id} className="border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="py-4 px-6">
                    <p className="font-bold text-white text-lg">{empresa.name}</p>
                    <p className="text-sm text-slate-400">Plan: {empresa.plan}</p>
                  </td>
                  <td className="py-4 px-6 text-slate-500 font-mono text-xs">{empresa.id}</td>
                  <td className="py-4 px-6">
                    {empresa.isActive ? (
                      <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-bold border border-green-500/30">
                        🟢 ONLINE
                      </span>
                    ) : (
                      <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-xs font-bold border border-red-500/30">
                        🔴 SUSPENDIDA
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <button 
                      onClick={() => handleCambiarEstado(empresa.id, empresa.isActive)}
                      className={`font-bold text-sm px-4 py-2 rounded transition-all shadow-lg ${
                        empresa.isActive 
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500' 
                          : 'bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white border border-green-500'
                      }`}
                    >
                      {empresa.isActive ? '🛑 Suspender' : '✅ Reactivar'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}