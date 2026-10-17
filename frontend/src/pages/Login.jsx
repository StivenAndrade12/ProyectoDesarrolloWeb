import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth.jsx'
import Campo from '../components/Campo.jsx'
import { btnPrimario, input } from '../ui.js'

export default function Login() {
  const { usuario, login } = useAuth()
  const navigate = useNavigate()
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  if (usuario) return <Navigate to="/equipos" replace />

  const enviar = async (e) => {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      await login(nombre, password)
      navigate('/equipos')
    } catch (err) {
      setError(err.message)
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold">Bitácora de Redes y Equipos</h1>
        <p className="mb-6 mt-1 text-sm text-tinta-suave">
          Registra qué se configuró en cada equipo para no diagnosticar desde cero.
        </p>
        <form onSubmit={enviar} className="rounded-lg border border-linea bg-white p-6">
          <Campo etiqueta="Usuario" htmlFor="usuario">
            <input id="usuario" className={input} value={nombre} autoFocus required
              onChange={(e) => setNombre(e.target.value)} />
          </Campo>
          <Campo etiqueta="Contraseña" htmlFor="password">
            <input id="password" type="password" className={input} value={password} required
              onChange={(e) => setPassword(e.target.value)} />
          </Campo>
          {error && <p className="mb-3 text-sm text-peligro" role="alert">{error}</p>}
          <button className={`${btnPrimario} w-full`} disabled={cargando}>
            {cargando ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </form>
      </div>
    </div>
  )
}
