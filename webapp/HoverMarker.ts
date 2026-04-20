/**
 * Utilitário para aplicar uma classe CSS a um elemento quando outros elementos específicos (hoverables) 
 * estão sob o cursor do mouse. Utilizado para dar feedback visual de interação.
 */
export class HoverMarker {
  constructor(className: string, elementToMark: HTMLElement, hoverables: HTMLElement[]) {
    
    /** Cria uma função que adiciona ou remove a classe desejada */
    function classToggler(state: boolean){
      return function () {
        if(state) elementToMark.classList.add(className)
        else elementToMark.classList.remove(className)
      }
    }
    
    // Registra os ouvintes de entrada e saída do mouse em todos os elementos monitorados
    for(var element of hoverables) {
      element.addEventListener('mouseenter', classToggler(true))
      element.addEventListener('mouseleave', classToggler(false))
    }
  }
}
