/**
 * Componente React que exibe botões de controle de visualização sobre o canvas.
 * Inclui opções de zoom in, zoom out e restaurar visualização.
 */
import * as React from 'react'
import { App } from './App'
import { Icon } from './Icon'
import { prevent } from './react-util'
import { equals, minus, plus } from './typicons'

export function CanvasTools({ app }: { app: App }) {
  return (
    <canvas-tools>
      {/* Botão para aumentar o zoom */}
      <a title="Zoom in" onClick={prevent(() => app.magnifyViewport(2))}>
        <Icon shape={plus} />
      </a>

      {/* Botão para resetar o zoom e o posicionamento para o padrão */}
      <a title="Reset zoom and panning" onClick={prevent(() => app.resetViewport())}>
        <Icon shape={equals} />
      </a>

      {/* Botão para diminuir o zoom */}
      <a title="Zoom out" onClick={prevent(() => app.magnifyViewport(-2))}>
        <Icon shape={minus} />
      </a>
    </canvas-tools>
  )
}
