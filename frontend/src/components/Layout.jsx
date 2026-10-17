import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import { btnSecundario } from '../ui.js'

const link = ({ isActive }) =>
  `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
  }`

export default function Layout() {
  const { usuario, esAdmin, logout } = useAuth()
  const navigate = useNavigate()

  const salir = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen md:flex">
      <aside className="bg-tinta px-4 py-5 md:w-60 md:shrink-0">
        <div className="mb-6 px-1">
          <p className="text-lg font-bold leading-tight text-white">Bitácora de Redes y Equipos</p>
          <p className="mt-1 text-xs text-white/60">Historial de configuraciones</p>
        </div>
        <nav className="flex gap-2 md:block md:space-y-1">
          <NavLink to="/equipos" className={link}>Equipos</NavLink>
          <NavLink to="/categorias" className={link}>Categorías</NavLink>
        </nav>
        <div className="mt-6 border-t border-white/15 pt-4 md:mt-10">
          <p className="text-sm font-medium text-white">{usuario?.nombreUsuario}</p>
          <p className="mb-3 text-xs text-white/60">
            {esAdmin ? 'Administrador técnico' : 'Solo lectura'}
          </p>
          <button onClick={salir} className={`${btnSecundario} w-full`}>Cerrar sesión</button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 md:px-10 md:py-8">
        <Outlet />
      </main>
    </div>
  )
}
