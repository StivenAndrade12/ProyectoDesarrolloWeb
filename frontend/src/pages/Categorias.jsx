import { useCallback, useEffect, useState } from 'react'
import { api } from '../api.js'
import { useAuth } from '../auth.jsx'
import Modal from '../components/Modal.jsx'
import Campo from '../components/Campo.jsx'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import { btnPrimario, btnSecundario, btnTexto, btnTextoPeligro, input } from '../ui.js'

function CategoriaForm({ categoria, onGuardado, onCerrar }) {
  const [nombre, setNombre] = useState(categoria?.nombre ?? '')
  const [error, setError] = useState('')
  const [guardando, setGuardando] = useState(false)

  const guardar = async (e) => {
    e.preventDefault()
    setError('')
    setGuardando(true)
    try {
      if (categoria) await api.categorias.actualizar(categoria.id, nombre)
      else await api.categorias.crear(nombre)
      onGuardado()
    } catch (err) {
      setError(err.message)
      setGuardando(false)
    }
  }

  return (
    <Modal titulo={categoria ? 'Editar categoría' : 'Nueva categoría'} onCerrar={onCerrar}>
      <form onSubmit={guardar}>
        <Campo etiqueta="Nombre" htmlFor="cat-nombre">
          <input id="cat-nombre" className={input} value={nombre} required maxLength={60} autoFocus
            placeholder="Ej: Redes" onChange={(e) => setNombre(e.target.value)} />
        </Campo>
        {error && <p className="mb-3 text-sm text-peligro" role="alert">{error}</p>}
        <div className="flex justify-end gap-2">
          <button type="button" className={btnSecundario} onClick={onCerrar}>Cancelar</button>
          <button className={btnPrimario} disabled={guardando}>
            {categoria ? 'Guardar cambios' : 'Crear categoría'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default function Categorias() {
  const { esAdmin } = useAuth()
  const [categorias, setCategorias] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState('')
  const [formulario, setFormulario] = useState(null)
  const [aEliminar, setAEliminar] = useState(null)

  const cargar = useCallback(async () => {
    try {
      setCategorias(await api.categorias.listar())
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setCargando(false)
    }
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const guardado = () => { setFormulario(null); cargar() }
  const eliminar = async () => {
    await api.categorias.eliminar(aEliminar.id)
    setAEliminar(null)
    cargar()
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Categorías</h1>
        {esAdmin && <button className={btnPrimario} onClick={() => setFormulario('nueva')}>Nueva categoría</button>}
      </div>

      {error && <p className="mb-4 text-sm text-peligro" role="alert">{error}</p>}

      {cargando ? (
        <p className="text-sm text-tinta-suave">Cargando categorías…</p>
      ) : categorias.length === 0 ? (
        <div className="rounded-lg border border-dashed border-linea bg-white p-8 text-center text-sm text-tinta-suave">
          {esAdmin
            ? 'Aún no hay categorías. Crea la primera, por ejemplo Redes, Cómputo o Telefonía.'
            : 'Aún no hay categorías registradas.'}
        </div>
      ) : (
        <ul className="max-w-xl divide-y divide-linea rounded-lg border border-linea bg-white">
          {categorias.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div>
                <p className="font-medium">{c.nombre}</p>
                <p className="text-xs text-tinta-suave">
                  {c.totalEquipos === 1 ? '1 equipo' : `${c.totalEquipos} equipos`}
                </p>
              </div>
              {esAdmin && (
                <div>
                  <button className={btnTexto} onClick={() => setFormulario(c)}>Editar</button>
                  <button className={`${btnTextoPeligro} ml-4`} onClick={() => setAEliminar(c)}>Eliminar</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {formulario && (
        <CategoriaForm categoria={formulario === 'nueva' ? null : formulario}
          onGuardado={guardado} onCerrar={() => setFormulario(null)} />
      )}
      {aEliminar && (
        <ConfirmDialog titulo="Eliminar categoría"
          mensaje={`Se eliminará la categoría “${aEliminar.nombre}”.`}
          onConfirmar={eliminar} onCerrar={() => setAEliminar(null)} />
      )}
    </div>
  )
}
