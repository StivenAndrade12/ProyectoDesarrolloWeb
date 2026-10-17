// Clases reutilizables
export const btnPrimario =
  'inline-flex items-center justify-center rounded-md bg-petroleo px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-petroleo-oscuro disabled:opacity-50 disabled:cursor-not-allowed'
export const btnSecundario =
  'inline-flex items-center justify-center rounded-md border border-linea bg-white px-4 py-2 text-sm font-medium text-tinta transition-colors hover:bg-papel disabled:opacity-50'
export const btnPeligro =
  'inline-flex items-center justify-center rounded-md bg-peligro px-4 py-2 text-sm font-semibold text-white transition-colors hover:opacity-90 disabled:opacity-50'
export const btnTexto =
  'text-sm font-medium text-petroleo underline-offset-2 hover:underline'
export const btnTextoPeligro =
  'text-sm font-medium text-peligro underline-offset-2 hover:underline'
export const input =
  'w-full rounded-md border border-linea bg-white px-3 py-2 text-sm text-tinta placeholder:text-tinta-suave/70'

// Fecha "yyyy-mm-dd" sin problemas de zona horaria
export const soloFecha = (iso) => iso.slice(0, 10)
export const formatearFecha = (iso) => {
  const [y, m, d] = soloFecha(iso).split('-')
  const meses = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
  return `${Number(d)} ${meses[Number(m) - 1]} ${y}`
}
