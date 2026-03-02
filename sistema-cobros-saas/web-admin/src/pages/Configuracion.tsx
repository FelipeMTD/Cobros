// web-admin/src/pages/Configuracion.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Configuracion() {
  const navigate = useNavigate();
  
  // Estados para nuestros valores
  const [tasaInteres, setTasaInteres] = useState(20);
  const [limiteCreditos, setLimiteCreditos] = useState(2);
  const [cobrarMora, setCobrarMora] = useState(true);
  const [excluirDomingos, setExcluirDomingos] = useState(true);
  const [excluirFestivos, setExcluirFestivos] = useState(true);
  // Estados de la UI
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('saas_token');
    if (!token) {
    navigate('/login');
    return;
    }

    const fetchConfig = async () => {
      try {
        const res = await axios.get('http://localhost:3000/api/config', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const config = res.data.config;
        setTasaInteres(config.tasaInteres);
        setLimiteCreditos(config.limiteCreditos);
        setCobrarMora(config.cobrarMora);
        setExcluirDomingos(config.excluirDomingos);
        setExcluirFestivos(config.excluirFestivos);
      } catch (err) {
        setMensaje('Error al cargar la configuración');
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, [navigate]);

  const handleGuardar = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMensaje('');
    const token = localStorage.getItem('saas_token');

    try {
      await axios.patch('http://localhost:3000/api/config', {
        tasaInteres: Number(tasaInteres),
        limiteCreditos: Number(limiteCreditos),
        cobrarMora,
        excluirDomingos,
        excluirFestivos
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMensaje('✅ Reglas actualizadas correctamente');
    } catch (err) {
      setMensaje('❌ Error al guardar las reglas');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando motor de reglas...</div>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Cabecera con botón de volver */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">⚙️ Configuración</h1>
            <p className="text-gray-500">Ajusta las reglas financieras de tu negocio</p>
          </div>
          <Link to="/dashboard" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
            Volver al Dashboard
          </Link>
        </div>

        {/* Alertas */}
        {mensaje && (
          <div className={`p-4 mb-6 rounded ${mensaje.includes('✅') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {mensaje}
          </div>
        )}

        {/* Formulario Principal */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <form onSubmit={handleGuardar} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tasa de Interés */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Tasa de Interés (%)</label>
                <input 
                  type="number" step="0.1" 
                  value={tasaInteres} 
                  onChange={(e) => setTasaInteres(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Porcentaje de ganancia sobre préstamos.</p>
              </div>

              {/* Límite de Créditos */}
              <div>
                <label className="block text-gray-700 font-bold mb-2">Máx. Créditos por Cliente</label>
                <input 
                  type="number" 
                  value={limiteCreditos} 
                  onChange={(e) => setLimiteCreditos(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                />
                <p className="text-xs text-gray-400 mt-1">Límite de deudas activas simultáneas.</p>
              </div>
            </div>

            <hr className="my-6" />

            {/* Switches / Checkboxes */}
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={cobrarMora} 
                  onChange={(e) => setCobrarMora(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="text-gray-700 font-medium">Activar cobro por Mora (Días de retraso)</span>
              </label>

              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={excluirDomingos} 
                  onChange={(e) => setExcluirDomingos(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="text-gray-700 font-medium">Excluir Domingos del cálculo de mora</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={excluirFestivos} 
                  onChange={(e) => setExcluirFestivos(e.target.checked)}
                  className="h-5 w-5 text-blue-600 rounded"
                />
                <span className="text-gray-700 font-medium">Excluir Festivos del cálculo de mora (Motor Colombia)</span>
              </label>
            </div>

            <div className="pt-4">
              <button 
                type="submit" 
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:bg-blue-300"
              >
                {saving ? 'Guardando...' : '💾 Guardar Reglas'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}