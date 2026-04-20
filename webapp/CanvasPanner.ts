/**
 * Gerencia a navegação interativa (pan e zoom) sobre o elemento do diagrama.
 * Captura eventos de mouse e scroll para reposicionar e redimensionar o Canvas.
 */
import { throttle } from "./util"

type Vec = { x: number, y: number }

/** Helper para calcular a diferença entre dois pontos */
function diff(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y }
}
    
export class CanvasPanner {
  
  /** Deslocamento atual do diagrama em relação ao centro */
  offset: Vec = {x:0, y:0}

  /** Nível de zoom logarítmico */
  zoomLevel: number = 0

  constructor(element: HTMLElement, private onChange: () => void) {
    var mouseDownPoint: Vec | boolean = false
    function isVec(value: Vec | boolean): value is Vec { return value != false }

    /** Atualiza o offset enquanto o usuário arrasta o mouse */
    var mouseMove = (e: MouseEvent) => {
      if (isVec(mouseDownPoint)){
        this.offset = diff({ x: e.pageX, y: e.pageY }, mouseDownPoint)
        onChange()
      }
    }

    var mouseUp = () => {
      mouseDownPoint = false
      element.style.width = '33%'
    }

    /** Ajusta o nível de zoom baseado no movimento da roda do mouse */
    var magnify = (e: WheelEvent) => {
      this.zoomLevel = Math.min(10, this.zoomLevel - (e.deltaY < 0 ? -1 : 1))
      onChange()
    }

    var mouseDown = (e: MouseEvent) => {
      element.style.width = '100%'
      mouseDownPoint = diff({ x: e.pageX, y: e.pageY }, this.offset)
    }

    // Registra os ouvintes de eventos de interação
    element.addEventListener('mousedown', mouseDown)
    element.addEventListener('mouseup', mouseUp)
    element.addEventListener('mouseleave', mouseUp)
    element.addEventListener('wheel', throttle(magnify, 50), {passive: true})
    element.addEventListener('mousemove', throttle(mouseMove, 50), {passive: true})
  }

  /** Aplica as transformações de CSS ao elemento Canvas para refletir o pan e zoom atuais */
  positionCanvas(element: HTMLCanvasElement) {
    var viewport = window
    var w = element.width / this.superSampling
    var h = element.height / this.superSampling
    // Calcula a centralização vertical e horizontal considerando os painéis laterais
    element.style.top = 300 * (1 - h/viewport.innerHeight) + this.offset.y + 'px'
    element.style.left = 150 + (viewport.innerWidth - w)/2 + this.offset.x + 'px'
    element.style.width = w + 'px'
    element.style.height = h + 'px'
  }

  /** Fator de superamostragem para telas de alta densidade (Retina) */
  superSampling = window.devicePixelRatio || 1

  /** Converte o nível de zoom logarítmico para um fator de escala linear */
  zoom(): number {
    return this.superSampling * Math.exp(this.zoomLevel/10)
  }

  /** Aumenta ou diminui o zoom programaticamente */
  magnify(diff: number) {
    this.zoomLevel = Math.min(10, this.zoomLevel + diff)
    this.onChange()
  }

  /** Restaura o zoom e a posição originais */
  reset() {
    this.zoomLevel = 0
    this.offset = {x: 0, y: 0}
    this.onChange()
  }
}
