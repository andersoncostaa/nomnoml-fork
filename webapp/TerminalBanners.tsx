/**
 * Componente React que exibe mensagens de erro críticas na interface.
 * Monitora o evento 'compile-error' da aplicação para informar o usuário sobre falhas de parsing.
 */
import * as React from 'react'
import { useState, useEffect } from 'react'
import { App } from './App'

export function TerminalBanners(props: { app: App }) {
  /** Estado que armazena as informações do erro a ser exibido */
  var [error, setError] = useState<{ title: string; details: string } | null>(null)
  
  function onError(err: Error) {
    setError(err ? { title: 'Parse error', details: err.message } : null)
  }
  
  /** Subscreve e remove a subscrição do sinal de erro de compilação durante o ciclo de vida do componente */
  useEffect(() => {
    props.app.signals.on('compile-error', onError)
    return () => props.app.signals.off('compile-error', onError)
  })

  if (!error) return <terminal-banners />

  return (
    <terminal-banners>
      <banner-card data-warning>
        {error.title}
        <br />
        {/* Exibe a mensagem técnica detalhada do erro (ex: linha e caractere esperado) */}
        <code>{error.details}</code>
      </banner-card>
    </terminal-banners>
  )
}
