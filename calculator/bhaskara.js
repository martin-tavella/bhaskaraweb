/**
 * Módulo de cálculo para la Fórmula de Bhaskara (Ecuación cuadrática: ax² + bx + c = 0)
 * Provee funciones para cálculo en el dominio Real y Complejo, con formatos decimal y fraccionario/radical exacto.
 */

/**
 * Calcula el máximo común divisor (MCD / GCD) entre dos enteros
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
 * Calcula el MCD entre tres números
 * @param {number} a
 * @param {number} b
 * @param {number} c
 * @returns {number}
 */
export function gcd3(a, b, c) {
  return gcd(gcd(a, b), c);
}

/**
 * Descompone y simplifica una raíz cuadrada entera: sqrt(n) = outside * sqrt(inside)
 * Ejemplo: simplifySquareRoot(8) -> { outside: 2, inside: 2 } (2√2)
 * Ejemplo: simplifySquareRoot(12) -> { outside: 2, inside: 3 } (2√3)
 * Ejemplo: simplifySquareRoot(16) -> { outside: 4, inside: 1 } (4)
 * @param {number} n
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
 * Simplifica una fracción y la devuelve irreducible
 * @param {number} numerator
 * @param {number} denominator
 * @returns {string} Fracción simplificada (ej: "1/2", "-3", "0")
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
 * Formatea un radical con prefijo numérico y sufijo opcional (ej: "i" para complejos)
 * @param {number} outside
 * @param {number} inside
 * @param {string} suffix
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
 * Redondea un número a una cantidad específica de decimales
 * @param {number} num
 * @param {number} decimals
 * @returns {number}
 */
export function roundTo(num, decimals = 4) {
  const factor = Math.pow(10, decimals);
  return Math.round((num + Number.EPSILON) * factor) / factor;
}

/**
 * Formatea un número complejo en notación decimal: a + bi
 * @param {number} real
 * @param {number} imag
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
 * Normaliza los coeficientes a enteros para simplificaciones de fracciones exactas
 * @param {number} a
 * @param {number} b
 * @param {number} c
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
  if (A < 0) {
    A = -A;
    B = -B;
    C = -C;
  }
  return { A, B, C };
}

/**
 * Calcula el discriminante de la ecuación cuadrática: Δ = b² - 4ac
 * @param {number} a
 * @param {number} b
 * @param {number} c
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
 * @param {"fractional" | "decimal"} format Formato de salida: "fractional" (con radicales) o "decimal"
 * @returns {object} Resultado del cálculo
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
          { name: "x₁ = x₂", value: `${root}`, raw: null }
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
        { name: "x₁", value: `${r1}`, raw: null },
        { name: "x₂", value: `${r2}`, raw: null }
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
        { name: "x₁ = x₂", value: val, raw: null }
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
        { name: "x₁", value: r1, raw: null },
        { name: "x₂", value: r2, raw: null }
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
      { name: "x₁", value: x1, raw: x1Raw !== x1 ? x1Raw : null },
      { name: "x₂", value: x2, raw: x2Raw !== x2 ? x2Raw : null }
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
 * @param {"fractional" | "decimal"} format Formato de salida: "fractional" (con radicales e 'i') o "decimal"
 * @returns {object} Resultado del cálculo
 */
export function calculateComplexRoots(a, b, c, format = "fractional") {
  if (a === 0) {
    throw new Error("El coeficiente 'a' no puede ser 0 en una ecuación cuadrática.");
  }

  const delta = calculateDiscriminant(a, b, c);

  // Si delta >= 0, las soluciones son reales (los reales son un subconjunto de los complejos)
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
        { name: "x₁", value: r1, raw: null },
        { name: "x₂", value: r2, raw: null }
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
      { name: "x₁", value: x1, raw: x1Raw !== x1 ? x1Raw : null },
      { name: "x₂", value: x2, raw: x2Raw !== x2 ? x2Raw : null }
    ]
  };
}

/**
 * Función principal unificada para resolver la Fórmula de Bhaskara
 *
 * @param {number|string} rawA Coeficiente a
 * @param {number|string} rawB Coeficiente b
 * @param {number|string} rawC Coeficiente c
 * @param {object} options Opciones de configuración
 * @param {"real" | "complex"} [options.domain="real"] Conjunto numérico objetivo
 * @param {"fractional" | "decimal"} [options.format="fractional"] Formato de raíces
 * @returns {object} Resultado completo con raíces y pasos de resolución
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
