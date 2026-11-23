import { Link } from 'react-router-dom';

export const UnauthorizedPage = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-red-600">Acceso Denegado</h1>
      <p className="mt-2 text-gray-600">No cuentas con los permisos necesarios para acceder a esta sección.</p>
      <Link
        to="/categories"
        className="mt-6 rounded-md bg-indigo-600 px-4 py-2 text-white font-semibold hover:bg-indigo-700"
      >
        Volver al inicio
      </Link>
    </div>
  );
};