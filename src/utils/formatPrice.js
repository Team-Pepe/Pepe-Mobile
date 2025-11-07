/**
 * Formatea un número al formato de pesos colombianos
 * Ejemplo: 900000 -> "900.000"
 * @param {number|string} price - El precio a formatear
 * @returns {string} El precio formateado con separadores de miles
 */
export const formatPriceCOP = (price) => {
  if (!price && price !== 0) return '0';
  
  // Convertir a número y eliminar decimales si los hay
  const numPrice = parseFloat(price);
  if (isNaN(numPrice)) return '0';
  
  // Convertir a entero y formatear con separadores de miles
  const intPrice = Math.floor(numPrice);
  return intPrice.toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });
};

/**
 * Formatea un precio para mostrar con el símbolo de pesos colombianos
 * Ejemplo: 900000 -> "$900.000"
 * @param {number|string} price - El precio a formatear
 * @returns {string} El precio formateado con símbolo COP
 */
export const formatPriceWithSymbol = (price) => {
  return `$${formatPriceCOP(price)}`;
};