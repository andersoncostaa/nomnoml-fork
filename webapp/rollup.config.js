/**
 * Configuração do Rollup para empacotar a aplicação web (webapp).
 * Combina todos os módulos TypeScript e React em um único arquivo JavaScript (IIFE)
 * otimizado para execução no navegador.
 */
import terser from '@rollup/plugin-terser'
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import ignore from 'rollup-plugin-ignore'
import gitVersion from 'rollup-plugin-git-version'

export default {
  // Ponto de entrada da aplicação web
  input: 'webapp/index.ts',
  // Bibliotecas carregadas via CDN que não devem ser incluídas no pacote
  external: ['react', 'react-dom', 'jszip'],
  output: {
    // Arquivo final da aplicação
    file: 'dist/webapp.js',
    // Formato IIFE (Immediately Invoked Function Expression) para o browser
    format: 'iife',
    name: 'WebApp',
    // Mapeia dependências externas para variáveis globais esperadas
    globals: {
      react: 'React',
      'react-dom': 'ReactDOM',
      jszip: 'JSZip',
    },
  },
  plugins: [
    // Remove dependências de Node.js ao compilar para Web
    ignore(['fs', 'path']),
    // Plugin TypeScript com suporte a JSX/React
    typescript({
      module: 'es6',
      target: 'es2020',
      noUnusedLocals: true,
      noImplicitAny: true,
      strictNullChecks: true,
      jsx: 'react',
    }),
    // Adiciona informações de versão baseadas no Git
    gitVersion(),
    // Resolve dependências npm
    nodeResolve({ preferBuiltins: true }),
    // Suporte a módulos no formato CommonJS
    commonjs({ include: ['node_modules/**', 'dist/**'] }),
    // Minifica o código final e remove comentários para produção
    terser({ output: { comments: false } }),
  ],
}
