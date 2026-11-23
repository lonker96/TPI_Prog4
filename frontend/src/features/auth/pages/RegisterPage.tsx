import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '@/shared';

export const RegisterPage = () => {
  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    email: '',
    celular: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await api.post('/auth/register', {
        ...form,
        celular: form.celular || null,
      });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Error al registrarse. Verifique los datos.');
    } finally {
      setLoading(false);
    }
  };

  const inputClasses =
    'mt-1 w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 p-2 focus:border-indigo-500 focus:outline-none';
  const labelClasses = 'block text-sm font-medium text-slate-700 dark:text-slate-300';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8 transition-colors">
      <div className="w-full max-w-md rounded-lg bg-white dark:bg-slate-900 p-8 shadow-md border border-slate-200 dark:border-slate-800">
        <h2 className="mb-6 text-center text-2xl font-bold text-slate-900 dark:text-slate-100">
          Registro - Food Store
        </h2>

        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 dark:bg-red-950/50 dark:border-red-900 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClasses}>Nombre</label>
            <input
              type="text"
              name="nombre"
              required
              value={form.nombre}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Apellido</label>
            <input
              type="text"
              name="apellido"
              required
              value={form.apellido}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Email</label>
            <input
              type="email"
              name="email"
              required
              value={form.email}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Celular (Opcional)</label>
            <input
              type="text"
              name="celular"
              value={form.celular}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <div>
            <label className={labelClasses}>Contraseña (Mínimo 8 caracteres)</label>
            <input
              type="password"
              name="password"
              required
              minLength={8}
              value={form.password}
              onChange={handleChange}
              className={inputClasses}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-md bg-green-600 py-2 text-white font-semibold hover:bg-green-700 disabled:bg-green-400 dark:disabled:bg-green-800 cursor-pointer transition-colors"
          >
            {loading ? 'Registrando...' : 'Registrarse'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-600 dark:text-slate-400">
          ¿Ya tienes cuenta?{' '}
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};