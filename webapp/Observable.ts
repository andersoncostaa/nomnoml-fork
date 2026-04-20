/**
 * Implementação simples do padrão Observer (Publicador/Assinante).
 * Permite que diferentes partes da aplicação se comuniquem através de eventos.
 */
export class Observable {

  /** Dicionário que armazena as listas de callbacks para cada evento */
  callbacks: { [key: string]: Function[] } = {}

  /** Inscreve uma função para ser chamada quando um evento específico ocorrer */
  on(event: string, fn: Function): void {
    if (!this.callbacks[event]) {
      this.callbacks[event] = []
    }
    this.callbacks[event].push(fn)
  }

  /** Remove a inscrição de uma função de um evento */
  off(event: string, fn: Function): void {
    var fns: Function[] = this.callbacks[event]
    if (fns) {
      var index = fns.indexOf(fn)
      if (index !== -1) fns.splice(index, 1)
      if (fns.length === 0) delete this.callbacks[event]
    }
  }

  /** Dispara um evento, executando todas as funções inscritas com os argumentos fornecidos */
  trigger(event: string, ...args: any[]): void {
    var fns = this.callbacks[event]
    if (fns) for (let fn of fns) fn.apply(null, args)
  }
}
