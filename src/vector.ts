/**
 * Operações matemáticas básicas para vetores 2D utilizados no cálculo de layouts e desenho.
 */

/** Interface que representa um vetor ou ponto no plano cartesiano */
export interface Vec {
  x: number
  y: number
}

/** Calcula a distância euclidiana entre dois pontos */
export function dist(a: Vec, b: Vec): number {
  return mag(diff(a, b))
}

/** Soma dois vetores */
export function add(a: Vec, b: Vec): Vec {
  return { x: a.x + b.x, y: a.y + b.y }
}

/** Subtrai o vetor 'b' do vetor 'a' */
export function diff(a: Vec, b: Vec): Vec {
  return { x: a.x - b.x, y: a.y - b.y }
}

/** Multiplica um vetor por um escalar */
export function mult(v: Vec, factor: number): Vec {
  return { x: factor * v.x, y: factor * v.y }
}

/** Calcula o módulo (magnitude/comprimento) de um vetor */
export function mag(v: Vec): number {
  return Math.sqrt(v.x * v.x + v.y * v.y)
}

/** Retorna um vetor com a mesma direção, mas de comprimento unitário (1) */
export function normalize(v: Vec): Vec {
  return mult(v, 1 / mag(v))
}

/** Rotaciona o vetor em 90 graus no sentido horário */
export function rot(a: Vec): Vec {
  return { x: a.y, y: -a.x }
}
