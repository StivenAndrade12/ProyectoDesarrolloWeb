// Consulta el fabricante a través de nuestra API, que consume MAC Lookup (api.maclookup.app)
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const MAC_REGEX = /^([0-9A-Fa-f]{2}[:-]){5}[0-9A-Fa-f]{2}$/

export const esMacValida = (mac) => MAC_REGEX.test(mac.trim())

export async function buscarFabricante(mac) {
  const res = await fetch(`${BASE}/mac?direccion=${encodeURIComponent(mac.trim())}`, {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  if (!res.ok) {
    let msg = 'No se pudo consultar el fabricante.'
    try { msg = (await res.json()).mensaje || msg } catch { /* sin cuerpo */ }
    throw new Error(msg)
  }
  const data = await res.json()
  return data.encontrado ? data.fabricante : null
}