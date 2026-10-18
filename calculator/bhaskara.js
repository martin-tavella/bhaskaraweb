 /**
 * bhaskara.js - Módulo de convergencia principal para la resolución de la Fórmula de Bhaskara
 * 
 * Reúne y re-exporta los módulos especializados:
 *  - normalize.js: Normalización de coeficientes y máximo común divisor (MCD).
 *  - format.js: Formateo de números, fracciones, radicales exactos y números complejos.
 *  - calculate.js: Cálculo del discriminante, raíces reales y complejas.
 */

import { normalizeCoefficients, gcd, gcd3 } from './normalize.js';
import { roundTo, formatRadical, simplifyFraction, formatComplexDecimal } from './format.js';
import {
  simplifySquareRoot,
  calculateDiscriminant,
  calculateRealRoots,
  calculateComplexRoots
} from './calculate.js';

// Re-exportar todas las utilidades para permitir acceso modular o centralizado
export * from './normalize.js';
export * from './format.js';
export * from './calculate.js';

/**
 * Función principal unificada para resolver la Fórmula de Bhaskara (ax² + bx + c = 0).
 * Valida los datos ingresados y delega el cálculo a las funciones especializadas según el dominio.
 *
 * @param {number|string} rawA Coeficiente a
 * @param {number|string} rawB Coeficiente b
 * @param {number|string} rawC Coeficiente c
 * @param {object} options Opciones de configuración
 * @param {"real" | "complex"} [options.domain="real"] Conjunto numérico objetivo
 * @param {"fractional" | "decimal"} [options.format="fractional"] Formato de las raíces
 * @returns {object} Objeto con el resultado detallado de las raíces o mensaje de error
 */
export function calculateBhaskara(rawA, rawB, rawC, options = {}) {
  const { domain = "real", format = "fractional" } = options;

  const a = Number(rawA);
  const b = Number(rawB);
  const c = Number(rawC);

  if (isNaN(a) || isNaN(b) || isNaN(c)) {
    return {
      success: false,
      error: "Por favor, introduce valores numéricos válidos para a, b y c."
    };
  }

  if (a === 0) {
    return {
      success: false,
      error: "El coeficiente 'a' no puede ser cero (una ecuación con a = 0 es lineal: bx + c = 0, no cuadrática)."
    };
  }

  try {
    let result;
    if (domain === "complex") {
      result = calculateComplexRoots(a, b, c, format);
    } else {
      result = calculateRealRoots(a, b, c, format);
    }

    return {
      ...result,
      inputs: { a, b, c },
      domain,
      format
    };
  } catch (err) {
    return {
      success: false,
      error: err.message || "Ocurrió un error inesperado al resolver la ecuación."
    };
  }
}
