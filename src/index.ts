/**
 * Ponto de entrada principal da biblioteca nomnoml.
 * Exporta as funções fundamentais para desenho, renderização e processamento de arquivos.
 */
export {
  draw,
  renderSvg,
  compileFile,
  processImports,
  processAsyncImports,
  ImportDepthError,
} from './nomnoml'

/** Versão atual da biblioteca */
export const version = '1.7.0'

/** Utilitários diversos mantidos sob o namespace histórico 'skanaar' */
export * as skanaar from './util'

/** Parser responsável por converter o código nomnoml em uma Árvore de Sintaxe Abstrata (AST) */
export { parse, ParseError } from './parser'

/** Motor de layout que calcula o posicionamento de nós e arestas */
export { layout } from './layouter'

/** Definições de estilos e implementações de visualização para diferentes tipos de nós */
export { styles, visualizers } from './visuals'
