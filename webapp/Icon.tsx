/**
 * Componente React funcional para renderizar ícones baseados em caminhos SVG (paths).
 * Utilizado uniformemente em toda a interface da webapp.
 */
import * as React from 'react'

export function Icon(props: { shape?: string }) {
  return (
    <i className="icon">
      <svg
        version="1.2"
        baseProfile="tiny"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        width={24}
        height={24}
      >
        {/* O atributo 'd' define o desenho vetorial do ícone */}
        <path d={props.shape} />
      </svg>
    </i>
  )
}
