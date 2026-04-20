/**
 * Definições de tipos e interfaces fundamentais do domínio nomnoml.
 */

import { Ranker } from 'graphre/decl/types'
import { Graphics } from './Graphics'
import { LayoutedNode } from './layouter'

/** Configurações globais de estilo e comportamento do diagrama
 */
export interface Config {
  padding: number
  stroke: string
  font: string
  title: string
  leading: number
  fontSize: number
  lineWidth: number
  gutter: number
  styles: { [key: string]: Style }
  fill: string[]
  background: string
  edges: string
  edgeMargin: number
  gravity: number
  spacing: number
  direction: 'TB' | 'LR'
  fillArrows: boolean
  arrowSize: number
  bendSize: number
  zoom: number
  acyclicer: 'greedy' | undefined
  ranker: Ranker
}

/** Interface para medição de texto, permitindo independência do backend gráfico (Canvas/SVG) */
export interface Measurer {
  setFont(family: string, size: number, weight: 'bold' | 'normal', style: 'italic' | 'normal'): void
  textWidth(text: string): number
  textHeight(): number
}

/** Assinatura para funções que desenham visualmente um nó */
export interface Visualizer {
  (node: LayoutedNode, x: number, y: number, config: Config, g: Graphics): void
}

/** Assinatura para funções que definem o layout interno de um nó */
export interface NodeLayouter {
  (config: Config, node: LayoutedNode): void
}

/** Tipos de formas visuais suportadas para os nós */
export type Visual =
  | 'actor'
  | 'class'
  | 'database'
  | 'ellipse'
  | 'end'
  | 'frame'
  | 'hidden'
  | 'input'
  | 'lollipop'
  | 'none'
  | 'note'
  | 'package'
  | 'pipe'
  | 'receiver'
  | 'rhomb'
  | 'roundrect'
  | 'sender'
  | 'socket'
  | 'start'
  | 'sync'
  | 'table'
  | 'transceiver'

/** Estilização de texto (negrito, sublinhado, etc.) */
export interface TextStyle {
  bold: boolean
  underline: boolean
  italic: boolean
  center: boolean
}

/** Configuração de estilo para um tipo específico de nó ou classificador */
export interface Style {
  title: TextStyle
  body: TextStyle
  dashed: boolean
  fill: string | undefined
  stroke: string | undefined
  visual: Visual
  direction: 'TB' | 'LR' | undefined
}

/** Rótulo textual associado a uma relação (linha entre nós) */
export interface RelationLabel {
  x?: number
  y?: number
  width?: number
  height?: number
  text: string
}
