/**
 * Gerencia a integração visual entre os erros de parsing e o editor CodeMirror.
 * Responsável por destacar linhas e colunas onde ocorrem falhas de sintaxe.
 */
import { CodeMirrorEditor } from './declarations'

export class DevEnv {
  /** Referência para a marcação visual do erro no editor */
  mark: void | { clear(): void }
  /** Referência para o destaque da linha inteira com erro */
  lineMark: void | { clear(): void }

  constructor(
    private editor: CodeMirrorEditor,
    private lineNumbers: HTMLElement,
  ) {}

  /** Remove todos os destaques de erro e estados visuais de falha */
  clearState() {
    this.mark?.clear()
    this.lineMark?.clear()
    this.lineNumbers.classList.remove('error')
  }

  /**
   * Aplica destaque visual no editor em uma localização específica de erro.
   * Pinta o fundo da linha e do caractere onde o erro foi detectado.
   */
  setError(location: { column: number; line: number }) {
    this.mark?.clear()
    this.lineMark?.clear()
    this.lineNumbers.classList.add('error')
    
    // Destaca a linha inteira com um tom suave
    this.lineMark = this.editor.markText(
      { line: location.line - 1, ch: 0 },
      { line: location.line - 1, ch: 100 },
      { css: 'background: #f884' }
    )
    
    // Destaca o ponto exato do erro com um tom mais forte
    this.mark = this.editor.markText(
      { line: location.line - 1, ch: location.column - 2 },
      { line: location.line - 1, ch: location.column + 1 },
      { css: 'background: #f88a' }
    )
  }
}
