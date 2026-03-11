// web-admin/src/pages/Cobros.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Cobros() {
  const navigate = useNavigate();
  const [cobros, setCobros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCobros = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token) return navigate('/login');

    try {
      const res = await axios.get('http://localhost:3000/api/debts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCobros(res.data.debts);
    } catch (err) {
      console.error("Error cargando los cobros", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCobros();
  }, [navigate]);

  const handlePagar = async (cobroId: string) => {
      const montoStr = window.prompt("¿De cuánto es la cuota/abono que el cliente te está entregando? (Ej: 5000)");
      if (!montoStr) return;

      const token = localStorage.getItem('saas_token');
      try {
        const res = await axios.post(`http://localhost:3000/api/debts/${cobroId}/payments`, {
          amount: montoStr
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(res.data.message);
        fetchCobros(); 
      } catch (err: any) {
        alert(err.response?.data?.error || "Error al registrar el pago");
      }
    };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">💰 Control de Cobros</h1>
          <Link to="/dashboard" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
            Volver al Dashboard
          </Link>
        </div>

        {/* Tabla de Cobros */}
        <div className="bg-white p-6 rounded-xl shadow overflow-hidden">
          {loading ? (
            <p className="text-center text-gray-500 py-8">Buscando el dinero en la calle...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Cliente</th>
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Descripción</th>
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Monto Total</th>
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Estado</th>
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {cobros.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-500">
                        No hay cobros registrados aún. ¡Ve a la sección de Clientes y presta algo de dinero!
                      </td>
                    </tr>
                  ) : (
                    cobros.map(cobro => (
                      <tr key={cobro.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">
                          {cobro.customer?.name || 'Cliente Eliminado'}
                        </td>
                        <td className="py-3 px-4">
                            <p className="font-bold text-gray-800">Total: ${cobro.amount.toLocaleString()}</p>
                            <p className="text-xs text-blue-600 font-bold mt-1">
                              Pagado: ${cobro.amountPaid?.toLocaleString() || 0}
                            </p>
                        </td>
                        <td className="py-3 px-4">
                          {cobro.status === 'PENDING' ? (
                            <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded-full">
                              ⏳ PENDIENTE
                            </span>
                          ) : (
                            <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full">
                              ✅ PAGADO
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {cobro.status === 'PENDING' && (
                            <button 
                              onClick={() => handlePagar(cobro.id)}
                              className="bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-3 py-1 rounded shadow transition-colors"
                            >
                              Recibir Pago
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}