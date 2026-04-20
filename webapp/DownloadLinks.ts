/**
 * Utilitário para gerenciar a exportação e download do diagrama em diferentes formatos.
 * Suporta PNG (a partir do Canvas), SVG e o código-fonte (.nomnoml).
 */
// @ts-ignore
import saveAs from "file-saver"

export class DownloadLinks {

  filename: string = 'graph'
  source: string = ''
  
  constructor(private canvasElement: HTMLCanvasElement) {}

  /** Exporta o conteúdo atual do Canvas como uma imagem PNG */
  pngDownload(){
    var dynamic: any = this.canvasElement
    if (!!dynamic.msToBlob) {
      saveAs(dynamic.msToBlob(), this.filename + '.png')
    }
    else {
      this.canvasElement.toBlob((blob: Blob) => saveAs(blob, this.filename + '.png'))
    }
  }

  /** Renderiza o código atual em SVG e dispara o download do arquivo */
  svgDownload(renderSvg: (src: string, document?: Document) => string){
    var svg = renderSvg(this.source, document)
    saveAs(new Blob([svg], {type: 'image/svg+xml'}), this.filename + '.svg')
  }

  /** Dispara o download do arquivo de texto com o código-fonte nomnoml */
  srcDownload(){
    var src = this.source
    saveAs(new Blob([src], {type: 'text/txt'}), this.filename + '.nomnoml')
  }

  /** Sanitiza e define o nome do arquivo para exportação */
  setFilename(filename: string): void {
    filename = filename || 'nomnoml'
    // Remove caracteres especiais não permitidos em nomes de arquivos
    this.filename = filename.replace(/[^ a-zA-Z0-9_-]/g, '_')
  }
}
