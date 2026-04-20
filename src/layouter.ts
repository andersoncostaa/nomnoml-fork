/**
 * Motor de layout que utiliza a biblioteca 'graphre' para calcular o posicionamento
 * de nós e arestas no diagrama. Processa a hierarquia de compartimentos e elementos.
 */
import { Config, Measurer, RelationLabel, Style } from './domain'
import { indexBy } from './util'
import { Vec } from './vector'
import { layout as grapheLayout, graphlib } from 'graphre'
import { layouters, styles } from './visuals'
import { EdgeLabel, GraphLabel, GraphNode } from 'graphre/decl/types'
import { Part, Node, Association } from './parser'

type Quadrant = 1 | 2 | 3 | 4

/** Extensão do tipo Node com propriedades de geometria e posicionamento */
export type LayoutedNode = Omit<Node, 'parts'> & {
  x: number
  y: number
  width: number
  height: number
  layoutWidth: number
  layoutHeight: number
  dividers?: Vec[][]
  parts: LayoutedPart[]
}

/** Extensão do tipo Part com dimensões e offset calculados */
export type LayoutedPart = Omit<Part, 'nodes' | 'assocs'> & {
  width?: number
  height?: number
  offset?: Vec
  x?: number
  y?: number
  nodes: LayoutedNode[]
  assocs: LayoutedAssoc[]
}

/** Extensão do tipo Association com o caminho da linha (path) e rótulos posicionados */
export type LayoutedAssoc = Association & {
  path: Vec[]
  x?: number
  y?: number
  width?: number
  height?: number
  startLabel: EdgeLabel
  endLabel: EdgeLabel
}

/**
 * Função principal que calcula o layout de toda a árvore de elementos do diagrama.
 */
