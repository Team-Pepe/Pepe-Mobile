import { supabase } from '../lib/supabase';
import { resolveSpecTableByCategoryName } from './category.service';

// Campos válidos por tabla de especificaciones (alineado al esquema SQL)
export const validFieldsMap = {
  cpu_specifications: [
    'socket', 'cores', 'threads', 'base_frequency_ghz', 'boost_frequency_ghz',
    'cache_l3', 'tdp', 'integrated_graphics', 'fabrication_technology_nm'
  ],
  gpu_specifications: [
    'vram_gb', 'vram_type', 'cuda_cores', 'base_frequency_mhz', 'boost_frequency_mhz',
    'bandwidth_gbs', 'power_connectors', 'length_mm', 'video_outputs'
  ],
  ram_specifications: [
    'capacity_gb', 'type', 'speed_mhz', 'latency', 'modules', 'voltage', 'heat_spreader', 'rgb_lighting'
  ],
  motherboard_specifications: [
    'socket', 'chipset', 'form_factor', 'ram_slots', 'ram_type', 'm2_ports', 'sata_ports', 'usb_ports', 'audio', 'network'
  ],
  storage_specifications: [
    'type', 'capacity_gb', 'interface', 'read_speed_mbs', 'write_speed_mbs', 'form_factor', 'nand_type', 'tbw'
  ],
  psu_specifications: [
    'power_w', 'efficiency_certification', 'modular_type', 'form_factor', 'connectors', 'fan_size_mm', 'active_pfc'
  ],
  case_specifications: [
    'motherboard_formats', 'bays_35', 'bays_25', 'expansion_slots', 'max_gpu_length_mm', 'max_cooler_height_mm', 'psu_type', 'included_fans', 'material'
  ],
  cooler_specifications: [
    'cooler_type', 'compatible_sockets', 'height_mm', 'rpm_range', 'noise_level_db', 'tdp_w'
  ],
  monitor_specifications: [
    'screen_inches', 'resolution', 'refresh_rate_hz', 'panel_type', 'response_time_ms', 'connectors', 'curved'
  ],
  peripheral_specifications: [
    'peripheral_type', 'connectivity', 'mouse_sensor', 'keyboard_switches', 'response_frequency_hz', 'noise_cancellation', 'microphone_type'
  ],
  cable_specifications: [
    'cable_type', 'length_m', 'connectors', 'version', 'shielded'
  ],
  laptop_specifications: [
    'processor', 'ram_gb', 'storage', 'screen_inches', 'resolution', 'graphics_card', 'weight_kg', 'battery_wh', 'operating_system'
  ],
  phone_specifications: [
    'screen_inches', 'resolution', 'processor', 'ram_gb', 'storage_gb', 'main_camera_mp', 'battery_mah', 'operating_system'
  ],
  other_specifications: [
    'general_specifications'
  ]
};

// Campos requeridos por tabla (respeta NOT NULL en SQL)
export const requiredFieldsMap = {
  cpu_specifications: ['socket', 'cores', 'threads', 'base_frequency_ghz'],
  gpu_specifications: ['vram_gb', 'length_mm'],
  motherboard_specifications: ['socket', 'chipset', 'form_factor', 'ram_slots'],
  psu_specifications: ['power_w'],
  ram_specifications: ['capacity_gb', 'type', 'speed_mhz'],
  storage_specifications: ['type', 'capacity_gb'],
  cooler_specifications: ['cooler_type'],
  cable_specifications: ['cable_type']
};

export const SPEC_TABLES = Object.keys(validFieldsMap);

