# EjemplOS

Un sistema operativo web simulado construido con React, Next.js y TypeScript que replica la experiencia de un escritorio moderno.

## Capturas

El sistema incluye un escritorio interactivo con iconos arrastrables, ventanas redimensionables y una barra de tareas funcional.

## Tecnologías

- **Framework:** Next.js 16
- **Lenguaje:** TypeScript 5
- **UI:** React 19
- **Estilos:** Tailwind CSS 4
- **Componentes:** Radix UI + shadcn/ui
- **Iconos:** Lucide React

## Características

### Sistema de Ventanas
- Ventanas arrastrables y redimensionables
- Minimizar, maximizar y cerrar
- Z-index dinámico (ventana activa siempre al frente)
- Botones de control estilo macOS

### Aplicaciones Incluidas

| Aplicación | Descripción |
|------------|-------------|
| **Navegador** | Navegador web funcional con iframe |
| **Finder** | Explorador de archivos con navegación |
| **Paint** | Aplicación de dibujo con canvas |
| **Buscaminas** | Juego clásico de buscaminas |
| **Tetris** | Juego Tetris completo |
| **Snake** | Juego de la serpiente |
| **2048** | Puzzle numérico 2048 |

### Paint
- Herramientas: Lápiz y Borrador
- Selector de color
- Control de tamaño del pincel
- Guardar imágenes (PNG)
- Las imágenes se guardan en el Finder

### Finder (Explorador de Archivos)
- Navegación por carpetas
- Búsqueda en tiempo real
- Visualización de imágenes guardadas desde Paint
- Reproductor de música integrado
- Accesos directos a aplicaciones

### Barra de Tareas
- Menú de inicio con aplicaciones
- Iconos de acceso rápido
- Centro de control con reproductor de música
- Reloj del sistema
- Ventanas minimizadas

### Escritorio
- Iconos arrastrables
- Menú contextual (click derecho)
- Accesos directos a aplicaciones

## Instalación

```bash
# Clonar el repositorio
git clone https://github.com/JairoMS27/ejemplOS.git

# Entrar al directorio
cd ejemplOS

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

El proyecto estará disponible en `http://localhost:3000`

## Scripts

```bash
npm run dev      # Servidor de desarrollo
npm run build    # Construir para producción
npm run start    # Iniciar servidor de producción
npm run lint     # Ejecutar linter
```

## Estructura del Proyecto

```
ejemplOS/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página principal (OS)
├── components/
│   ├── apps/              # Aplicaciones
│   │   ├── browser-window.tsx
│   │   ├── finder-window.tsx
│   │   ├── paint-window.tsx
│   │   ├── minesweeper-window.tsx
│   │   ├── tetris-window.tsx
│   │   ├── snake-window.tsx
│   │   └── game-2048.tsx
│   ├── window.tsx         # Componente ventana base
│   ├── window-manager.tsx # Gestor de ventanas
│   ├── desktop.tsx        # Escritorio
│   ├── taskbar.tsx        # Barra de tareas
│   └── ui/                # Componentes UI (shadcn)
├── lib/                   # Utilidades
│   ├── audio-context.tsx  # Contexto de audio
│   └── utils.ts
├── styles/
│   └── globals.css        # Estilos globales
└── public/                # Assets estáticos
```

## Cómo Añadir una Nueva Aplicación

1. Crear componente en `components/apps/mi-app-window.tsx`
2. Registrar tipo en `app/page.tsx` (openWindows type)
3. Añadir renderizado en `components/window-manager.tsx`
4. Opcional: Añadir icono en desktop y/o taskbar

## Almacenamiento

- **localStorage:** Imágenes de Paint, configuraciones
- Las imágenes guardadas en Paint aparecen automáticamente en el Finder

## Licencia

MIT License - Ver archivo LICENSE para más detalles.

## Autor

Desarrollado por [Jairo](https://jairoms.is-a.dev)

---

**Versión:** BETA 1.0
