// Importar y exportar todos los componentes de especificaciones
export { default as CpuSpecifications } from './CpuSpecifications';
export { default as GpuSpecifications } from './GpuSpecifications';
export { default as RamSpecifications } from './RamSpecifications';
export { default as StorageSpecifications } from './StorageSpecifications';
export { default as MotherboardSpecifications } from './MotherboardSpecifications';
export { default as PsuSpecifications } from './PsuSpecifications';
export { default as CoolerSpecifications } from './CoolerSpecifications';
export { default as CaseSpecifications } from './CaseSpecifications';
export { default as MonitorSpecifications } from './MonitorSpecifications';
export { default as LaptopSpecifications } from './LaptopSpecifications';
export { default as PhoneSpecifications } from './PhoneSpecifications';
export { default as PeripheralSpecifications } from './PeripheralSpecifications';
export { default as CableSpecifications } from './CableSpecifications';
export { default as OtherSpecifications } from './OtherSpecifications';

// Importar componentes para usar en la función getSpecificationComponent
import CpuSpecifications from './CpuSpecifications';
import GpuSpecifications from './GpuSpecifications';
import RamSpecifications from './RamSpecifications';
import StorageSpecifications from './StorageSpecifications';
import MotherboardSpecifications from './MotherboardSpecifications';
import PsuSpecifications from './PsuSpecifications';
import CoolerSpecifications from './CoolerSpecifications';
import CaseSpecifications from './CaseSpecifications';
import MonitorSpecifications from './MonitorSpecifications';
import LaptopSpecifications from './LaptopSpecifications';
import PhoneSpecifications from './PhoneSpecifications';
import PeripheralSpecifications from './PeripheralSpecifications';
import CableSpecifications from './CableSpecifications';
import OtherSpecifications from './OtherSpecifications';

// Mapeo de nombres de categorías a componentes
// Normaliza el nombre (minúsculas, sin acentos, sin espacios extra)
const normalizeName = (name) =>
  (name || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

// Devuelve true si alguno de los patrones coincide en el nombre normalizado
const matchesAny = (normalized, patterns) =>
  patterns.some((p) => {
    if (p instanceof RegExp) return p.test(normalized);
    return normalized.includes(p);
  });

export const getSpecificationComponent = (categoryName) => {
  const n = normalizeName(categoryName);

  // Orden de chequeo pensado para evitar confusiones entre RAM/GPU/Motherboard
  if (matchesAny(n, [/\bmotherboard\b/, 'placa base', 'placas base'])) {
    return MotherboardSpecifications;
  }
  if (matchesAny(n, [/\bgpu\b/, 'tarjeta grafica', 'tarjetas graficas', 'grafica'])) {
    return GpuSpecifications;
  }
  if (matchesAny(n, [/\bram\b/, 'memoria ram', /^memoria$/])) {
    return RamSpecifications;
  }
  if (matchesAny(n, [/\bcpu\b/, 'procesador', 'procesadores'])) {
    return CpuSpecifications;
  }
  if (matchesAny(n, ['storage', 'almacenamiento'])) {
    return StorageSpecifications;
  }
  if (matchesAny(n, [/\bpsu\b/, 'fuente de poder', 'fuentes de poder'])) {
    return PsuSpecifications;
  }
  if (matchesAny(n, ['cooler', 'refrigeracion', 'refrigeración', 'enfriamiento'])) {
    return CoolerSpecifications;
  }
  if (matchesAny(n, ['case', 'gabinete', 'gabinetes', 'caja', 'cajas'])) {
    return CaseSpecifications;
  }
  if (matchesAny(n, ['monitor', 'monitores', 'pantalla', 'pantallas'])) {
    return MonitorSpecifications;
  }
  if (matchesAny(n, ['laptop', 'laptops', 'portatil', 'portatiles', 'portables'])) {
    return LaptopSpecifications;
  }
  if (matchesAny(n, ['phone', 'telefono', 'telefonos', 'movil', 'moviles'])) {
    return PhoneSpecifications;
  }
  if (matchesAny(n, ['peripheral', 'periferico', 'perifericos', 'accesorio', 'accesorios'])) {
    return PeripheralSpecifications;
  }
  if (matchesAny(n, ['cable', 'cables'])) {
    return CableSpecifications;
  }

  return OtherSpecifications;
};