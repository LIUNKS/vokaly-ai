# Vokaly Prep — Especificación UI Sesión en Vivo (`/sesion/[id]`)

**Documento:** Live Session UI Spec
**Propósito:** Definir la interfaz de usuario, componentes, integración con `@vapi-ai/web`, estados visuales de la llamada y controles para la Sesión en Vivo (Track B).

---

## 1. Alcance y Objetivos

La pantalla de Sesión en Vivo (`/sesion/[id]`) es la interfaz principal donde el candidato realiza la entrevista de práctica con el Entrevistador IA de Vapi.

- **Integración con Vapi Web SDK:** Manejo de conexión de audio, niveles de micrófono/altavoz, eventos `call-start`, `call-end`, `speech-start`, `speech-end`, `volume-level` y manejo de errores.
- **Transiciones de Estado Visual:**
  - `configurando`: Muestra resumen de la sesión (Track, Seniority, Empresa Ref) y botón "Iniciar Entrevista".
  - `en_vivo`: Muestra avatar/onda del entrevistador IA, temporizador activo, estado de habla (IA hablando / Candidato hablando) y botón "Finalizar Entrevista".
  - `concluida`: Muestra pantalla de transición hacia el Scorecard con resumen y estado final.
- **Independencia vía Mocks:** En desarrollo sin backend/Auth completo, se inicializa con `VAPI_SESSION_MOCK` desde `src/lib/mocks/index.ts`.

---

## 2. Componentes de la Pantalla (`src/app/sesion/[id]/`)

```
src/app/sesion/[id]/
├── page.tsx               # Client component host de la sesión
├── components/
│   ├── SessionHeader.tsx  # Barra superior (Track, Empresa, Badge de Estado)
│   ├── AudioVisualizer.tsx# Indicador visual de voz (onda/volumen de Vapi)
│   ├── CallControls.tsx   # Botones de Mute, Iniciar y Concluir llamada
│   └── SessionSummary.tsx # Tarjeta de resumen de configuración
```

---

## 3. Manejo de Estados con `@vapi-ai/web`

### Eventos a Escuchar:
- `call-start`: Cambia estado UI a `en_vivo`, inicia temporizador.
- `call-end`: Cambia estado UI a `concluida`, navega o muestra mensaje de éxito.
- `speech-start` / `speech-end`: Muestra indicador "Entrevistador hablando..." o "Tu turno...".
- `volume-level`: Alimenta las barras visuales del `AudioVisualizer`.
- `error`: Muestra notificación de error de micrófono/conexión.

---

## 4. Diseño y Aesthetics (Modern Dark Theme)

- **Paleta de Colores:** Fondo oscuro profundo (`#090d16`), acentos en cian/violeta brillante (`#6366f1` / `#06b6d4`), vidrio translúcido (`backdrop-blur-md`).
- **Feedback Visual:**
  - Anillo pulsante cian cuando la IA habla.
  - Anillo verde cuando el candidato habla.
  - Badge rojo "EN VIVO" con punto titilante.
