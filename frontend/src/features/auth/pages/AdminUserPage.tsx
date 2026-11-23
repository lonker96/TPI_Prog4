import { useEffect, useState } from 'react';
import { api } from '@/shared';
import type { UsuarioAuth } from '../types/auth.types';

export const AdminUsersPage = () => {
  const [usuarios, setUsuarios] = useState<UsuarioAuth[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUsuarios = async () => {
    try {
      const res = await api.get<UsuarioAuth[]>('/admin/usuarios/');
      setUsuarios(res.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al cargar los usuarios.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleToggleStatus = async (id: number, isDeleted: boolean) => {
    try {
      const endpoint = isDeleted
        ? `/admin/usuarios/${id}/activar`
        : `/admin/usuarios/${id}/desactivar`;
      await api.post(endpoint);
      fetchUsuarios();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Error al cambiar el estado del usuario.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-500 dark:bg-slate-950 dark:text-slate-400 p-8 text-center transition-colors">
        Cargando usuarios...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950 p-8 text-center transition-colors">
        <div className="max-w-xl mx-auto p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 transition-colors">
      <div className="container mx-auto p-6">
        <h1 className="mb-6 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Administración de Usuarios
        </h1>

        <div className="overflow-x-auto rounded-lg shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-800">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Nombre y Apellido
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Roles
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-800">
              {usuarios.map((u) => {
                const isDisabled = Boolean(u.deleted_at);
                return (
                  <tr
                    key={u.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-slate-100">
                      {u.nombre} {u.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {u.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-300">
                      {u.roles.join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          isDisabled
                            ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                            : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
                        }`}
                      >
                        {isDisabled ? 'Desactivado' : 'Activo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleToggleStatus(u.id, isDisabled)}
                        className={`px-3 py-1 rounded text-white text-xs font-semibold cursor-pointer ${
                          isDisabled
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {isDisabled ? 'Activar' : 'Desactivar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};