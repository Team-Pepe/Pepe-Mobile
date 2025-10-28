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
export const getSpecificationComponent = (categoryName) => {
  const componentMap = {
    // Componentes originales
    'cpu': CpuSpecifications,
    'gpu': GpuSpecifications,
    'ram': RamSpecifications,
    'storage': StorageSpecifications,
    'motherboard': MotherboardSpecifications,
    'psu': PsuSpecifications,
    
    // Nuevos componentes
    'cooler': CoolerSpecifications,
    'case': CaseSpecifications,
    'monitor': MonitorSpecifications,
    'laptop': LaptopSpecifications,
    'phone': PhoneSpecifications,
    'peripheral': PeripheralSpecifications,
    'cable': CableSpecifications,
    'other': OtherSpecifications,
    
    // Mapeos en español - componentes originales
    'procesador': CpuSpecifications,
    'procesadores': CpuSpecifications,
    'tarjeta gráfica': GpuSpecifications,
    'tarjetas gráficas': GpuSpecifications,
    'memoria ram': RamSpecifications,
    'memoria': RamSpecifications,
    'almacenamiento': StorageSpecifications,
    'placa base': MotherboardSpecifications,
    'placas base': MotherboardSpecifications,
    'fuente de poder': PsuSpecifications,
    'fuentes de poder': PsuSpecifications,
    
    // Mapeos en español - nuevos componentes
    'refrigeración': CoolerSpecifications,
    'refrigeracion': CoolerSpecifications,
    'enfriamiento': CoolerSpecifications,
    'gabinete': CaseSpecifications,
    'gabinetes': CaseSpecifications,
    'caja': CaseSpecifications,
    'cajas': CaseSpecifications,
    'monitores': MonitorSpecifications,
    'pantalla': MonitorSpecifications,
    'pantallas': MonitorSpecifications,
    'laptops': LaptopSpecifications,
    'portátil': LaptopSpecifications,
    'portátiles': LaptopSpecifications,
    'portables': LaptopSpecifications,
    'teléfono': PhoneSpecifications,
    'teléfonos': PhoneSpecifications,
    'telefono': PhoneSpecifications,
    'telefonos': PhoneSpecifications,
    'móvil': PhoneSpecifications,
    'móviles': PhoneSpecifications,
    'movil': PhoneSpecifications,
    'moviles': PhoneSpecifications,
    'periférico': PeripheralSpecifications,
    'periféricos': PeripheralSpecifications,
    'periferico': PeripheralSpecifications,
    'perifericos': PeripheralSpecifications,
    'accesorio': PeripheralSpecifications,
    'accesorios': PeripheralSpecifications,
    'cables': CableSpecifications,
    'cable': CableSpecifications,
    'otros': OtherSpecifications,
    'otro': OtherSpecifications,
    'general': OtherSpecifications,
    'generales': OtherSpecifications,
  };

  const normalizedName = categoryName.toLowerCase();
  return componentMap[normalizedName] || OtherSpecifications; // Usar OtherSpecifications como fallback
};