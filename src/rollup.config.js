/**
 * Configuração do Rollup para empacotar a biblioteca nomnoml.
 * Transpila o código TypeScript para JavaScript (formato UMD) 
 * pronto para uso tanto em browsers quanto em ambiente Node.js.
 */
import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import ignore from 'rollup-plugin-ignore'

export default {
  // Ponto de entrada da biblioteca
  input: 'src/index.ts',
  output: {
    // Arquivo final empacotado
    file: 'dist/nomnoml.js',
    // Formato UMD para compatibilidade universal (CommonJS, AMD e Global)
    format: 'umd',
    // Nome global da biblioteca (ex: window.nomnoml)
    name: 'nomnoml',
    // Mapeia dependências externas para nomes globais
    globals: { graphre: 'graphre' },
  },
  // Bibliotecas que não devem ser incluídas no pacote final (carregadas externamente)
  external: ['graphre'],
  plugins: [
    // Ignora módulos nativos do Node.js ao compilar para a web
    ignore(['fs', 'path', 'ignore']),
    // Plugin de integração com TypeScript para transpilação e checagem de tipos
    typescript({
      target: 'es2021',
      removeComments: true,
      noUnusedLocals: true,
      noImplicitAny: true,
      strictNullChecks: true,
      moduleResolution: 'node',
      include: ['src/*.ts'],
    }),
    // Resolve dependências instaladas via npm (node_modules)
    nodeResolve(),
    // Converte módulos CommonJS para ES Modules para que o Rollup possa processá-los
    commonjs({ include: ['dist/**'] }),
  ],
}
