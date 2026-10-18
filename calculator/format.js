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

/**
 * Parsea un término individual matemático a elementos MathML.
 * @param {string} term
 * @returns {string} Fragmento MathML
 */
function parseTermToMathML(term) {
  term = term.trim();
  if (!term) return "";

  let hasI = false;
  if (term.endsWith("i")) {
    hasI = true;
    term = term.slice(0, -1).trim();
  }

  // Detecta radicales: ej. "sqrt(2)", "2sqrt(3)", "-2sqrt(3)"
  const radMatch = term.match(/^(-?\d*)\s*sqrt\((\d+)\)$/);
  if (radMatch) {
    const coeff = radMatch[1];
    const inside = radMatch[2];
    let coeffXml = "";
    if (coeff === "-") {
      coeffXml = "<mo>-</mo>";
    } else if (coeff && coeff !== "1") {
      if (coeff.startsWith("-")) {
        coeffXml = `<mo>-</mo><mn>${coeff.slice(1)}</mn>`;
      } else {
        coeffXml = `<mn>${coeff}</mn>`;
      }
    }
    const radXml = `${coeffXml}<msqrt><mn>${inside}</mn></msqrt>`;
    return hasI ? `${radXml}<mi>i</mi>` : radXml;
  }

  if (hasI) {
    if (term === "" || term === "1") return "<mi>i</mi>";
    if (term === "-") return "<mo>-</mo><mi>i</mi>";
    if (term.startsWith("-")) return `<mo>-</mo><mn>${term.slice(1)}</mn><mi>i</mi>`;
    return `<mn>${term}</mn><mi>i</mi>`;
  }

  if (term.startsWith("-")) {
    return `<mo>-</mo><mn>${term.slice(1)}</mn>`;
  }
  return `<mn>${term}</mn>`;
}

/**
 * Parsea una subexpresión (numerador, denominador o término aislado) a MathML.
 * @param {string} str
 * @returns {string}
 */
function parseSubExprToMathML(str) {
  str = str.trim();
  if (str.startsWith("(") && str.endsWith(")")) {
    str = str.slice(1, -1).trim();
  }

  const tokens = [];
  let current = "";
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if ((ch === "+" || ch === "-") && i > 0 && str[i - 1] !== "(" && str[i - 1] !== "e" && str[i - 1] !== "E") {
      if (current.trim()) tokens.push(current.trim());
      tokens.push(ch);
      current = "";
    } else {
      current += ch;
    }
  }
  if (current.trim()) tokens.push(current.trim());

  let result = "";
  for (const tok of tokens) {
    if (tok === "+") {
      result += "<mo>+</mo>";
    } else if (tok === "-") {
      result += "<mo>-</mo>";
    } else {
      result += parseTermToMathML(tok);
    }
  }
  return result;
}

/**
 * Convierte una expresión matemática (fracciones con /, radicales con sqrt(), números complejos con i)
 * a representación estándar MathML nativa de HTML5 para renderizar fracciones verticales con línea divisora
 * y casita de raíz cuadrada exacta.
 *
 * Ejemplos:
 *   formatMathToMathML("2sqrt(2)/2")   -> <math><mfrac><mrow>2<msqrt><mn>2</mn></msqrt></mrow><mn>2</mn></mfrac></math>
 *   formatMathToMathML("sqrt(2)")       -> <math><msqrt><mn>2</mn></msqrt></math>
 *   formatMathToMathML("(-5 + sqrt(17))/4") -> <math><mfrac><mrow><mo>-</mo>5+<msqrt>17</msqrt></mrow><mn>4</mn></mfrac></math>
 *
 * @param {string|number} expr Expresión matemática en texto
 * @returns {string} Marcado MathML renderizable en HTML
 */
export function formatMathToMathML(expr) {
  if (!expr && expr !== 0) return "";
  expr = String(expr).trim();

  // Caso Fracción: contiene "/"
  if (expr.includes("/")) {
    const slashIdx = expr.lastIndexOf("/");
    let numStr = expr.slice(0, slashIdx).trim();
    let denStr = expr.slice(slashIdx + 1).trim();

    let leadingMinus = false;
    if (numStr.startsWith("-") && !numStr.includes("+") && !numStr.slice(1).includes("-")) {
      leadingMinus = true;
      numStr = numStr.slice(1).trim();
    }

    const numXml = parseSubExprToMathML(numStr);
    const denXml = parseSubExprToMathML(denStr);

    const fracXml = `<mfrac><mrow>${numXml}</mrow><mrow>${denXml}</mrow></mfrac>`;
    return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">${leadingMinus ? "<mo>-</mo>" : ""}${fracXml}</math>`;
  }

  return `<math xmlns="http://www.w3.org/1998/Math/MathML" display="inline">${parseSubExprToMathML(expr)}</math>`;
}
