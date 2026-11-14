# Interval Timer

Temporizador de intervalos de una sola pantalla para entrenamientos y sesiones
de contraste frío/calor. Instalable como PWA, funciona sin conexión y guarda tu
última configuración en el propio dispositivo.

- **Nombre**: Interval Timer · **Nombre corto**: Intervals
- **Interfaz**: en inglés (el código y los comentarios también)
- **Estilo**: oscuro, minimalista, paleta desaturada, pensado para móvil
- **Demo**: https://intervals-timer.netlify.app

---

## Funciones

### Configuración

- Lista de fases ordenadas (hasta **24**). Cada fase tiene un tipo y una
  duración:
  - **Work** (ámbar), **Rest** (verde apagado), **Hot** (terracota),
    **Cold** (azul), **Change** (malva). `Change` es el cambio de estación
    (5–10 s típicamente).
- Añadir, cambiar de tipo y eliminar fases.
- Editar duración de tres formas:
  1. **±5 s** con los botones de la fila.
  2. **Toque en la duración** abre una hoja inferior con:
     - botones grandes **− / +** de 5 s (mantén pulsado para repetir),
     - chips rápidos (0:10, 0:30, 1:00, 3:00, 5:00),
     - entrada numérica exacta: `90` o `1:30` o `1:02:03`.
  3. Límites: 1 s – 59:59 por fase.
- **Get ready**: pausa antes de **cada** fase (0–60 s en pasos de 5; `Off`
  desactiva). Se inserta antes de todas, incluida la primera: ya no hay una
  única cuenta inicial, cada fase tiene su cuenta atrás.
- **Rounds**: la secuencia completa se repite N veces (1–50). Sin bloques
  anidados.
- Por defecto: 4 rondas, Get ready 5 s, Work 3:00 + Rest 1:00 → **16:40**.

### Ejecución

- Anillo de progreso, tiempo restante grande, tipo de fase, ronda actual y
  siguiente fase con su duración. Las pausas **Get ready** se muestran como un
  paso más, con la fase que viene a continuación.
- **Pausa / reanudar**, **+30 s** a la fase actual (desplaza el resto de la
  sesión), **saltar fase** (también salta el Get ready).
- **Hold to end**: mantén pulsado ~0,8 s para terminar sin accidentes.
- Pantalla de fin con resumen, **Edit** (volver a la configuración) y **Again**
  (repetir la misma sesión).

### Avisos

- **Sonido sintetizado** con Web Audio (sin archivos de audio):
  - doble pitido distinto por tipo de fase (puedes oír qué viene),
  - tics 3-2-1 solo en fases de 5 s o más,
  - triada ascendente al terminar.
- **Vibración** con `navigator.vibrate` (patrón distinto por evento).
- Ambos se pueden silenciar desde la cabecera; la preferencia se recuerda.
- El audio se desbloquea en el primer toque (política de autoplay móvil).

### Persistencia

Solo se guarda lo último aplicado, más toggles e historial:

| Clave                          | Contenido                                  |
| ------------------------------ | ------------------------------------------ |
| `interval-timer.config.v1`     | Configuración aplicada al pulsar **Start** |
| `interval-timer.settings.v1`   | `sound` / `vibrate`                        |
| `interval-timer.history.v1`    | Últimas 5 sesiones completadas             |

La configuración se guarda **solo al iniciar** una sesión: editar no persiste
hasta que le das a Start. Un enlace compartido carga un borrador y tampoco se
guarda hasta que inicias.

### Compartir

- **Share setup** usa `navigator.share` si existe; si no, copia el enlace.
- Formato: `#c=<base64url(JSON)>` con `{ v:2, r, g, f }`. Los enlaces `v:1`
  antiguos se siguen leyendo: su cuenta inicial (`p`) pasa a ser el Get ready
  de cada fase.
- Al abrir el enlace se carga como borrador, se limpia el hash y se muestra un
  aviso. Un enlace corrupto se ignora sin romper la app.

### Historial

- Las últimas 5 sesiones **completadas** (no las canceladas) con fecha, rondas,
  duración y fases.
- Se puede vaciar desde la hoja de historial.

### Atajos de teclado (escritorio)

| Tecla    | Acción                          |
| -------- | ------------------------------- |
| `Enter`  | Iniciar / repetir               |
| `Space`  | Pausa / reanudar                |
| `→`      | Saltar fase                     |
| `S`      | +30 s                           |
| `Esc`    | Terminar / volver a configurar  |

---

## PWA

- `manifest.webmanifest` con `display: standalone`, orientación vertical y
  colores del tema.
- Service worker (Workbox, `generateSW`) precachea HTML, JS, CSS, iconos y
  fuentes: la app abre **offline** tras la primera visita.
