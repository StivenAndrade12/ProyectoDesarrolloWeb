import { createContext, useContext, useState } from 'react'
import { api } from './api.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(() => {
    const raw = localStorage.getItem('usuario')
    return raw ? JSON.parse(raw) : null
  })

  const login = async (nombreUsuario, password) => {
    const data = await api.login(nombreUsuario, password)
    localStorage.setItem('token', data.token)
    const u = { nombreUsuario: data.nombreUsuario, rol: data.rol }
    localStorage.setItem('usuario', JSON.stringify(u))
    setUsuario(u)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    setUsuario(null)
  }

  const esAdmin = usuario?.rol === 'Administrador'

  return (
    <AuthContext.Provider value={{ usuario, esAdmin, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
