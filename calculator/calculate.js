/**
 * calculate.js - Funciones encargadas de los cálculos matemáticos de la fórmula de Bhaskara
 */

import { gcd3, normalizeCoefficients } from './normalize.js';
import {
  roundTo,
  formatRadical,
  simplifyFraction,
  formatComplexDecimal,
  formatMathToMathML
} from './format.js';

/**
 * Crea un objeto de raíz que incluye tanto el valor de texto como su representación formateada en MathML
 * con casita de raíz cuadrada y fracciones apiladas verticalmente.
 * 
 * @param {string} name Nombre identificador (ej: "x₁", "x₂", "x₁ = x₂")
 * @param {string} value Valor simplificado
 * @param {string|null} raw Valor inicial sin simplificar
 * @returns {object}
 */
function createRoot(name, value, raw = null) {
  const isRawDifferent = raw && raw !== value;
  const rawVal = isRawDifferent ? raw : null;
  return {
    name,
    value,
    raw: rawVal,
    math: formatMathToMathML(value),
    rawMath: rawVal ? formatMathToMathML(rawVal) : null
  };
}

/**
 * Descompone y simplifica una raíz cuadrada entera: sqrt(n) = outside * sqrt(inside)
 * Ejemplos:
 *   simplifySquareRoot(8)  -> { outside: 2, inside: 2 } (2√2)
 *   simplifySquareRoot(12) -> { outside: 2, inside: 3 } (2√3)
 *   simplifySquareRoot(16) -> { outside: 4, inside: 1 } (4)
 * 
 * @param {number} n Entero no negativo
 * @returns {{ outside: number, inside: number }}
 */
export function simplifySquareRoot(n) {
  if (n <= 0) return { outside: 0, inside: 0 };
  let outside = 1;
  let inside = Math.round(n);
  let d = 2;
  while (d * d <= inside) {
    if (inside % (d * d) === 0) {
      outside *= d;
      inside /= (d * d);
    } else {
      d++;
    }
  }
  return { outside, inside };
}

/**
 * Calcula el discriminante de la ecuación cuadrática: Δ = b² - 4ac
 * @param {number} a Coeficiente cuadrático
 * @param {number} b Coeficiente lineal
 * @param {number} c Término independiente
 * @returns {number}
 */
export function calculateDiscriminant(a, b, c) {
  return b * b - 4 * a * c;
}

/**
 * Calcula las raíces de la ecuación cuadrática exclusivamente en el conjunto de los Números Reales (ℝ).
 * Si el discriminante es negativo, indica que no tiene raíces reales.
 *
 * @param {number} a Coeficiente cuadrático (a ≠ 0)
 * @param {number} b Coeficiente lineal
 * @param {number} c Término independiente
 * @param {"fractional" | "decimal"} format Formato de salida: "fractional" o "decimal"
 * @returns {object} Resultado del cálculo con raíces, discriminante y metadatos
 */
export function calculateRealRoots(a, b, c, format = "fractional") {
  if (a === 0) {
    throw new Error("El coeficiente 'a' no puede ser 0 en una ecuación cuadrática.");
  }

  const delta = calculateDiscriminant(a, b, c);

  if (delta < 0) {
    return {
      success: true,
      domain: "real",
      format,
      hasRealRoots: false,
      isDoubleRoot: false,
      discriminant: delta,
      message: `No existen soluciones en los Números Reales (ℝ) porque el discriminante es negativo (Δ = ${roundTo(delta)} < 0). Puedes seleccionar el modo 'Números Complejos' para calcular sus raíces complejas.`,
      roots: []
    };
  }

  // Modo Decimal
  if (format === "decimal") {
    if (delta === 0) {
      const root = roundTo(-b / (2 * a));
      return {
        success: true,
        domain: "real",
        format: "decimal",
        hasRealRoots: true,
        isDoubleRoot: true,
        discriminant: delta,
        roots: [
          createRoot("x₁ = x₂", `${root}`)
        ]
      };
    }

    const sqrtDelta = Math.sqrt(delta);
    const r1 = roundTo((-b + sqrtDelta) / (2 * a));
    const r2 = roundTo((-b - sqrtDelta) / (2 * a));
    return {
      success: true,
      domain: "real",
      format: "decimal",
      hasRealRoots: true,
      isDoubleRoot: false,
      discriminant: delta,
      roots: [
        createRoot("x₁", `${r1}`),
        createRoot("x₂", `${r2}`)
      ]
    };
  }

  // Modo Fraccionario / Radical exacto
  const { A, B, C } = normalizeCoefficients(a, b, c);
  const intDelta = B * B - 4 * A * C;
  const den = 2 * A;

  if (intDelta === 0) {
    const val = simplifyFraction(-B, den);
    return {
      success: true,
      domain: "real",
      format: "fractional",
      hasRealRoots: true,
      isDoubleRoot: true,
      discriminant: delta,
      roots: [
        createRoot("x₁ = x₂", val)
      ]
    };
  }

  const { outside, inside } = simplifySquareRoot(intDelta);

  // Cuadrado perfecto (raíz entera)
  if (inside === 1) {
    const r1 = simplifyFraction(-B + outside, den);
    const r2 = simplifyFraction(-B - outside, den);
    return {
      success: true,
      domain: "real",
      format: "fractional",
      hasRealRoots: true,
      isDoubleRoot: false,
      discriminant: delta,
      roots: [
        createRoot("x₁", r1),
        createRoot("x₂", r2)
      ]
    };
  }

  // Raíz irracional con radical simplificado y expresión directa
  const g = gcd3(Math.abs(B), outside, Math.abs(den));
  const bPrime = -B / g;
  const kPrime = outside / g;
  const dPrime = Math.abs(den) / g;

  const rad = formatRadical(kPrime, inside);
  const unreducedRad = formatRadical(outside, inside);
  const rawDen = Math.abs(den);
  const rawB = -B;

  let x1, x2, x1Raw, x2Raw;
  if (bPrime === 0) {
    x1 = dPrime === 1 ? `${rad}` : `${rad}/${dPrime}`;
    x2 = dPrime === 1 ? `-${rad}` : `-${rad}/${dPrime}`;
    x1Raw = `${unreducedRad}/${rawDen}`;
    x2Raw = `-${unreducedRad}/${rawDen}`;
  } else {
    x1 = dPrime === 1 ? `${bPrime} + ${rad}` : `(${bPrime} + ${rad})/${dPrime}`;
    x2 = dPrime === 1 ? `${bPrime} - ${rad}` : `(${bPrime} - ${rad})/${dPrime}`;
    x1Raw = `(${rawB} + ${unreducedRad})/${rawDen}`;
    x2Raw = `(${rawB} - ${unreducedRad})/${rawDen}`;
  }

  return {
    success: true,
    domain: "real",
    format: "fractional",
    hasRealRoots: true,
    isDoubleRoot: false,
    discriminant: delta,
    roots: [
      createRoot("x₁", x1, x1Raw),
      createRoot("x₂", x2, x2Raw)
    ]
  };
}

