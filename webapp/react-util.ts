/**
 * Utilitários React para manipulação de eventos.
 */

/**
 * Helper que encapsula a função preventDefault() nativa dos eventos do browser.
 * Garante que a ação padrão do navegador (como recarregar a página em links/forms) não ocorra.
 */
export function prevent<T extends { preventDefault(): void }, U>(func: (e: T) => U) {
  return function (e: T) {
    e.preventDefault()
    func(e)
  }
}
