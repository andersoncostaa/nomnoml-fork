/**
 * Módulo responsável por transformar o código-fonte (strings) em uma estrutura de dados (AST).
 * Utiliza o 'linearParse' para a análise léxica/sintática e processa as diretivas de configuração.
 */
import { Ranker } from 'graphre/decl/types'
import { Config, Style, Visual } from './domain'
import { linearParse } from './linearParse'
import { last } from './util'
import { styles } from './visuals'

export { ParseError } from './linearParse'

/** Resultado completo do parsing, incluindo a árvore de partes e configurações */
export interface ParsedDiagram {
  root: Part
  directives: Directive[]
  config: Config
}

/** Estrutura básica da Árvore de Sintaxe Abstrata (AST) */
export interface Ast {
  root: Part
  directives: Directive[]
}

/** Representa uma parte do diagrama (pode conter nós e associações) */
export interface Part {
  nodes: Node[]
  assocs: Association[]
  lines: string[]
}

/** Representa uma diretiva (ex: #fill: red) */
export interface Directive {
  key: string
  value: string
}

/** Representa um elemento (nó) no diagrama */
export interface Node {
  id: string
  type: string
  attr: Record<string, string>
  parts: Part[]
}

/** Representa uma conexão entre dois nós */
export interface Association {
  id?: string
  type: string
  start: string
  end: string
  startLabel: { text: string }
  endLabel: { text: string }
}

/**
 * Função principal de parsing que converte o texto fonte em um ParsedDiagram.
 */
export function parse(source: string): ParsedDiagram {
  const { root, directives } = linearParse(source)

  return { root, directives, config: getConfig(directives) }

  /** Converte os termos de direção 'down'/'right' para o padrão do Dagre (TB/LR) */
  function directionToDagre(word: string): 'TB' | 'LR' {
    if (word == 'down') return 'TB'
    if (word == 'right') return 'LR'
    else return 'TB'
  }

  /** Valida e retorna o algoritmo de rankeamento do grafo */
  function parseRanker(word: string | undefined): Ranker {
    if (word == 'network-simplex' || word == 'tight-tree' || word == 'longest-path') {
      return word
    }
    return 'network-simplex'
  }

  /** Faz o parsing de uma definição de estilo personalizado (ex: .my-style: fill=red bold) */
  function parseCustomStyle(styleDef: string): Style {
    const floatingKeywords = styleDef.replace(/[a-z]*=[^ ]+/g, '')
    const titleDef = last(styleDef.match('title=([^ ]*)') || [''])
    const bodyDef = last(styleDef.match('body=([^ ]*)') || [''])
    return {
      title: {
        bold: titleDef.includes('bold') || floatingKeywords.includes('bold'),
        underline: titleDef.includes('underline') || floatingKeywords.includes('underline'),
        italic: titleDef.includes('italic') || floatingKeywords.includes('italic'),
        center: !(titleDef.includes('left') || styleDef.includes('align=left')),
      },
      body: {
        bold: bodyDef.includes('bold'),
        underline: bodyDef.includes('underline'),
        italic: bodyDef.includes('italic'),
        center: bodyDef.includes('center'),
      },
      dashed: styleDef.includes('dashed'),
      fill: last(styleDef.match('fill=([^ ]*)') || []),
      stroke: last(styleDef.match('stroke=([^ ]*)') || []),
      visual: (last(styleDef.match('visual=([^ ]*)') || []) || 'class') as Visual,
      direction: directionToDagre(last(styleDef.match('direction=([^ ]*)') || [])),
    }
  }

  /** Compila todas as diretivas encontradas em um objeto Config consolidado */
  function getConfig(directives: Directive[]): Config {
    const d = Object.fromEntries(directives.map((e) => [e.key, e.value]))
    const userStyles: { [index: string]: Style } = {}
    for (const key in d) {
      if (key[0] != '.') continue
      const styleDef = d[key]
      userStyles[key.substring(1)] = parseCustomStyle(styleDef)
    }
    return {
      arrowSize: +d.arrowSize || 1,
      bendSize: +d.bendSize || 0.3,
      direction: directionToDagre(d.direction),
      gutter: +d.gutter || 20,
      edgeMargin: +d.edgeMargin || 0,
      gravity: Math.round(+(d.gravity ?? 1)),
      edges: d.edges == 'hard' ? 'hard' : 'rounded',
      fill: (d.fill || '#eee8d5;#fdf6e3;#eee8d5;#fdf6e3').split(';'),
      background: d.background || 'transparent',
      fillArrows: d.fillArrows === 'true',
      font: d.font || 'Helvetica',
      fontSize: +d.fontSize || 12,
      leading: +d.leading || 1.35,
      lineWidth: +d.lineWidth || 3,
      padding: +d.padding || 8,
      spacing: +d.spacing || 40,
      stroke: d.stroke || '#33322E',
      title: d.title || '',
      zoom: +d.zoom || 1,
      acyclicer: d.acyclicer === 'greedy' ? 'greedy' : undefined,
      ranker: parseRanker(d.ranker),
      styles: { ...styles, ...userStyles },
    }
  }
}
