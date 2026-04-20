/**
 * Abstração das capacidades gráficas necessárias para desenhar o diagrama.
 */

/** Define uma interface comum que pode ser implementada para Canvas (HTML5) ou SVG.
 */
export interface Vector {
  x: number
  y: number
}

type LineCap = 'butt' | 'round' | 'square'
type LineJoin = 'bevel' | 'round' | 'miter'

/** Interface fluida para encadeamento de operações de desenho (stroke/fill) */
export interface Chainable {
  stroke(): Chainable
  fill(): Chainable
  fillAndStroke(): Chainable
}

/** Interface principal que define os comandos de desenho suportados */
export interface Graphics {
  /** Retorna a largura atual da superfície de desenho */
  width(): number
  /** Retorna a altura atual da superfície de desenho */
  height(): number
  /** Limpa a superfície de desenho */
  clear(): void
  /** Desenha um círculo */
  circle(center: Vector, r: number): Chainable
  /** Desenha uma elipse */
  ellipse(center: Vector, w: number, h: number, start?: number, stop?: number): Chainable
  /** Desenha um arco de circunferência */
  arc(x: number, y: number, r: number, start: number, stop: number): Chainable
  /** Desenha um retângulo com cantos arredondados */
  roundRect(x: number, y: number, w: number, h: number, r: number): Chainable
  /** Desenha um retângulo simples */
  rect(x: number, y: number, w: number, h: number): Chainable
  /** Define um caminho baseado em uma lista de pontos */
  path(points: Vector[]): Chainable
  /** Desenha um circuito fechado (como um polígono) */
  circuit(path: Vector[], offset?: Vector, s?: number): Chainable
  /** Define a fonte atual para desenho de texto */
  setFont(family: string, size: number, weight: 'bold' | 'normal', style: 'italic' | 'normal'): void
  /** Define a cor do traço */
  strokeStyle(stroke: string): void
  /** Define a cor de preenchimento */
  fillStyle(fill: string): void
  /** Adiciona um arco ao caminho atual entre dois pontos de controle */
  arcTo(x1: number, y1: number, x2: number, y2: number, radius: number): void
  /** Inicia um novo caminho de desenho */
  beginPath(): Chainable
  /** Desenha texto na posição especificada */
  fillText(text: string, x: number, y: number): Chainable
  /** Define o estilo das extremidades das linhas */
  lineCap(cap: LineCap): void
  /** Define o estilo das junções entre linhas */
  lineJoin(join: LineJoin): void
  /** Adiciona uma linha ao caminho atual até o ponto especificado */
  lineTo(x: number, y: number): Chainable
  /** Define a largura da linha (espessura do traço) */
  lineWidth(w: number): void
  /** Mede as dimensões de uma string de texto com a fonte atual */
  measureText(s: string): { width: number }
  /** Move a caneta para o ponto especificado sem desenhar */
  moveTo(x: number, y: number): void
  /** Restaura o estado anterior do contexto gráfico */
  restore(): void
  /** Salva o estado atual do contexto gráfico (estilo, transformações) */
  save(): void
  /** Define metadados associados ao elemento gráfico sendo desenhado */
  setData(name: string, value?: string): void
  /** Aplica uma escala à superfície de desenho */
  scale(x: number, y: number): void
  /** Define o padrão de tracejado das linhas */
  setLineDash(d: number[]): void
  /** Aplica o traço ao caminho atual */
  stroke(): void
  /** Define o alinhamento horizontal do texto */
  textAlign(a: string): void
  /** Move a origem do sistema de coordenadas */
  translate(dx: number, dy: number): void
}
