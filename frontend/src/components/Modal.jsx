import { useEffect } from 'react'

export default function Modal({ titulo, onCerrar, children }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onCerrar])

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-tinta/50 p-4 sm:items-center"
      onMouseDown={(e) => e.target === e.currentTarget && onCerrar()}
    >
      <div role="dialog" aria-modal="true" aria-label={titulo}
        className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-4 text-lg font-bold">{titulo}</h2>
        {children}
      </div>
    </div>
  )
}
