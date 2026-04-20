/**
 * Ponto de entrada da aplicação web.
 * Responsável por inicializar o React, configurar a aplicação (App) e renderizar a UI.
 */
import type { CodeMirror } from './declarations'
import { createElement as el } from 'react'
import * as ReactDOM from 'react-dom'
import { App } from './App'
import { CanvasTools } from './CanvasTools'
import { ExportMenu } from './ExportMenu'
import { FileMenu } from './FileMenu'
import { Menu } from './Menu'
import { unescapeHtml } from './util'
// @ts-ignore
import * as nomnoml from '../dist/nomnoml.js'

// @ts-ignore
export * as nomnoml from '../dist/nomnoml.js'
export { DailyTip, NomnomlGraph } from './DailyTip'
export { App } from './App'

export var app: App

// @ts-ignore
export { version } from '../package.json'

/**
 * Função de inicialização chamada para montar a aplicação no DOM.
 * @param CodeMirror Instância do editor de código a ser utilizada.
 */
export function bootstrap(CodeMirror: CodeMirror) {
  app = new App(CodeMirror)
  var elem = (query: string) => document.querySelector(query)!
  
  // Renderização inicial dos componentes React de menu e ferramentas
  render()
  renderFileMenu()

  function render() {
    ReactDOM.render(el(ExportMenu, { app }), elem('[export-menu]'))
    ReactDOM.render(el(Menu, { app }), elem('[menu]'))
    ReactDOM.render(el(CanvasTools, { app }), elem('[canvas-tools]'))
  }

  function renderFileMenu() {
    ReactDOM.render(el(FileMenu, { app, files: [], isLoaded: false }), elem('[file-menu]'))
    app.filesystem.storage.files().then((files) => {
      ReactDOM.render(el(FileMenu, { app, files, isLoaded: true }), elem('[file-menu]'))
    })
  }

  // Reage a mudanças de estado na aplicação para atualizar a interface
  app.signals.on('source-changed', render)
  app.signals.on('compile-error', render)
  app.filesystem.signals.on('updated', renderFileMenu)

  /**
   * Procura no documento por elementos de pré-visualização estática e renderiza-os como SVG.
   * Utilizado para renderizar diagramas nomnoml embutidos em páginas HTML estáticas.
   */
  function renderPreviews() {
    var files: Record<string, string> = {}
    var includes = document.querySelectorAll('[publish-as-file]')
    for (var i = 0; i < includes.length; i++) {
      var name = includes[i].attributes.getNamedItem('publish-as-file')?.value!
      files[name] = unescapeHtml(includes[i].innerHTML)
    }

    var sources = document.querySelectorAll('[append-nomnoml-preview]')
    for (var i = 0; i < sources.length; i++) {
      try {
        var srcEl = sources[i]
        var src = nomnoml.processImports(unescapeHtml(srcEl.innerHTML), (key: string) => files[key])
        var svg = nomnoml.renderSvg(src, document)
        var div = document.createElement('div')
        div.innerHTML = svg
        srcEl.append(div)
      } catch (e) {}
    }
  }

  renderPreviews()
}
