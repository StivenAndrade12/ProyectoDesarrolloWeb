import { useState } from 'react'
import Modal from './Modal.jsx'
import { btnPeligro, btnSecundario } from '../ui.js'

export default function ConfirmDialog({ titulo, mensaje, textoConfirmar = 'Eliminar', onConfirmar, onCerrar }) {
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const confirmar = async () => {
    setCargando(true)
    setError('')
    try {
      await onConfirmar()
    } catch (e) {
      setError(e.message)
      setCargando(false)
    }
  }

  return (
    <Modal titulo={titulo} onCerrar={onCerrar}>
      <p className="text-sm text-tinta-suave">{mensaje}</p>
      {error && <p className="mt-3 text-sm text-peligro" role="alert">{error}</p>}
      <div className="mt-6 flex justify-end gap-2">
        <button className={btnSecundario} onClick={onCerrar} disabled={cargando}>Cancelar</button>
        <button className={btnPeligro} onClick={confirmar} disabled={cargando}>{textoConfirmar}</button>
      </div>
    </Modal>
  )
}