/**
 * Calcula las raíces de la ecuación cuadrática en el conjunto de los Números Complejos (ℂ).
 * Si el discriminante es negativo, produce dos raíces complejas conjugadas (ej: -1 + 2i, -1 - 2i).
 *
 * @param {number} a Coeficiente cuadrático (a ≠ 0)
 * @param {number} b Coeficiente lineal
 * @param {number} c Término independiente
 * @param {"fractional" | "decimal"} format Formato de salida: "fractional" o "decimal"
 * @returns {object} Resultado del cálculo
 */
export function calculateComplexRoots(a, b, c, format = "fractional") {
  if (a === 0) {
    throw new Error("El coeficiente 'a' no puede ser 0 en una ecuación cuadrática.");
  }

  const delta = calculateDiscriminant(a, b, c);

  // Si delta >= 0, las soluciones son reales (ℝ ⊆ ℂ)
  if (delta >= 0) {
    const realResult = calculateRealRoots(a, b, c, format);
    return {
      ...realResult,
      domain: "complex"
    };
  }

  // Caso discriminante negativo: raíces complejas conjugadas
  if (format === "decimal") {
    const realPart = -b / (2 * a);
    const imagPart = Math.sqrt(-delta) / Math.abs(2 * a);
    const r1 = formatComplexDecimal(realPart, imagPart);
    const r2 = formatComplexDecimal(realPart, -imagPart);

    return {
      success: true,
      domain: "complex",
      format: "decimal",
      hasRealRoots: false,
      isDoubleRoot: false,
      discriminant: delta,
      roots: [
        createRoot("x₁", r1),
        createRoot("x₂", r2)
      ]
    };
  }

  // Formato fraccionario / radical complejo
  const { A, B, C } = normalizeCoefficients(a, b, c);
  const intDelta = B * B - 4 * A * C;
  const den = 2 * A;
  const absDelta = -intDelta;
  const { outside, inside } = simplifySquareRoot(absDelta);

  const g = gcd3(Math.abs(B), outside, Math.abs(den));
  const bPrime = -B / g;
  const kPrime = outside / g;
  const dPrime = Math.abs(den) / g;

  const radI = formatRadical(kPrime, inside, "i");
  const unreducedRadI = formatRadical(outside, inside, "i");
  const rawDen = Math.abs(den);
  const rawB = -B;

  let x1, x2, x1Raw, x2Raw;
  if (bPrime === 0) {
    x1 = dPrime === 1 ? `${radI}` : `${radI}/${dPrime}`;
    x2 = dPrime === 1 ? `-${radI}` : `-${radI}/${dPrime}`;
    x1Raw = `${unreducedRadI}/${rawDen}`;
    x2Raw = `-${unreducedRadI}/${rawDen}`;
  } else {
    x1 = dPrime === 1 ? `${bPrime} + ${radI}` : `(${bPrime} + ${radI})/${dPrime}`;
    x2 = dPrime === 1 ? `${bPrime} - ${radI}` : `(${bPrime} - ${radI})/${dPrime}`;
    x1Raw = `(${rawB} + ${unreducedRadI})/${rawDen}`;
    x2Raw = `(${rawB} - ${unreducedRadI})/${rawDen}`;
  }

  return {
    success: true,
    domain: "complex",
    format: "fractional",
    hasRealRoots: false,
    isDoubleRoot: false,
    discriminant: delta,
    roots: [
      createRoot("x₁", x1, x1Raw),
      createRoot("x₂", x2, x2Raw)
    ]
  };
}
