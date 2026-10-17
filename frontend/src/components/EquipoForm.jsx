import { useState } from 'react'
import Modal from './Modal.jsx'
import Campo from './Campo.jsx'
import { api } from '../api.js'
import { buscarFabricante, esMacValida } from '../macLookup.js'
import { btnPrimario, btnSecundario, input } from '../ui.js'

// Crear o editar un equipo. Si recibe "equipo" es edición.
export default function EquipoForm({ equipo, categorias, onGuardado, onCerrar }) {
  const [nombre, setNombre] = useState(equipo?.nombre ?? '')
  const [mac, setMac] = useState(equipo?.direccionMac ?? '')
  const [marca, setMarca] = useState(equipo?.marca ?? '')
  const [categoriaId, setCategoriaId] = useState(equipo?.categoriaId ?? categorias[0]?.id ?? '')
  const [buscando, setBuscando] = useState(false)
  const [avisoMac, setAvisoMac] = useState('')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  // Detección automática del fabricante al salir del campo MAC
  const detectarFabricante = async () => {
    setAvisoMac('')
    if (!mac.trim()) return
    if (!esMacValida(mac)) {
      setAvisoMac('Formato inválido. Usa AA:BB:CC:DD:EE:FF.')
      return
    }
    setBuscando(true)
    try {
      const fabricante = await buscarFabricante(mac)
      if (fabricante) {
        setMarca(fabricante)
        setAvisoMac(`Fabricante detectado: ${fabricante}`)
      } else {
        setAvisoMac('No se encontró el fabricante. Escríbelo manualmente.')
      }
    } catch (e) {
      setAvisoMac(e.message)
    } finally {
      setBuscando(false)
    }
  }

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    if (mac.trim() && !esMacValida(mac)) {
      setError('La dirección MAC no es válida. Usa el formato AA:BB:CC:DD:EE:FF.')
      return
    }
    setGuardando(true)
    const datos = {
      nombre,
      direccionMac: mac.trim() || null,
      marca: marca.trim() || null,
      categoriaId: Number(categoriaId),
    }
    try {
      if (equipo) await api.equipos.actualizar(equipo.id, datos)
      else await api.equipos.crear(datos)
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={equipo ? 'Editar equipo' : 'Nuevo equipo'} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <Campo etiqueta="Nombre del equipo" htmlFor="eq-nombre">
          <input id="eq-nombre" className={input} value={nombre} required maxLength={100} autoFocus
            placeholder="Ej: Router oficina principal" onChange={(e) => setNombre(e.target.value)} />
        </Campo>

        <Campo etiqueta="Dirección MAC (opcional)" htmlFor="eq-mac"
          ayuda={buscando ? 'Consultando fabricante…' : avisoMac || 'Al salir del campo se completa la marca automáticamente.'}>
          <input id="eq-mac" className={`${input} font-mono`} value={mac} maxLength={17}
            placeholder="AA:BB:CC:DD:EE:FF"
            onChange={(e) => setMac(e.target.value)} onBlur={detectarFabricante} />
        </Campo>

        <Campo etiqueta="Fabricante / Marca" htmlFor="eq-marca">
          <input id="eq-marca" className={input} value={marca} maxLength={100}
            onChange={(e) => setMarca(e.target.value)} />
        </Campo>

        <Campo etiqueta="Categoría" htmlFor="eq-cat">
          <select id="eq-cat" className={input} value={categoriaId} required
            onChange={(e) => setCategoriaId(e.target.value)}>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </Campo>

        {error && <p className="mb-3 text-sm text-peligro" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecundario} onClick={onCerrar}>Cancelar</button>
          <button className={btnPrimario} disabled={guardando || buscando}>
            {equipo ? 'Guardar cambios' : 'Crear equipo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
