export default function Campo({ etiqueta, ayuda, children, htmlFor }) {
  return (
    <div className="mb-4">
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium">{etiqueta}</label>
      {children}
      {ayuda && <p className="mt-1 text-xs text-tinta-suave">{ayuda}</p>}
    </div>
  )
}
