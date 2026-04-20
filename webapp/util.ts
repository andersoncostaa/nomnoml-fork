/**
 * Funções utilitárias específicas para a interface web.
 * Inclui manipulação de strings HTML e controle de frequência de execução (throttle/debounce).
 */

/** Helper interno para execução atrasada de funções */
function delay(func: Function, wait: number, ...args: any[]) {
  return setTimeout(() => func.apply(null, args), wait);
}

/** 
 * Converte entidades HTML de volta para seus caracteres originais.
 * Útil ao ler código nomnoml embutido em tags HTML.
 */
export function unescapeHtml(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x60;/g, '`')
}

/**
 * Garante que a função só seja executada no máximo uma vez a cada 'wait' milissegundos.
 * Útil para eventos que disparam com muita frequência, como o resize da janela.
 */
export function throttle(func: Function, wait: number, options: { leading?: boolean, trailing?: boolean } = {}) {
  var timeout: NodeJS.Timeout|null;
  var context: any;
  var args: IArguments|null;
  var result: any;
  var previous = 0;

  var later = function() {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };

  return function() {
    var _now = Date.now();
    if (!previous && options.leading === false) previous = _now;
    var remaining = wait - (_now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = _now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

/**
 * Adia a execução da função até que se passem 'wait' milissegundos sem novas chamadas.
 * Fundamental para atualizar o diagrama enquanto o usuário digita no editor sem travar a UI.
 */
export function debounce(func: Function, wait: number, immediate: boolean = false) {
  var timeout: any;
  var result: any;

  function later(context: any, args: any[]) {
    timeout = null;
    if (args) result = func.apply(context, args);
  }

  return function(...args: any[]) {
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      var callNow = !timeout;
      timeout = setTimeout(later, wait);
      if (callNow) result = func.apply(this, args);
    } else {
      timeout = delay(later, wait, this, args);
    }

    return result;
  }
}
