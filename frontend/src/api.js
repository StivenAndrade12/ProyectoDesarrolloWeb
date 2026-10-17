const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export class ApiError extends Error {
  constructor(message, status) {
    super(message)
    this.status = status
  }
}

async function request(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (res.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('token')
    localStorage.removeItem('usuario')
    window.location.href = '/login'
    throw new ApiError('Tu sesión expiró. Vuelve a iniciar sesión.', 401)
  }
  if (res.status === 403) throw new ApiError('No tienes permisos para esta acción.', 403)
  if (!res.ok) {
    let msg = 'Ocurrió un error inesperado.'
    try {
      const data = await res.json()
      msg = data.mensaje || data.title || msg
    } catch { /* sin cuerpo */ }
    throw new ApiError(msg, res.status)
  }
  return res.status === 204 ? null : res.json()
}

export const api = {
  login: (nombreUsuario, password) =>
    request('/auth/login', { method: 'POST', body: { nombreUsuario, password } }),

  categorias: {
    listar: () => request('/categorias'),
    crear: (nombre) => request('/categorias', { method: 'POST', body: { nombre } }),
    actualizar: (id, nombre) => request(`/categorias/${id}`, { method: 'PUT', body: { nombre } }),
    eliminar: (id) => request(`/categorias/${id}`, { method: 'DELETE' }),
  },

  equipos: {
    listar: (params = {}) => {
      const qs = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v !== '' && v != null)
      ).toString()
      return request(`/equipos${qs ? `?${qs}` : ''}`)
    },
    obtener: (id) => request(`/equipos/${id}`),
    crear: (data) => request('/equipos', { method: 'POST', body: data }),
    actualizar: (id, data) => request(`/equipos/${id}`, { method: 'PUT', body: data }),
    eliminar: (id) => request(`/equipos/${id}`, { method: 'DELETE' }),
  },

  intervenciones: {
    listar: (equipoId) => request(`/intervenciones?equipoId=${equipoId}`),
    crear: (data) => request('/intervenciones', { method: 'POST', body: data }),
    actualizar: (id, data) => request(`/intervenciones/${id}`, { method: 'PUT', body: data }),
    eliminar: (id) => request(`/intervenciones/${id}`, { method: 'DELETE' }),
  },
}
