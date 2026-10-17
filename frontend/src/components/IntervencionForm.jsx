import { useState } from 'react'
import Modal from './Modal.jsx'
import Campo from './Campo.jsx'
import { api } from '../api.js'
import { btnPrimario, btnSecundario, input, soloFecha } from '../ui.js'

const hoy = () => new Date().toLocaleDateString('en-CA') // yyyy-mm-dd en hora local

export default function IntervencionForm({ equipoId, intervencion, onGuardado, onCerrar }) {
  const [fecha, setFecha] = useState(intervencion ? soloFecha(intervencion.fecha) : hoy())
  const [falla, setFalla] = useState(intervencion?.fallaReportada ?? '')
  const [config, setConfig] = useState(intervencion?.configuracionAplicada ?? '')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    const datos = {
      equipoId,
      fecha: `${fecha}T00:00:00`,
      fallaReportada: falla,
      configuracionAplicada: config,
    }
    try {
      if (intervencion) await api.intervenciones.actualizar(intervencion.id, datos)
      else await api.intervenciones.crear(datos)
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={intervencion ? 'Editar intervención' : 'Nueva intervención'} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <Campo etiqueta="Fecha" htmlFor="iv-fecha">
          <input id="iv-fecha" type="date" className={input} value={fecha} required
            onChange={(e) => setFecha(e.target.value)} />
        </Campo>
        <Campo etiqueta="Falla reportada" htmlFor="iv-falla">
          <textarea id="iv-falla" className={input} rows={3} value={falla} required maxLength={1000}
            placeholder="Qué síntoma o problema presentaba el equipo"
            onChange={(e) => setFalla(e.target.value)} />
        </Campo>
        <Campo etiqueta="Configuración o solución aplicada" htmlFor="iv-config">
          <textarea id="iv-config" className={`${input} font-mono`} rows={6} value={config} required maxLength={4000}
            placeholder="Pasos y valores exactos que se configuraron"
            onChange={(e) => setConfig(e.target.value)} />
        </Campo>
        {error && <p className="mb-3 text-sm text-peligro" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecundario} onClick={onCerrar}>Cancelar</button>
          <button className={btnPrimario} disabled={guardando}>
            {intervencion ? 'Guardar cambios' : 'Registrar intervención'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
