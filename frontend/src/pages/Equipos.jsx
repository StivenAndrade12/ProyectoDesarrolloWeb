import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import EquipoForm from '../components/EquipoForm.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { btnPrimario, btnTexto, btnTextoPeligro, input } from '../ui.js'

export default function Equipos() {
  const { esAdmin } = useAuth()
  const [equipos, setEquipos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [buscar, setBuscar] = useState('')
  const [categoriaId, setCategoriaId] = useState('')
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(null) // null | 'nuevo' | equipo
  const [aEliminar, setAEliminar] = useState(null)

  const cargar = useCallback(async () => {
    setError('')
    try {
      const [eq, cats] = await Promise.all([
        api.equipos.listar({ buscar, categoriaId }),
        api.categorias.listar(),
      ])
      setEquipos(eq)
      setCategorias(cats)
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [buscar, categoriaId])

  useEffect(() => {
    const t = setTimeout(cargar, 250) // pequeña espera mientras se escribe
    return () => clearTimeout(t)
  }, [cargar])

  const guardado = () => { setFormulario(null); cargar() }

  const eliminar = async () => {
    await api.equipos.eliminar(aEliminar.id)
    setAEliminar(null)
    cargar()
  }

  const hayFiltros = buscar || categoriaId

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Equipos</h1>
        {esAdmin && (
          <button className={btnPrimario} disabled={categorias.length === 0}
            onClick={() => setFormulario('nuevo')}>Nuevo equipo</button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <input className={`${input} max-w-xs`} placeholder="Buscar por nombre, marca o MAC"
          aria-label="Buscar equipos" value={buscar} onChange={(e) => setBuscar(e.target.value)} />
        <select className={`${input} max-w-[12rem]`} aria-label="Filtrar por categoría"
          value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)}>
          <option value="">Todas las categorías</option>
          {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
        </select>
      </div>

      {error && <p className="mb-4 text-sm text-peligro" role="alert">{error}</p>}

      {cargando ? (
        <p className="text-sm text-tinta-suave">Cargando equipos…</p>
      ) : equipos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-linea bg-white p-8 text-center">
          {hayFiltros ? (
            <p className="text-sm text-tinta-suave">Ningún equipo coincide con la búsqueda.</p>
          ) : categorias.length === 0 ? (
            <p className="text-sm text-tinta-suave">
              {esAdmin ? (
                <>Antes de registrar equipos, <Link className={btnTexto} to="/categorias">crea una categoría</Link> (por ejemplo Redes, Cómputo o Telefonía).</>
              ) : 'Aún no hay equipos registrados.'}
            </p>
          ) : (
            <p className="text-sm text-tinta-suave">
              {esAdmin ? 'Aún no hay equipos. Registra el primero con “Nuevo equipo”.' : 'Aún no hay equipos registrados.'}
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-linea bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-linea text-tinta-suave">
              <tr>
                <th className="px-4 py-3 font-medium">Equipo</th>
                <th className="px-4 py-3 font-medium">Categoría</th>
                <th className="px-4 py-3 font-medium">Marca</th>
                <th className="px-4 py-3 font-medium">MAC</th>
                <th className="px-4 py-3 font-medium">Intervenciones</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {equipos.map((e) => (
                <tr key={e.id} className="border-b border-linea last:border-0">
                  <td className="px-4 py-3 font-medium">
                    <Link className={btnTexto} to={`/equipos/${e.id}`}>{e.nombre}</Link>
                  </td>
                  <td className="px-4 py-3">{e.categoriaNombre}</td>
                  <td className="px-4 py-3">{e.marca || <span className="text-tinta-suave">—</span>}</td>
                  <td className="px-4 py-3 font-mono text-xs">{e.direccionMac || <span className="text-tinta-suave">—</span>}</td>
                  <td className="px-4 py-3">{e.totalIntervenciones}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link className={btnTexto} to={`/equipos/${e.id}`}>Ver historial</Link>
                    {esAdmin && (
                      <>
                        <button className={`${btnTexto} ml-4`} onClick={() => setFormulario(e)}>Editar</button>
                        <button className={`${btnTextoPeligro} ml-4`} onClick={() => setAEliminar(e)}>Eliminar</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {formulario && (
        <EquipoForm equipo={formulario === 'nuevo' ? null : formulario} categorias={categorias}
          onGuardado={guardado} onCerrar={() => setFormulario(null)} />
      )}
      {aEliminar && (
        <ConfirmDialog titulo="Eliminar equipo"
          mensaje={`Se eliminará “${aEliminar.nombre}” junto con sus ${aEliminar.totalIntervenciones} intervenciones. Esta acción no se puede deshacer.`}
          onConfirmar={eliminar} onCerrar={() => setAEliminar(null)} />
      )}
    </div>
  )
}
