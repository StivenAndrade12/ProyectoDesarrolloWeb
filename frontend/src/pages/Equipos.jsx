import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api.js";
import { useAuth } from "../auth.jsx";
import EquipoForm from "../components/EquipoForm.jsx";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import {
  btnPrimario,
  btnSecundario,
  btnTexto,
  btnTextoPeligro,
  input,
} from "../ui.js";

const POR_PAGINA = 5; // Cantidad de equipos por página (ideal para demostrar en clase)

export default function Equipos() {
  const { esAdmin } = useAuth();
  const [equipos, setEquipos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [buscar, setBuscar] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [pagina, setPagina] = useState(1);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState("");
  const [formulario, setFormulario] = useState(null); // null | 'nuevo' | equipo
  const [aEliminar, setAEliminar] = useState(null);

  const cargar = useCallback(async () => {
    setError("");
    try {
      const [eq, cats] = await Promise.all([
        api.equipos.listar({ buscar, categoriaId }),
        api.categorias.listar(),
      ]);
      setEquipos(eq);
      setCategorias(cats);
    } catch (e) {
      setError(e.message);
    } finally {
      setCargando(false);
    }
  }, [buscar, categoriaId]);

  useEffect(() => {
    const t = setTimeout(cargar, 250); // pequeña espera mientras se escribe
    return () => clearTimeout(t);
  }, [cargar]);

  // Cuando el usuario escribe en el buscador o cambia de categoría, volvemos a la página 1
  useEffect(() => {
    setPagina(1);
  }, [buscar, categoriaId]);

  const guardado = () => {
    setFormulario(null);
    cargar();
  };

  const eliminar = async () => {
    await api.equipos.eliminar(aEliminar.id);
    setAEliminar(null);
    cargar();
  };

  const limpiarFiltros = () => {
    setBuscar("");
    setCategoriaId("");
  };

  const hayFiltros = buscar || categoriaId;

  // Cálculos de paginación
  const totalPaginas = Math.max(1, Math.ceil(equipos.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const inicio = (paginaActual - 1) * POR_PAGINA;
  const equiposPaginados = equipos.slice(inicio, inicio + POR_PAGINA);

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-2xl font-bold">Equipos</h1>
          {!cargando && (
            <span className="rounded-full border border-linea bg-white px-2.5 py-0.5 text-xs font-medium text-tinta-suave">
              {equipos.length}{" "}
              {equipos.length === 1 ? "registrado" : "registrados"}
            </span>
          )}
        </div>
        {esAdmin && (
          <button
            className={btnPrimario}
            disabled={categorias.length === 0}
            onClick={() => setFormulario("nuevo")}
          >
            Nuevo equipo
          </button>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className={`${input} max-w-xs`}
          placeholder="Buscar por nombre, marca o MAC"
          aria-label="Buscar equipos"
          value={buscar}
          onChange={(e) => setBuscar(e.target.value)}
        />
        <select
          className={`${input} max-w-[12rem]`}
          aria-label="Filtrar por categoría"
          value={categoriaId}
          onChange={(e) => setCategoriaId(e.target.value)}
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        {hayFiltros && (
          <button
            type="button"
            className={`${btnTexto} text-xs`}
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {error && (
        <p className="mb-4 text-sm text-peligro" role="alert">
          {error}
        </p>
      )}

      {cargando ? (
        <p className="text-sm text-tinta-suave">Cargando equipos…</p>
      ) : equipos.length === 0 ? (
        <div className="rounded-lg border border-dashed border-linea bg-white p-8 text-center">
          {hayFiltros ? (
            <p className="text-sm text-tinta-suave">
              Ningún equipo coincide con la búsqueda.
            </p>
          ) : categorias.length === 0 ? (
            <p className="text-sm text-tinta-suave">
              {esAdmin ? (
                <>
                  Antes de registrar equipos,{" "}
                  <Link className={btnTexto} to="/categorias">
                    crea una categoría
                  </Link>{" "}
                  (por ejemplo Redes, Cómputo o Telefonía).
                </>
              ) : (
                "Aún no hay equipos registrados."
              )}
            </p>
          ) : (
            <p className="text-sm text-tinta-suave">
              {esAdmin
                ? "Aún no hay equipos. Registra el primero con “Nuevo equipo”."
                : "Aún no hay equipos registrados."}
            </p>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-linea bg-white shadow-xs">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-linea bg-gray-50/60 text-tinta-suave">
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
              {equiposPaginados.map((e) => (
                <tr
                  key={e.id}
                  className="border-b border-linea transition-colors hover:bg-gray-50/80 last:border-0"
                >
                  <td className="px-4 py-3 font-medium">
                    <Link className={btnTexto} to={`/equipos/${e.id}`}>
                      {e.nombre}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block rounded-md border border-linea bg-gray-50 px-2 py-0.5 text-xs">
                      {e.categoriaNombre}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {e.marca || <span className="text-tinta-suave">—</span>}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">
                    {e.direccionMac || (
                      <span className="text-tinta-suave">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium">
                      {e.totalIntervenciones}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link className={btnTexto} to={`/equipos/${e.id}`}>
                      Ver historial
                    </Link>
                    {esAdmin && (
                      <>
                        <button
                          className={`${btnTexto} ml-4`}
                          onClick={() => setFormulario(e)}
                        >
                          Editar
                        </button>
                        <button
                          className={`${btnTextoPeligro} ml-4`}
                          onClick={() => setAEliminar(e)}
                        >
                          Eliminar
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Barra inferior de Paginación */}
          {totalPaginas > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-linea px-4 py-3 text-xs text-tinta-suave">
              <span>
                Mostrando <strong className="font-medium">{inicio + 1}</strong>{" "}
                a{" "}
                <strong className="font-medium">
                  {Math.min(inicio + POR_PAGINA, equipos.length)}
                </strong>{" "}
                de <strong className="font-medium">{equipos.length}</strong>{" "}
                equipos
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`${btnSecundario || "rounded border border-linea px-2.5 py-1"} disabled:opacity-40`}
                  disabled={paginaActual === 1}
                  onClick={() => setPagina((p) => Math.max(1, p - 1))}
                >
                  Anterior
                </button>
                <span className="px-2 font-medium">
                  Página {paginaActual} de {totalPaginas}
                </span>
                <button
                  type="button"
                  className={`${btnSecundario || "rounded border border-linea px-2.5 py-1"} disabled:opacity-40`}
                  disabled={paginaActual === totalPaginas}
                  onClick={() =>
                    setPagina((p) => Math.min(totalPaginas, p + 1))
                  }
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {formulario && (
        <EquipoForm
          equipo={formulario === "nuevo" ? null : formulario}
          categorias={categorias}
          onGuardado={guardado}
          onCerrar={() => setFormulario(null)}
        />
      )}
      {aEliminar && (
        <ConfirmDialog
          titulo="Eliminar equipo"
          mensaje={`Se eliminará “${aEliminar.nombre}” junto con sus ${aEliminar.totalIntervenciones} intervenciones. Esta acción no se puede deshacer.`}
          onConfirmar={eliminar}
          onCerrar={() => setAEliminar(null)}
        />
      )}
    </div>
  );
}
