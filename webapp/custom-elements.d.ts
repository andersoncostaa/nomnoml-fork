/**
 * Definições globais para suportar Elementos Customizados (Custom Elements) no JSX do React.
 * Permite o uso de tags personalizadas (ex: <canvas-tools>) sem erros de tipagem do TypeScript.
 */
import { DetailedHTMLProps, HTMLAttributes } from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      /** 
       * Define que qualquer tag que contenha um hífen (-) seja tratada como um elemento intrínseco válido.
       * Note que elementos customizados utilizam o atributo "class" em vez de "className".
       */
      [customElementName: `${string}-${string}`]: DetailedHTMLProps<
        HTMLAttributes<HTMLElement> & { class?: string },
        HTMLElement
      >
    }
  }
}
