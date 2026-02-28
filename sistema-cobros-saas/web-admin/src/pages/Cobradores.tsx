// web-admin/src/pages/Cobradores.tsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Cobradores() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<any[]>([]);
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PRESTAMISTA');
  const [loading, setLoading] = useState(false);

  const fetchUsuarios = async () => {
    const token = localStorage.getItem('saas_token');
    if (!token) return navigate('/login');

    try {
      const res = await axios.get('http://localhost:3000/api/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsuarios(res.data.users);
    } catch (err) {
      console.error("Error cargando usuarios", err);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, [navigate]);

  const handleCrearUsuario = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = localStorage.getItem('saas_token');

    try {
      await axios.post('http://localhost:3000/api/users', {
        email, password, role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("✅ Usuario creado con éxito. Ya puede iniciar sesión en la App Móvil.");
      setEmail(''); setPassword(''); setRole('PRESTAMISTA');
      fetchUsuarios();
    } catch (err: any) {
      alert(err.response?.data?.error || "Error al crear usuario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">🛵 Mi Equipo</h1>
          <Link to="/dashboard" className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded shadow">
            Volver al Dashboard
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Panel Izquierdo: Formulario */}
          <div className="bg-white p-6 rounded-xl shadow h-fit">
            <h2 className="text-xl font-bold text-indigo-600 mb-4">Nuevo Empleado</h2>
            <form onSubmit={handleCrearUsuario} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Correo Electrónico *</label>
                <input required type="email" value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-indigo-500" placeholder="cobrador@empresa.com" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Contraseña Temporal *</label>
                <input required type="text" value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:border-indigo-500" placeholder="123456" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Rol</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="w-full px-3 py-2 border rounded focus:outline-none focus:border-indigo-500">
                  <option value="PRESTAMISTA">Prestamista (Cobrador en calle)</option>
                  <option value="ADMIN">Administrador (Acceso web)</option>
                </select>
              </div>
              <button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded">
                {loading ? 'Guardando...' : '➕ Crear Cuenta'}
              </button>
            </form>
          </div>

          {/* Panel Derecho: Tabla */}
          <div className="md:col-span-2 bg-white p-6 rounded-xl shadow overflow-hidden">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Usuarios del Sistema</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Correo</th>
                    <th className="py-3 px-4 text-sm font-bold text-gray-600">Rol</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map(user => (
                    <tr key={user.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-800">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                          {user.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}