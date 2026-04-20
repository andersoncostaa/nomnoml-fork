/**
 * Gerenciador de rotas baseado no hash da URL.
 * Permite identificar o contexto da aplicação (ex: visualizar um diagrama compartilhado ou editar um arquivo salvo).
 */
export class Route {
  constructor(
    /** O contexto da rota (ex: 'view', 'file') */
    public context: string,
    /** O caminho ou conteúdo associado à rota */
    public path: string
  ){}

  /**
   * Converte uma string de hash da URL (ex: #file/meu-diagrama) em um objeto Route.
   */
  static from(hash: string): Route {
    var slashIndex = hash.indexOf('/')
    if (hash[0] == '#' && slashIndex > -1) {
      return {
        context: Route.urlDecode(hash.substr(1, slashIndex-1)),
        path: Route.urlDecode(hash.substr(slashIndex+1))
      }
    }
    return { context: '', path: '' }
  }

  /** Codifica uma string para uso seguro em URLs */
  static urlEncode(unencoded: string) {
    return encodeURIComponent(unencoded).replace(/'/g,'%27').replace(/"/g,'%22')
  }

  /** Decodifica uma string de URL, convertendo símbolos especiais de volta ao normal */
  static urlDecode(encoded: string) {
    return decodeURIComponent(encoded.replace(/\+/g, ' '))
  }
}