class SpecificationService {
  // Guardar especificaciones del producto en la tabla correspondiente
  static async saveProductSpecifications(productId, categoryId, specifications) {
    try {
      // 1) Resolver nombre de la categoría en BD y obtener la tabla
      const { data: categoryRows, error: catErr } = await supabase
        .from('categories')
        .select('id, name')
        .eq('id', categoryId)
        .limit(1);

      if (catErr) {
        console.error('Error obteniendo categoría para especificaciones:', catErr);
        throw catErr;
      }
      const categoryName = categoryRows && categoryRows[0] ? categoryRows[0].name : '';
      const tableName = resolveSpecTableByCategoryName(categoryName);

      // 2) Construir y filtrar datos según la tabla
      const specDataRaw = { product_id: productId, ...specifications };
      const validFields = validFieldsMap[tableName] || [];
      const specData = Object.keys(specDataRaw)
        .filter((key) => key === 'product_id' || validFields.includes(key))
        .reduce((acc, key) => {
          acc[key] = specDataRaw[key];
          return acc;
        }, {});

      // Limpiar campos vacíos o undefined y convertir números grandes
      Object.keys(specData).forEach(key => {
        if (specData[key] === '' || specData[key] === undefined || specData[key] === null) {
          delete specData[key];
        } else if (typeof specData[key] === 'number') {
          if (specData[key] > 999999999) {
            specData[key] = Math.floor(specData[key] / 1000000);
          }
          if (specData[key] % 1 !== 0) {
            specData[key] = Math.round(specData[key] * 100) / 100;
          }
        } else if (typeof specData[key] === 'string') {
          const numValue = parseFloat(specData[key]);
          if (!isNaN(numValue)) {
            // Validaciones especiales por tabla
            if (key === 'length_m' && tableName === 'cable_specifications' && numValue > 9.99) {
              throw new Error('La longitud del cable no puede exceder 9.99 metros');
            }
            if (key === 'length_mm' && tableName === 'gpu_specifications' && numValue > 999) {
              throw new Error('La longitud de la GPU no puede exceder 999 mm');
            }
            if (tableName === 'ram_specifications') {
              if (key === 'capacity_gb' && numValue > 2147483647) { throw new Error('La capacidad de RAM no puede exceder 2,147,483,647 GB'); }
              if (key === 'speed_mhz' && numValue > 2147483647) { throw new Error('La velocidad de RAM no puede exceder 2,147,483,647 MHz'); }
              if (key === 'modules' && numValue > 2147483647) { throw new Error('El número de módulos de RAM no puede exceder 2,147,483,647'); }
            }
            if (tableName === 'storage_specifications') {
              if (key === 'capacity_gb' && numValue > 2147483647) { throw new Error('La capacidad de almacenamiento no puede exceder 2,147,483,647 GB'); }
              if (key === 'read_speed_mbs' && numValue > 2147483647) { throw new Error('La velocidad de lectura no puede exceder 2,147,483,647 MB/s'); }
              if (key === 'write_speed_mbs' && numValue > 2147483647) { throw new Error('La velocidad de escritura no puede exceder 2,147,483,647 MB/s'); }
              if (key === 'tbw' && numValue > 2147483647) { throw new Error('El TBW no puede exceder 2,147,483,647'); }
            }
            if (tableName === 'psu_specifications') {
              if (key === 'power_w' && numValue > 2147483647) { throw new Error('La potencia de la PSU no puede exceder 2,147,483,647 W'); }
              if (key === 'fan_size_mm' && numValue > 2147483647) { throw new Error('El tamaño del ventilador no puede exceder 2,147,483,647 mm'); }
            }
            if (tableName === 'case_specifications') {
              if (key === 'bays_35' && numValue > 2147483647) { throw new Error('El número de bahías 3.5" no puede exceder 2,147,483,647'); }
              if (key === 'bays_25' && numValue > 2147483647) { throw new Error('El número de bahías 2.5" no puede exceder 2,147,483,647'); }
              if (key === 'expansion_slots' && numValue > 2147483647) { throw new Error('El número de slots de expansión no puede exceder 2,147,483,647'); }
              if (key === 'max_gpu_length_mm' && numValue > 2147483647) { throw new Error('La longitud máxima de GPU no puede exceder 2,147,483,647 mm'); }
              if (key === 'max_cooler_height_mm' && numValue > 2147483647) { throw new Error('La altura máxima del cooler no puede exceder 2,147,483,647 mm'); }
              if (key === 'included_fans' && numValue > 2147483647) { throw new Error('El número de ventiladores incluidos no puede exceder 2,147,483,647'); }
            }
            if (tableName === 'monitor_specifications') {
              if (key === 'refresh_rate_hz' && numValue > 2147483647) { throw new Error('La frecuencia de actualización no puede exceder 2,147,483,647 Hz'); }
              if (key === 'response_time_ms' && numValue > 2147483647) { throw new Error('El tiempo de respuesta no puede exceder 2,147,483,647 ms'); }
            }
            if (tableName === 'peripheral_specifications') {
              if (key === 'response_frequency_hz' && numValue > 2147483647) { throw new Error('La frecuencia de respuesta no puede exceder 2,147,483,647 Hz'); }
            }
            if (tableName === 'laptop_specifications') {
              if (key === 'ram_gb' && numValue > 2147483647) { throw new Error('La cantidad de RAM no puede exceder 2,147,483,647 GB'); }
              if (key === 'battery_wh' && numValue > 2147483647) { throw new Error('La capacidad de la batería no puede exceder 2,147,483,647 Wh'); }
            }
            if (tableName === 'phone_specifications') {
              if (key === 'ram_gb' && numValue > 2147483647) { throw new Error('La cantidad de RAM no puede exceder 2,147,483,647 GB'); }
              if (key === 'storage_gb' && numValue > 2147483647) { throw new Error('La capacidad de almacenamiento no puede exceder 2,147,483,647 GB'); }
              if (key === 'battery_mah' && numValue > 2147483647) { throw new Error('La capacidad de la batería no puede exceder 2,147,483,647 mAh'); }
            }

            if (numValue > 999999999) {
              specData[key] = Math.floor(numValue / 1000000);
            } else if (numValue % 1 !== 0) {
              specData[key] = Math.round(numValue * 100) / 100;
            } else {
              specData[key] = numValue;
            }
          }
        }
      });

      // 3) Validar campos obligatorios según tabla
      const required = requiredFieldsMap[tableName] || [];
      const missing = required.filter((key) => specData[key] === undefined || specData[key] === null || specData[key] === '');
      if (missing.length > 0) {
        throw new Error(`Faltan campos requeridos para ${tableName}: ${missing.join(', ')}`);
      }

      // 4) Insertar las especificaciones
      const { data, error } = await supabase
        .from(tableName)
        .insert([specData]);

      if (error) {
        console.error('Error guardando especificaciones:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error en saveProductSpecifications:', error);
      throw error;
    }
  }

  // Obtener especificaciones del producto, con fallback robusto entre tablas
  static async getProductSpecifications(productId, categoryName = '') {
    try {
      const initialTable = resolveSpecTableByCategoryName(categoryName);

      const tryFetch = async (table) => {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .eq('product_id', productId)
          .limit(1);
        if (error) {
          console.warn(`Error consultando ${table}:`, error.message);
          return null;
        }
        return data && data[0] ? data[0] : null;
      };

      // Intento inicial
      let row = await tryFetch(initialTable);
      // Si no hay datos, intentar la tabla genérica legacy
      if (!row) {
        const legacy = await tryFetch('product_specifications');
        if (legacy) row = legacy;
      }
      // Si aún no hay datos o la categoría es muy genérica, probar todas las tablas conocidas
      if (!row || initialTable === 'other_specifications') {
        for (const table of SPEC_TABLES) {
          const maybe = await tryFetch(table);
          if (maybe) { row = maybe; break; }
        }
      }

      // Si aún no hay datos, retornar objeto vacío
      if (!row) return {};

      // Filtrar valores vacíos y conservar sólo campos válidos
      const final = Object.entries(row)
        .filter(([key, value]) => key !== 'product_id' && key !== 'id' && value !== null && value !== undefined && value !== '')
        .reduce((acc, [key, value]) => { acc[key] = value; return acc; }, {});

      return final;
    } catch (error) {
      console.error('Error en getProductSpecifications:', error);
      return {};
    }
  }
}

export default SpecificationService;