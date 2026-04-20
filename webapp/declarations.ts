/**
 * Definições de interfaces para a biblioteca CodeMirror.
 * Como o CodeMirror é carregado via script externo ou de forma dinâmica, estas interfaces
 * garantem a segurança de tipos dentro da aplicação sem depender de @types completos.
 */

export interface CodeMirror {
  /** Inicializa o editor a partir de um elemento <textarea> */
  fromTextArea(textarea: HTMLTextAreaElement, options: any): CodeMirrorEditor
}

export interface CodeMirrorEditor {
  /** Retorna o conteúdo atual do editor */
  getValue(): string
  /** Define um novo conteúdo para o editor */
  setValue(value: string): void
  /** Aplica um estilo visual a um intervalo de texto (ex: para destacar erros) */
  markText(
    from: { line: number; ch: number },
    to: { line: number; ch: number },
    attr: { css: string },
  ): { clear(): void }
  /** Registra ouvintes para eventos do editor (mudanças, drag&drop, etc.) */
  on(event: string, callback: (arg?: any, arg2?: any) => void): void
  /** Retorna o elemento HTML raiz do editor */
  getWrapperElement(): HTMLElement
}