- Iconos generados por script (`npm run icons`), incluido uno *maskable*.
- La build es **portable**: `base: './'`, así que puedes servirla desde
  cualquier subcarpeta (GitHub Pages, Netlify, un NAS…).

### Instalar

1. Sirve `dist/` por **HTTPS** (o `http://localhost` para probar).
2. Abre la URL en el móvil.
3. iOS/Safari: **Compartir → Añadir a pantalla de inicio**.
   Android/Chrome: menú **Instalar aplicación**.

### Limitaciones reales

- **iOS no expone la API de vibración**: en iPhone el toggle aparece
  deshabilitado con una nota. El sonido sí funciona.
- En segundo plano el navegador puede congelar la pestaña. El motor usa marcas
  de tiempo absolutas y se pone al día al volver (`visibilitychange`), pero los
  avisos sonoros de fases ocurridas mientras estaba oculto no se recuperan.
- **Wake Lock** evita que se apague la pantalla mientras corre la sesión; si el
  navegador lo deniega, el temporizador sigue funcionando igual.
- El audio necesita un gesto del usuario; se desbloquea al pulsar Start.
- En iOS, el silencio del dispositivo silencia el audio web.

---

## Desarrollo

> **Importante**: este proyecto vive en una ruta UNC de WSL. npm en Windows no
> puede ejecutar postinstalls ahí (`CMD.EXE` no soporta rutas UNC), así que usa
> el toolchain de **Linux dentro de WSL**.

```bash
wsl -d Ubuntu
cd /home/aker/wd/dev/IntervalTimer
node -v   # probado con v26.13.0
npm install
```

### Scripts

```bash
npm run dev      # servidor de desarrollo con HMR
npm run test     # 47 tests (Vitest)
npm run build    # tsc --noEmit + vite build + PWA
npm run preview  # sirve dist/ (útil para probar el SW)
npm run icons    # regenera public/icons/*.png
```

### Stack

- **SolidJS 1.9** + TypeScript 5.9
- **Vite 7.3** (`vite-plugin-solid`, `vite-plugin-pwa` 2.0)
- **Tailwind CSS 4.3** (tokens en `@theme`, sin archivo de config)
- **Vitest 5** para la lógica pura (`timeline`, `time`, `storage`, `share`)

### Estructura

```
src/
  App.tsx                 estado de app, atajos, share/historial, cambio de pantalla
  state/session.ts        motor de temporizador (rAF + intervalo de 250 ms)
  components/
    Setup.tsx             pantalla de configuración
    PhaseRow.tsx          fila de fase con steppers inline
    TimeSheet.tsx         hoja de duración (chips + entrada numérica)
    Sheet.tsx             hoja inferior reutilizable
    Run.tsx               pantalla de ejecución
    Ring.tsx              anillo de progreso SVG
    Done.tsx              resumen final
    HistorySheet.tsx      últimas 5 sesiones
    Stepper.tsx           stepper genérico (rondas, get ready)
    HoldButton.tsx        pulsación mantenida (fin de sesión)
    ToggleButton.tsx      toggles de cabecera
    Toast.tsx             avisos efímeros
    icons.tsx             iconos SVG inline
  lib/
    timeline.ts           expansión de config en timeline absoluta
    time.ts               formato, parseo y clamps
    storage.ts            localStorage + saneado de datos
    share.ts              codificar/decodificar enlaces
    audio.ts              cues sintetizados (Web Audio)
    haptics.ts            vibración
    wakelock.ts           Screen Wake Lock
  types.ts                modelo de datos
  styles.css              tokens, utilidades safe-area, animaciones
scripts/generate-icons.mjs  generador PNG sin dependencias
```

### Detalles del motor

- El tiempo se basa en `Date.now()` y se muestrea con `requestAnimationFrame`
  más un `setInterval` de 250 ms (para pestañas con rAF limitado).
- `stepIndexAt` trata los límites como el inicio del siguiente paso.
- `buildTimeline` inserta un paso `ready` antes de cada fase si
  `readySecs > 0`, así que el Get ready se repite en cada ronda.
- El display usa `Math.ceil`, así que una fase de 3 s muestra 0:03 → 0:01.
- `+30 s` usa `extendStep`, que alarga el paso actual y desplaza todos los
  posteriores (la sesión se alarga de verdad).
- Wake Lock se libera al terminar o cancelar, y se mantiene durante la pausa.

---

## Deploy

```bash
npm run build
# sube el contenido de dist/ a cualquier hosting estático con HTTPS
```

Al ser rutas relativas, funciona igual en la raíz o en `/interval-timer/`.

## Fuera de alcance (v1)

Presets integrados, avisos por voz, flash de pantalla, beep de mitad de fase,
tema claro y backend. El historial y la configuración viven solo en el
dispositivo.