export function layout(measurer: Measurer, config: Config, ast: Part): LayoutedPart {
  
  /** Mede o espaço necessário para renderizar linhas de texto */
  function measureLines(lines: string[], fontWeight: 'normal' | 'bold') {
    if (!lines.length) return { width: 0, height: config.padding }
    measurer.setFont(config.font, config.fontSize, fontWeight, 'normal')
    return {
      width: Math.round(Math.max(...lines.map(measurer.textWidth)) + 2 * config.padding),
      height: Math.round(measurer.textHeight() * lines.length + 2 * config.padding),
    }
  }

  /** Define o layout de um compartimento individual (uma sub-parte de um nó ou o grafo raiz) */
  function layoutCompartment(c: Part, compartmentIndex: number, style: Style) {
    const textSize = measureLines(c.lines, compartmentIndex ? 'normal' : 'bold')

    // Caso base: compartimento vazio apenas com texto
    if (!c.nodes.length && !c.assocs.length) {
      const layoutedPart = c as LayoutedPart
      layoutedPart.width = textSize.width
      layoutedPart.height = textSize.height
      layoutedPart.offset = { x: config.padding, y: config.padding }
      return
    }

    const styledConfig = {
      ...config,
      direction: style.direction ?? config.direction,
    }
    const layoutedNodes = c.nodes as LayoutedNode[]
    const layoutedAssoc = c.assocs as LayoutedAssoc[]
    
    // Atribui IDs temporários para as associações para o processamento do grafo
    for (let i = 0; i < layoutedAssoc.length; i++) layoutedAssoc[i].id = `${i}`
    
    // Calcula recursivamente o layout de cada nó dentro deste compartimento
    for (const e of layoutedNodes) layoutNode(e, styledConfig)

    // Constrói a estrutura do grafo para a biblioteca de layout (graphre)
    const g = new graphlib.Graph<GraphLabel, GraphNode, EdgeLabel>({
      multigraph: true,
    })
    g.setGraph({
      rankdir: style.direction || config.direction,
      nodesep: config.spacing,
      edgesep: config.spacing,
      ranksep: config.spacing,
      acyclicer: config.acyclicer,
      ranker: config.ranker,
    })
    
    for (const e of layoutedNodes) {
      g.setNode(e.id, { width: e.layoutWidth, height: e.layoutHeight })
    }
    
    for (const r of layoutedAssoc) {
      if (r.type.indexOf('_') > -1) {
        g.setEdge(r.start, r.end, { minlen: 0 }, r.id)
      } else if ((config.gravity ?? 1) != 1) {
        g.setEdge(r.start, r.end, { minlen: config.gravity }, r.id)
      } else {
        g.setEdge(r.start, r.end, {}, r.id)
      }
    }
    
    // Executa o algoritmo de layout do grafo
    grapheLayout(g)

    const rels = indexBy(c.assocs as LayoutedAssoc[], 'id')
    const nodes = indexBy(c.nodes as LayoutedNode[], 'id')
    
    // Extrai as coordenadas calculadas de volta para os nossos objetos de nó
    for (const name of g.nodes()) {
      const node = g.node(name)
      nodes[name].x = node.x!
      nodes[name].y = node.y!
    }
    
    let left = 0
    let right = 0
    let top = 0
    let bottom = 0

    // Extrai os caminhos das arestas e posiciona os rótulos de relacionamento
    for (const edgeObj of g.edges()) {
      const edge = g.edge(edgeObj)
      const start = nodes[edgeObj.v]
      const end = nodes[edgeObj.w]
      const rel = rels[edgeObj.name!]
      rel.path = [start, ...edge.points!, end].map(toPoint)

      const startP = rel.path[1]
      const endP = rel.path[rel.path.length - 2]
      
      // Posiciona rótulos de início e fim da associação
      layoutLabel(rel.startLabel, startP, adjustQuadrant(quadrant(startP, start) ?? 4, start, end))
      layoutLabel(rel.endLabel, endP, adjustQuadrant(quadrant(endP, end) ?? 2, end, start))
      
      // Atualiza as extremidades do bounding box do compartimento
      left = Math.min(
        left,
        rel.startLabel.x!,
        rel.endLabel.x!,
        ...edge.points!.map((e) => e.x)
      )
      right = Math.max(
        right,
        rel.startLabel.x! + rel.startLabel.width!,
        rel.endLabel.x! + rel.endLabel.width!,
        ...edge.points!.map((e) => e.x)
      )
      top = Math.min(top, rel.startLabel.y!, rel.endLabel.y!, ...edge.points!.map((e) => e.y))
      bottom = Math.max(
        bottom,
        rel.startLabel.y! + rel.startLabel.height!,
        rel.endLabel.y! + rel.endLabel.height!,
        ...edge.points!.map((e) => e.y)
      )
    }
    
    const graph = g.graph()
    const width = Math.max(graph.width! + (left < 0 ? -left : 0), right - left)
    const height = Math.max(graph.height! + (top < 0 ? -top : 0), bottom - top)
    const graphHeight = height ? height + 2 * config.gutter : 0
    const graphWidth = width ? width + 2 * config.gutter : 0

    const part = c as LayoutedPart
    part.width = Math.max(textSize.width, graphWidth) + 2 * config.padding
    part.height = textSize.height + graphHeight + config.padding
    part.offset = { x: config.padding - left, y: config.padding - top }
  }

  /** Helper para clonar coordenadas de um vetor */
  function toPoint(o: Vec): Vec {
    return { x: o.x, y: o.y }
  }

  /** Calcula a posição de um rótulo de associação baseado no ponto de ancoragem e quadrante */
  function layoutLabel(label: RelationLabel, point: Vec, quadrant: Quadrant) {
    if (!label.text) {
      label.width = 0
      label.height = 0
      label.x = point.x
      label.y = point.y
    } else {
      const fontSize = config.fontSize
      const lines = label.text.split('`')
      label.width = Math.max(...lines.map((l) => measurer.textWidth(l)))
      label.height = fontSize * lines.length
      label.x =
        point.x + (quadrant == 1 || quadrant == 4 ? config.padding : -label.width - config.padding)
      label.y =
        point.y + (quadrant == 3 || quadrant == 4 ? config.padding : -label.height - config.padding)
    }
  }

  /** Determina em qual quadrante relativo a um nó o ponto se encontra */
  function quadrant(point: Vec, node: LayoutedNode): Quadrant | undefined {
    if (point.x < node.x && point.y < node.y) return 1
    if (point.x > node.x && point.y < node.y) return 2
    if (point.x > node.x && point.y > node.y) return 3
    if (point.x < node.x && point.y > node.y) return 4
    return undefined
  }

  /** Ajusta o quadrante do rótulo para evitar sobreposição com a linha de relação em curvas */
  function adjustQuadrant(quadrant: Quadrant, point: Vec, opposite: Vec): Quadrant {
    if (opposite.x == point.x || opposite.y == point.y) return quadrant
    const flipHorizontally: Quadrant[] = [4, 3, 2, 1]
    const flipVertically: Quadrant[] = [2, 1, 4, 3]
    const oppositeQuadrant =
      opposite.y < point.y ? (opposite.x < point.x ? 2 : 1) : opposite.x < point.x ? 3 : 4
    if (oppositeQuadrant === quadrant) {
      if (config.direction === 'LR') return flipHorizontally[quadrant - 1]
      if (config.direction === 'TB') return flipVertically[quadrant - 1]
    }
    return quadrant
  }

  /** Calcula o layout interno de um nó e define seu tamanho final com base no seu visualizador */
  function layoutNode(node: LayoutedNode, config: Config): void {
    const style = config.styles[node.type] || styles.class
    for (let i = 0; i < node.parts.length; i++) {
      layoutCompartment(node.parts[i], i, style)
    }
    const visual = layouters[style.visual] ?? layouters.class
    visual(config, node)
    node.layoutWidth = (node.width ?? 0) + 2 * config.edgeMargin
    node.layoutHeight = (node.height ?? 0) + 2 * config.edgeMargin
  }

  const root = ast as LayoutedPart
  layoutCompartment(root, 0, styles.class)
  return root
}
