/**
 * normalize.js - Funciones para normalización numérica y simplificación de coeficientes
 */

/**
 * Calcula el máximo común divisor (MCD / GCD) entre dos enteros mediante el algoritmo de Euclides.
 * @param {number} a
 * @param {number} b
 * @returns {number}
 */
export function gcd(a, b) {
  let x = Math.abs(Math.round(a));
  let y = Math.abs(Math.round(b));
  while (y) {
    const t = y;
    y = x % y;
    x = t;
  }
  return x;
}

/**
 * Calcula el máximo común divisor (MCD) entre tres números enteros.
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
export function gcd3(a, b, c) {
  return gcd(gcd(a, b), c);
}

/**
 * Normaliza los coeficientes (incluso si tienen decimales) a números enteros equivalentes (A, B, C)
 * simplificando por el factor común para facilitar la representación fraccionaria exacta.
 * 
 * @param {number} a Coeficiente cuadrático
 * @param {number} b Coeficiente lineal
 * @param {number} c Término independiente
 * @returns {{ A: number, B: number, C: number }}
 */
export function normalizeCoefficients(a, b, c) {
  const getDecimals = (n) => {
    const str = n.toString();
    if (str.includes(".")) {
      return str.split(".")[1].length;
    }
    return 0;
  };

  const maxDec = Math.max(getDecimals(a), getDecimals(b), getDecimals(c));
  const factor = Math.pow(10, Math.min(maxDec, 6));

  let A = Math.round(a * factor);
  let B = Math.round(b * factor);
  let C = Math.round(c * factor);

  const common = gcd3(A, B, C);
  if (common > 0) {
    A /= common;
    B /= common;
    C /= common;
  }

  // Asegurar que A sea siempre positivo para coherencia de signos
  if (A < 0) {
    A = -A;
    B = -B;
    C = -C;
  }

  return { A, B, C };
}
