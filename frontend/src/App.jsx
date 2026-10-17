import { Navigate, Route, Routes } from 'react-router-dom'
import { useAuth } from './auth.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Equipos from './pages/Equipos.jsx'
import EquipoDetalle from './pages/EquipoDetalle.jsx'
import Categorias from './pages/Categorias.jsx'

function Protegida({ children }) {
  const { usuario } = useAuth()
  return usuario ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protegida><Layout /></Protegida>}>
        <Route path="/equipos" element={<Equipos />} />
        <Route path="/equipos/:id" element={<EquipoDetalle />} />
        <Route path="/categorias" element={<Categorias />} />
      </Route>
      <Route path="*" element={<Navigate to="/equipos" replace />} />
    </Routes>
  )
}
