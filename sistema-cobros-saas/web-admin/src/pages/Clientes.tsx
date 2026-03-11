// web-admin/src/pages/Clientes.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Clientes() {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('saas_role');

  const [clientes, setClientes] = useState<any[]>([]);
  
  // Estados para el formulario
  const [nombre, setNombre] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Cargar clientes al inicio
  const fetchClientes = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token) return navigate('/login');

    try {
      const res = await axios.get('http://localhost:3000/api/customers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setClientes(res.data.customers);
    } catch (err) {
      console.error("Error cargando clientes", err);
    }
  };

  useEffect(() => {
    fetchClientes();
  }, [navigate]);

  // Guardar un nuevo cliente
  const handleCrearCliente = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('saas_token');

    try {
      await axios.post('http://localhost:3000/api/customers', {
        name: nombre,
        phone: telefono,
        email: email
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Limpiar formulario y recargar lista
      setNombre(''); setTelefono(''); setEmail('');
      fetchClientes();
    } catch (err) {
      alert("Error al crear cliente");
    } finally {
      setLoading(false);
    }
  };

// Lógica para registrar un nuevo préstamo
  const handlePrestar = async (clienteId: string, clienteNombre: string) => {
    // 1. Preguntamos cuánto dinero quiere prestar
    const montoStr = window.prompt(`¿Cuánto dinero le vas a prestar a ${clienteNombre}? (Ej: 100000)`);
    if (!montoStr) return; // Si cancela, no hacemos nada

    const monto = parseFloat(montoStr);
    if (isNaN(monto) || monto <= 0) {
      return alert("❌ Monto inválido. Debes ingresar números mayores a 0.");
    }

    const token = localStorage.getItem('saas_token');
    try {
      // 2. Enviamos la orden al backend (¡que aplicará los intereses automáticamente!)
      const res = await axios.post('http://localhost:3000/api/debts', {
        description: "Préstamo desde Panel Web",
        amount: monto,
        customerId: clienteId
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Mostramos la magia
      const detalle = res.data.detalle;
      alert(`✅ ¡Préstamo Registrado!\n\nCapital: $${detalle.capitalPrestado}\nTasa Aplicada: ${detalle.tasaAplicada}\nDEUDA TOTAL CREADA: $${detalle.totalACobrar}`);
      
    } catch (err) {
      alert("❌ Error al registrar el préstamo");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">👥 Mis Clientes</h1>
          <Link to="/dashboard" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
            Volver al Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Panel Izquierdo: Formulario (Condicional) */}
          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-bold text-blue-600 mb-4">Nuevo Cliente</h2>
            
            {(userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') ? (
              <form onSubmit={handleCrearCliente} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Nombre Completo *</label>
                  <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500" placeholder="Ej. Juan Pérez" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Teléfono</label>
                  <input type="text" value={telefono} onChange={e => setTelefono(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500" placeholder="Ej. 3001234567" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Correo (Opcional)</label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded focus:outline-none focus:border-blue-500" placeholder="juan@correo.com" />
                </div>
                <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded">
                  {loading ? 'Guardando...' : '➕ Registrar Cliente'}
                </button>
              </form>
            ) : (
              <div className="text-center p-6 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-4xl mb-3">🔒</p>
                <p className="text-blue-800 font-bold mb-2">Acceso Restringido</p>
                <p className="text-sm text-blue-600">Solo el administrador de la agencia puede registrar nuevos clientes.</p>
                <p className="text-xs text-blue-500 mt-4">Tu función es asignar préstamos y registrar los recaudos.</p>
              </div>
            )}
          </div>

          {/* Panel Derecho: Tabla de Clientes */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Directorio ({clientes.length})</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Nombre</th>
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Teléfono</th>
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {clientes.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-gray-500">Aún no tienes clientes registrados.</td>
                    </tr>
                  ) : (
                    clientes.map(cliente => (
                      <tr key={cliente.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium text-gray-800">{cliente.name}</td>
                        <td className="py-3 px-4 text-gray-600">{cliente.phone || 'N/A'}</td>
                        <td className="py-3 px-4">
                            <button 
                            onClick={() => handlePrestar(cliente.id, cliente.name)}
                            className="text-green-600 hover:text-green-800 font-bold text-sm bg-green-100 px-3 py-1 rounded-full hover:bg-green-200 transition-colors"
                            >
                            💵 Prestar
                            </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}