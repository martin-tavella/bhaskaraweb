/**
 * format.js - Funciones encargadas del formato y representación de números, fracciones, radicales y complejos
 */

import { gcd } from './normalize.js';

/**
 * Redondea un número a una cantidad específica de decimales.
 * @param {number} num
 * @param {number} decimals
 * @returns {number}
 */
export function roundTo(num, decimals = 4) {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Formatea un radical con prefijo numérico y sufijo opcional (ej: "i" para números complejos).
 * Ejemplos:
 *   formatRadical(2, 2) -> "2sqrt(2)"
 *   formatRadical(1, 3) -> "sqrt(3)"
 *   formatRadical(4, 1) -> "4"
 *   formatRadical(2, 2, "i") -> "2sqrt(2)i"
 * 
 * @param {number} outside Factor fuera del radical
 * @param {number} inside Radicando (dentro de la raíz)
 * @param {string} suffix Sufijo opcional (ej: "i")
 * @returns {string}
 */
export function formatRadical(outside, inside, suffix = "") {
  if (outside === 0 || inside === 0) return "0";
  let radStr = "";
  if (inside === 1) {
    radStr = `${outside}`;
  } else if (outside === 1) {
    radStr = `sqrt(${inside})`;
  } else {
    radStr = `${outside}sqrt(${inside})`;
  }

  if (suffix) {
    if (radStr === "1") return suffix;
    return `${radStr}${suffix}`;
  }
  return radStr;
}

/**
 * Simplifica una fracción y la devuelve irreducible como string.
 * Ejemplos:
 *   simplifyFraction(4, 2) -> "2"
 *   simplifyFraction(2, 4) -> "1/2"
 *   simplifyFraction(-3, 6) -> "-1/2"
 * 
 * @param {number} numerator
 * @param {number} denominator
 * @returns {string}
 */
export function simplifyFraction(numerator, denominator) {
  if (denominator === 0) {
    throw new Error("El denominador no puede ser cero.");
  }
  if (numerator === 0) return "0";
  const sign = (numerator < 0) ^ (denominator < 0) ? -1 : 1;
  const num = Math.abs(Math.round(numerator));
  const den = Math.abs(Math.round(denominator));
  const g = gcd(num, den);
  const sNum = (num / g) * sign;
  const sDen = den / g;
  return sDen === 1 ? `${sNum}` : `${sNum}/${sDen}`;
}

/**
 * Formatea un número complejo en notación decimal: a + bi / a - bi.
 * 
 * @param {number} real Parte real
 * @param {number} imag Parte imaginaria
 * @returns {string}
 */
export function formatComplexDecimal(real, imag) {
  const r = roundTo(real);
  const i = roundTo(imag);
  const absI = Math.abs(i);
  const iStr = absI === 1 ? "i" : `${absI}i`;

  if (r === 0 && i === 0) return "0";
  if (r === 0) return i < 0 ? `-${iStr}` : `${iStr}`;
  if (i === 0) return `${r}`;
  return i < 0 ? `${r} - ${iStr}` : `${r} + ${iStr}`;
}
