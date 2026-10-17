import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import IntervencionForm from '../components/IntervencionForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { btnPrimario, btnTexto, btnTextoPeligro, formatearFecha } from '../ui.js'

export default function EquipoDetalle() {
  const { id } = useParams()
  const { esAdmin } = useAuth()
  const [equipo, setEquipo] = useState(null)
  const [historial, setHistorial] = useState([])
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(null) // null | 'nueva' | intervencion
  const [aEliminar, setAEliminar] = useState(null)

  const cargar = useCallback(async () => {
    try {
      const [eq, hist] = await Promise.all([api.equipos.obtener(id), api.intervenciones.listar(id)])
      setEquipo(eq)
      setHistorial(hist)
    } catch (e) {
      setError(e.status === 404 ? 'Este equipo no existe o fue dado de baja.' : e.message)
    }
  }, [id])

  useEffect(() => { cargar() }, [cargar])

  const guardado = () => { setFormulario(null); cargar() }
  const eliminar = async () => {
    await api.intervenciones.eliminar(aEliminar.id)
    setAEliminar(null)
    cargar()
  }

  if (error) return (
    <div>
      <p className="mb-3 text-sm text-peligro" role="alert">{error}</p>
      <Link className={btnTexto} to="/equipos">Volver a equipos</Link>
    </div>
  )
  if (!equipo) return <p className="text-sm text-tinta-suave">Cargando…</p>

  return (
    <div>
      <Link className={btnTexto} to="/equipos">Volver a equipos</Link>

      <div className="mb-8 mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{equipo.nombre}</h1>
          <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-1 text-sm">
            <div><dt className="inline text-tinta-suave">Categoría: </dt><dd className="inline">{equipo.categoriaNombre}</dd></div>
            <div><dt className="inline text-tinta-suave">Marca: </dt><dd className="inline">{equipo.marca || '—'}</dd></div>
            <div><dt className="inline text-tinta-suave">MAC: </dt><dd className="inline font-mono text-xs">{equipo.direccionMac || '—'}</dd></div>
          </dl>
        </div>
        {esAdmin && (
          <button className={btnPrimario} onClick={() => setFormulario('nueva')}>Nueva intervención</button>
        )}
      </div>

      <h2 className="mb-4 text-lg font-bold">Historial de intervenciones</h2>

      {historial.length === 0 ? (
        <div className="rounded-lg border border-dashed border-linea bg-white p-8 text-center text-sm text-tinta-suave">
          {esAdmin
            ? 'Este equipo aún no tiene intervenciones. Registra la primera con “Nueva intervención”.'
            : 'Este equipo aún no tiene intervenciones registradas.'}
        </div>
      ) : (
        <ol className="relative ml-2 border-l-2 border-linea">
          {historial.map((i) => (
            <li key={i.id} className="relative mb-6 pl-6 last:mb-0">
              <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full border-2 border-papel bg-ambar" aria-hidden />
              <div className="rounded-lg border border-linea bg-white p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <time className="text-sm font-semibold">{formatearFecha(i.fecha)}</time>
                  {esAdmin && (
                    <div>
                      <button className={btnTexto} onClick={() => setFormulario(i)}>Editar</button>
                      <button className={`${btnTextoPeligro} ml-4`} onClick={() => setAEliminar(i)}>Eliminar</button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-tinta-suave">Falla reportada</p>
                <p className="mb-3 whitespace-pre-wrap text-sm">{i.fallaReportada}</p>
                <p className="text-sm text-tinta-suave">Configuración aplicada</p>
                <p className="whitespace-pre-wrap font-mono text-xs leading-relaxed">{i.configuracionAplicada}</p>
              </div>
            </li>
          ))}
        </ol>
      )}

      {formulario && (
        <IntervencionForm equipoId={Number(id)} intervencion={formulario === 'nueva' ? null : formulario}
          onGuardado={guardado} onCerrar={() => setFormulario(null)} />
      )}
      {aEliminar && (
        <ConfirmDialog titulo="Eliminar intervención"
          mensaje={`Se eliminará el registro del ${formatearFecha(aEliminar.fecha)}. Esta acción no se puede deshacer.`}
          onConfirmar={eliminar} onCerrar={() => setAEliminar(null)} />
      )}
    </div>
  )
}
