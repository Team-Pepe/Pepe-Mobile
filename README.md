# Pepe Mobile (PepePlace)

Aplicación móvil construida con Expo + React Native para explorar y comparar componentes de PC, armar tu propia configuración y chatear con la comunidad. Incluye un builder de PC con cálculo de consumo y compatibilidad, comparación Versus, favoritos y mensajería en tiempo real sobre Supabase.

## Características

- Catálogo y búsqueda de productos por categoría
- Favoritos y reseñas de usuarios
- Versus: comparación lado a lado con etiquetas y gráficos
- Mi PC (builder):
  - Selección por slots: CPU, GPU, Motherboard, RAM, PSU, Almacenamiento, Gabinete, Cooling
  - Cálculo de consumo estimado y PSU recomendada
  - Chequeos básicos de compatibilidad (sockets, formatos, longitudes, bahías, etc.)
  - Botón de recarga en el header para limpiar todo con feedback animado
  - Total en el header: suma en tiempo real de los componentes seleccionados
- Comunidades y chat:
  - Conversaciones directas y de grupos
  - Auto-scroll al último mensaje, botón flotante para volver al final, manejo de teclado
  - Estados de mensaje: enviado, entregado, leído

## Stack

- Expo SDK 54, React 19.1.0, React Native 0.81.4
- React Navigation (Tabs + Stack)
- Supabase (auth, base de datos y realtime)
- AsyncStorage para persistencia de sesión
- Vector Icons (`@expo/vector-icons`)

## Requisitos

- Node.js LTS
- npm o Yarn
- Expo CLI (opcional pero recomendado)
- Cuenta y proyecto en Supabase

## Instalación

```bash
# Clonar el repo
git clone <https://github.com/Team-Pepe/Pepe-Mobile>
cd Pepe-Mobile

# Instalar dependencias
npm install
```

## Configuración

El proyecto usa Supabase para autenticación, datos y realtime.

- Variables necesarias:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`

Actualmente la configuración se resuelve en `src/lib/supabase.js`. Para producción se recomienda externalizar claves a variables de entorno (p. ej. `.env`) y no comprometer secretos en el repositorio.

## Ejecutar

```bash
# Iniciar el proyecto
npm start

# Lanzar en Android
npm run android

# Lanzar en iOS
npm run ios

# Lanzar en Web
npm run web
```

## Estructura del proyecto

```
src/
  navigation/          Navegación (Tabs + Stack)
  screens/             Pantallas (auth, home, pc-builder, comparison, communities, profile)
  services/            Servicios (productos, usuarios, mensajes, conversaciones, auth)
  lib/                 Integraciones (Supabase client)
  utils/               Utilidades compartidas (eventBus, pcTotal, formatPrice)
  components/          Componentes reutilizables de UI (HeaderRefreshButton, HeaderPCTotal)
```

## Módulos y utilidades

- `src/utils/eventBus.js`
  - Bus de eventos simple con `on`, `off`, `emit`
  - Usado para acciones cross-pantalla (p. ej. limpiar builder / versus, publicar total al header)

- `src/components/HeaderRefreshButton.js`
  - Botón de header con animación táctil (rotación + micro-scale)
  - Se invoca con `onPress` para emitir el evento de limpieza deseado

- `src/components/HeaderPCTotal.js`
  - Componente de header que muestra el total del builder
  - Suscrito a `MYPC_TOTAL` (emitido desde `MyPCScreen`)

- `src/utils/pcTotal.js`
  - `sumSelectedPrices(selected)`: suma los precios de los productos seleccionados

## Pantallas clave

- `screens/pc-builder/MyPCScreen.js`
  - Estado por slot (`search`, `results`, `selected`, `specs`)
  - Cálculo de consumo (`power`) y compatibilidad
  - Emite `MYPC_TOTAL` cuando cambia `selected` para actualizar el header
  - Escucha `RESET_MYPC` para limpiar todo

- `screens/comparison/VersusScreen.js`
  - Búsqueda por categoría y lado izquierdo/derecho
  - Obtiene y muestra especificaciones
  - Escucha `RESET_VERSUS` para limpiar todo

- `screens/communities/ChatScreen.js`
  - Lista invertida, `maintainVisibleContentPosition`, espaciador dinámico para teclado
  - Botón flotante “volver al final” y autoscroll al enviar/recibir

## Convenciones

- Mantener claves y secretos fuera del repositorio en producción
- Reutilizar utilidades (`eventBus`, componentes de header) para modularidad
- Preferir estilos y patrones consistentes con el resto del código

## Despliegue

- Expo: usar `eas build` / `eas submit` (si está configurado)
- Web: `npm run web` para desarrollo, configurar hosting estático si se requiere

## Contribuir

- Crear rama por feature
- Hacer PR con descripción y capturas
- Revisar que no se introduzcan secretos

## Licencia

MIT
