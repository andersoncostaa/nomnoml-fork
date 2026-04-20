/**
 * Componentes auxiliares para exibir dicas, alertas e gráficos nomnoml embutidos.
 */
import * as React from 'react'
import { useState } from 'react'
import { prevent } from './react-util'
// @ts-ignore
import * as nomnoml from '../dist/nomnoml.js'

type DailyTipProps = { id: string; sticky?: boolean; children: any }

/**
 * Exibe um alerta de "Dica do Dia" ou aviso importante que o usuário pode fechar.
 * O estado de visibilidade (se foi fechado) é persistido no localStorage.
 */
export function DailyTip({ id, sticky, children }: DailyTipProps) {
  var key = 'nomnoml.daily-tip:' + id
  // Um banner 'sticky' não pode ser fechado e é sempre visível
  var visible = sticky || localStorage[key] != 'hide'
  var [, setVisible] = useState(true)
  
  function closeAlert() {
    localStorage[key] = 'hide'
    setVisible(false)
  }
  
  return (
    <div className={'alert ' + (visible ? '' : 'alert-hidden')}>
      {children}
      {sticky || (
        <a className="alert-close" onClick={prevent(closeAlert)}>
          ×
        </a>
      )}
    </div>
  )
}

/**
 * Componente que renderiza um diagrama nomnoml a partir de uma string de código e o injeta como SVG.
 */
export function NomnomlGraph(props: { source: string }) {
  return <span dangerouslySetInnerHTML={{ __html: nomnoml.renderSvg(props.source) }} />
}
