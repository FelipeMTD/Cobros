// web-admin/src/pages/Cajas.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Cajas() {
  const navigate = useNavigate();
  const [tipoVista, setTipoVista] = useState('');
  
  // Estados del Jefe
  const [cajaGlobal, setCajaGlobal] = useState<any>(null);
  const [cobradores, setCobradores] = useState<any[]>([]);
  
  // Estado del Cobrador
  const [miCajaMenor, setMiCajaMenor] = useState<any>(null);

  const fetchCajas = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token) return navigate('/login');

    try {
      const res = await axios.get('http://localhost:3000/api/cajas', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setTipoVista(res.data.tipo);
      
      if (res.data.tipo === 'ADMIN') {
        setCajaGlobal(res.data.cajaGlobal);
        setCobradores(res.data.cobradores);
      } else {
        setMiCajaMenor(res.data.cajaMenor);
      }
    } catch (err) {
      alert("Error al cargar el módulo de cajas");
    }
  };

  useEffect(() => {
    fetchCajas();
  }, [navigate]);

  const handleFondear = async (userId: string, email: string) => {
    const montoStr = window.prompt(`¿Cuánto efectivo le vas a dar a ${email} para que salga a prestar?`);
    if (!montoStr) return;
    
    try {
      const token = localStorage.getItem('saas_token');
      const res = await axios.post('http://localhost:3000/api/cajas/fondear', {
        userId, amount: montoStr
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      fetchCajas();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al entregar dinero");
    }
  };

  const handleLiquidar = async (userId: string, email: string) => {
    const montoStr = window.prompt(`¿Cuánto efectivo te está entregando ${email} al volver de su ruta?`);
    if (!montoStr) return;
    
    try {
      const token = localStorage.getItem('saas_token');
      const res = await axios.post('http://localhost:3000/api/cajas/liquidar', {
        userId, amount: montoStr
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(res.data.message);
      fetchCajas();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al recibir dinero");
    }
  };

  if (!tipoVista) return <div className="p-8 text-center">Cargando la bóveda...</div>;

  // =========================================================
  // 🛵 VISTA DEL COBRADOR (PRESTAMISTA)
  // =========================================================
  if (tipoVista === 'PRESTAMISTA') {
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-md mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">💵 Mi Bolsillo</h1>
            <Link to="/dashboard" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">Volver</Link>
          </div>
          
          <div className="bg-orange-500 text-white p-8 rounded-xl shadow-lg text-center">
            <h2 className="text-lg font-bold uppercase tracking-widest opacity-90 mb-2">Efectivo en tu poder</h2>
            <p className="text-6xl font-black">${miCajaMenor?.balance?.toLocaleString() || 0}</p>
            <p className="text-sm mt-4 opacity-80">Este es el dinero de los abonos que has cobrado hoy o el saldo que te entregó el jefe para prestar. Debes entregarlo al final del día.</p>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================
  // 👑 VISTA DEL JEFE (ADMIN)
  // =========================================================
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🏦 Bóveda y Liquidación</h1>
          <Link to="/dashboard" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">Volver</Link>
        </div>

        <div className="bg-green-600 text-white p-8 rounded-xl shadow-lg mb-8 text-center">
          <h2 className="text-xl font-bold uppercase tracking-widest opacity-80 mb-2">Bóveda Principal (Oficina)</h2>
          <p className="text-5xl font-black">${cajaGlobal?.balance?.toLocaleString() || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Efectivo en la Calle (Cobradores)</h2>
          <table className="min-w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="py-3 px-4 text-sm font-bold text-gray-600">Cobrador</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-600">Dinero en el Bolsillo</th>
                <th className="py-3 px-4 text-sm font-bold text-gray-600 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cobradores.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-700">🛵 {c.email}</td>
                  <td className="py-4 px-4 font-black text-orange-600 text-lg">${c.cajaMenor?.balance?.toLocaleString() || 0}</td>
                  <td className="py-4 px-4 text-right space-x-2">
                    <button onClick={() => handleFondear(c.id, c.email)} className="bg-blue-100 text-blue-700 font-bold px-3 py-2 rounded text-sm hover:bg-blue-200">💸 Dar Billetes</button>
                    <button onClick={() => handleLiquidar(c.id, c.email)} className="bg-green-100 text-green-700 font-bold px-3 py-2 rounded text-sm hover:bg-green-200">📥 Recibir Cierre</button>
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